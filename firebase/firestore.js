import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./config";
// Firestore data access layer: thin wrappers around common listing operations.
// Each function returns plain JS objects with an added `id` for convenience.

// Add a product document to 'products'. Returns new document ID.
export const addProduct = async (product) => {
  const docRef = await addDoc(collection(db, "products"), product);
  return docRef.id;
};

// Get all products (no filtering). For larger datasets consider pagination or query constraints.
export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get a single product by ID. Throws if not found.
export const getProduct = async (productId) => {
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Product not found");
  }
};

// Partially update product fields.
export const updateProduct = async (productId, updates) => {
  const docRef = doc(db, "products", productId);
  await updateDoc(docRef, updates);
};

// Delete a product document by ID.
export const deleteProduct = async (productId) => {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
};

// Query products created by a specific seller.
export const getProductsBySeller = async (sellerId) => {
  const q = query(collection(db, "products"), where("sellerId", "==", sellerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== USER CRUD OPERATIONS ====================

// READ - Get a single user by ID
export const getUser = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("User not found");
  }
};

// UPDATE - Partially update user fields
export const updateUser = async (userId, updates) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, updates);
};

// ==================== FAVORITES OPERATIONS ====================

// Add to favorites
export const addToFavorites = async (userId, productId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const favorites = userData.favorites || [];
    
    if (!favorites.includes(productId)) {
      await updateDoc(userRef, {
        favorites: [...favorites, productId]
      });
    }
  } else {
    // Create user document if it doesn't exist
    await setDoc(userRef, {
      favorites: [productId]
    }, { merge: true });
  }
};

// Remove from favorites
export const removeFromFavorites = async (userId, productId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const favorites = userData.favorites || [];
    
    await updateDoc(userRef, {
      favorites: favorites.filter(id => id !== productId)
    });
  }
  // If user doesn't exist, nothing to remove
};

// Get user favorites
export const getUserFavorites = async (userId) => {
  const user = await getUser(userId);
  const favorites = user.favorites || [];
  
  if (favorites.length === 0) return [];
  
  const products = await Promise.all(
    favorites.map(id => getProduct(id).catch(() => null))
  );
  
  return products.filter(p => p !== null);
};

// Check if product is favorited
export const isFavorited = async (userId, productId) => {
  try {
    const user = await getUser(userId);
    return (user.favorites || []).includes(productId);
  } catch {
    return false;
  }
};

// ==================== REPORT OPERATIONS ====================

// Deduct reputation score from a user (helper function)
const deductReputationScore = async (userId, amount = 0.2) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentScore = userData.reputationScore ?? 5; // Default to 5 if not set
    const newScore = Math.max(0, currentScore - amount); // Don't go below 0
    
    await updateDoc(userRef, {
      reputationScore: newScore,
    });
    
    return newScore;
  }
  return null;
};

// CREATE - Add a new report (also deducts reputation from reported user)
export const createReport = async (reportData) => {
  // Create the report document
  const docRef = await addDoc(collection(db, "reports"), {
    ...reportData,
    status: reportData.status || 'pending', // pending, reviewed, resolved, dismissed
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Deduct reputation from the reported user
  try {
    if (reportData.targetType === 'user') {
      // Directly deduct from the reported user
      await deductReputationScore(reportData.targetId);
    } else if (reportData.targetType === 'listing') {
      // Get the listing to find the seller, then deduct from seller
      const productRef = doc(db, "products", reportData.targetId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        if (productData.sellerId) {
          await deductReputationScore(productData.sellerId);
        }
      }
    }
  } catch (error) {
    // Log error but don't fail the report creation
    console.error('Error deducting reputation score:', error);
  }

  return docRef.id;
};