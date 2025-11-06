import { db } from "./config";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";

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

// Get a single product by ID
export const getProduct = async (productId) => {
  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Product not found");
  }
};

// Update a product
export const updateProduct = async (productId, updates) => {
  const docRef = doc(db, "products", productId);
  await updateDoc(docRef, updates);
};

// Delete a product
export const deleteProduct = async (productId) => {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
};

// Get products by category
export const getProductsByCategory = async (category) => {
  const q = query(collection(db, "products"), where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get products by seller
export const getProductsBySeller = async (sellerId) => {
  const q = query(collection(db, "products"), where("sellerId", "==", sellerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Search products by title
export const searchProducts = async (searchTerm) => {
  const snapshot = await getDocs(collection(db, "products"));
  const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Note: Firestore doesn't support full-text search natively,
  // so we filter client-side for basic search
  const searchLower = searchTerm.toLowerCase();
  return allProducts.filter(product => 
    product.title?.toLowerCase().includes(searchLower) ||
    product.description?.toLowerCase().includes(searchLower)
  );
};

