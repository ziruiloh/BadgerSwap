//handles signup/login/logout
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Sign up - create account using Firebase auth and store user in Firestore
export const signUp = async (email, password) => {
  if (!email.endsWith("@wisc.edu")) {
    throw new Error("Please use a UW–Madison email.");
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Store custom fields in Firestore with default values
  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName || null,
    email: user.email,
    bio: "New Badger at UW-Madison 🦡",
    reputation: 5.0,
    createdAt: new Date(),
  });
  
  return userCredential;
};

// Login
export const logIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};