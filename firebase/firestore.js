import { db } from "./config";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add a product
export const addProduct = async (product) => {
  const docRef = await addDoc(collection(db, "products"), product);
  return docRef.id;
};

// Get all products
export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


// //database CRUD functions (listings, user, chats)
// users/
//   userId
//     name
//     email
//     profilePhoto
//     reputationScore
//     dateCreated
// listings/
//   listingId
//     title
//     description
//     category
//     price
//     images[]
//     sellerId
//     datePosted
// messages/
//   chatId
//     participants[]
//     lastMessage
//     messages[]
// reports/
//   reportId
//     reporterId
//     targetId (user or listing)
//     reason
//     date
