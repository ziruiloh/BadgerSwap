import { auth, db } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const signUp = async (email, password, name) => {
  if (!email.toLowerCase().endsWith("@wisc.edu")) {
    throw new Error("Please use a UW–Madison email.");
  }

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // Send verification email at signup
  try {
    await user.sendEmailVerification();
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

  // If email not verified -> block login
  if (!user.emailVerified) {
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
    await user.sendEmailVerification();
    return true;
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
};
