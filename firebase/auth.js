//handles signup/login/logout
import { auth } from "./config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Sign up
export const signUp = async (email, password) => {
  if (!email.endsWith("@wisc.edu")) {
    throw new Error("Please use a UW–Madison email.");
  }
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Login
export const logIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};