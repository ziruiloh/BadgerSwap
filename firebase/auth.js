import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

export const signUp = async (email, password, name) => {
  if (!email.toLowerCase().endsWith("@wisc.edu")) {
    throw new Error("Please use a UW–Madison email.");
  }

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // Send verification email at signup
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    bio: '',
    reputationScore: 5, // Default reputation score for new users
    createdAt: serverTimestamp(),
  });

  return user;
};

export const logIn = async (email, password) => {
  if (!email.toLowerCase().endsWith("@wisc.edu")) {
    throw new Error("Only UW–Madison accounts are allowed.");
  }

  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // If email not verified -> sign out and throw error
  // Don't auto-send verification email here to avoid rate limiting
  // User can use resendVerificationEmail() if needed
  if (!user.emailVerified) {
    await auth.signOut();
    const error = new Error("Email not verified. Please check your inbox or request a new verification email.");
    error.code = "auth/email-not-verified";
    throw error;
  }

  return userCred;
};

// Resend verification email - requires email/password since user is signed out after failed login
export const resendVerificationEmail = async (email, password) => {
  try {
    // Sign in temporarily to send verification email
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCred.user);
    await auth.signOut();
    return true;
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
};
