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
  await user.sendEmailVerification();

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

  // ADDITION: Send another verification email every successful login
  try {
    await user.sendEmailVerification();
  } catch (e) {
    console.log("Failed to send login verification email:", e);
  }

  // RETURN ORIGINAL VALUE
  return userCred;
};
