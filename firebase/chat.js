import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./config";

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
        // Fetch buyer name from users collection
        let buyerName = "Buyer";
        try {
          const buyerDoc = await getDoc(doc(db, "users", buyerId));
          buyerName = buyerDoc.data()?.name || "Buyer";
        } catch (err) {
          console.error('Error fetching buyer name:', err);
        }

        // CREATE NEW CONVERSATION
        const newConvRef = await addDoc(collection(db, "conversations"), {
          buyerId,
          buyerName,
          sellerId,
          productId,
          productTitle,
          sellerName,
          lastMessage: "",
          timestamp: serverTimestamp(),
          unreadByBuyer: 0,
          unreadBySeller: 0,
        });

        resolve({
          id: newConvRef.id,
          buyerId,
          buyerName,
          sellerId,
          productId,
          productTitle,
          sellerName,
          lastMessage: "",
          timestamp: new Date(),
          unreadByBuyer: 0,
          unreadBySeller: 0,
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

  // Get conversation to determine who to increment unread for
  const convDoc = await getDoc(doc(db, "conversations", conversationId));
  const convData = convDoc.data();
  
  // Increment unread count for the recipient (not the sender)
  const updateData = {
    lastMessage: text,
    timestamp: serverTimestamp(),
  };
  
  if (senderId === convData.buyerId) {
    // Buyer sent message, increment seller's unread
    updateData.unreadBySeller = (convData.unreadBySeller || 0) + 1;
  } else {
    // Seller sent message, increment buyer's unread
    updateData.unreadByBuyer = (convData.unreadByBuyer || 0) + 1;
  }

  await updateDoc(doc(db, "conversations", conversationId), updateData);
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (conversationId, userId) => {
  const convDoc = await getDoc(doc(db, "conversations", conversationId));
  const convData = convDoc.data();
  
  const updateData = {};
  
  if (userId === convData.buyerId) {
    updateData.unreadByBuyer = 0;
  } else if (userId === convData.sellerId) {
    updateData.unreadBySeller = 0;
  }

  await updateDoc(doc(db, "conversations", conversationId), updateData);
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
  }, (error) => {
    console.error('Error loading messages:', error);
  });
};

