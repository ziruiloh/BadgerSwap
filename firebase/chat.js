import { db } from "./config";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

/**
 * Create or get existing conversation
 */
export const getOrCreateConversation = async (buyerId, sellerId, productId, productTitle, sellerName) => {
  const convQuery = query(
    collection(db, "conversations"),
    where("buyerId", "==", buyerId),
    where("sellerId", "==", sellerId),
    where("productId", "==", productId)
  );

  let existing = null;

  return new Promise((resolve, reject) => {
    onSnapshot(convQuery, async (snapshot) => {
      if (!snapshot.empty) {
        existing = snapshot.docs[0];
        resolve({ id: existing.id, ...existing.data() });
      } else {
        // CREATE NEW CONVERSATION
        const newConvRef = await addDoc(collection(db, "conversations"), {
          buyerId,
          sellerId,
          productId,
          productTitle,
          sellerName,
          lastMessage: "",
          timestamp: serverTimestamp(),
        });

        resolve({
          id: newConvRef.id,
          buyerId,
          sellerId,
          productId,
          productTitle,
          sellerName,
          lastMessage: "",
          timestamp: new Date(),
        });
      }
    });
  });
};

/**
 * Send message
 */
export const sendMessage = async (conversationId, senderId, text) => {
  const msgRef = collection(db, "conversations", conversationId, "messages");

  await addDoc(msgRef, {
    text,
    senderId,
    timestamp: serverTimestamp(),
  });

  // Update last message on conversation
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    timestamp: serverTimestamp(),
  });
};

/**
 * Listen to messages in real-time
 */
export const subscribeToMessages = (conversationId, callback) => {
  const msgQuery = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(msgQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(messages);
  });
};

