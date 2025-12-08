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

  // If email not verified -> send verification email then sign out
  if (!user.emailVerified) {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
    await auth.signOut();
    const error = new Error("Email not verified.");
    error.code = "auth/email-not-verified";
    throw error;
  }

  return userCred;
};

// Resend verification email
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user logged in.");
  }

  try {
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
};
