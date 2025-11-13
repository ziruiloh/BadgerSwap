// firebase initialization (api key, projectId)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
<<<<<<< HEAD
// import data from "./products.json" assert { type: "json" };
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
=======
>>>>>>> shreya

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiZSJfcQP7WdPDhzPzVZSOgSYuMJ9gkJE",
  authDomain: "badgerswap.firebaseapp.com",
  projectId: "badgerswap",
  storageBucket: "badgerswap.firebasestorage.app",
  messagingSenderId: "239114160901",
  appId: "1:239114160901:web:d5f3e0b787cd6a519e456c",
  measurementId: "G-B0JR1F2KZZ"
};

<<<<<<< HEAD

=======
>>>>>>> shreya
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

<<<<<<< HEAD


// for (const product of data) {
//   await addDoc(collection(db, "products"), product);
// }

// console.log("Data uploaded successfully!");
=======
>>>>>>> shreya
