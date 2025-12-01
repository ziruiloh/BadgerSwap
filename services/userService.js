// User service: High-level operations for user management
// Combines Firestore operations with Firebase Auth operations

import { deleteUser as deleteUserAuth } from "firebase/auth";
import { 
  createUser, 
  getUser, 
  getAllUsers, 
  updateUser, 
  deleteUser as deleteUserFirestore 
} from "../firebase/firestore";
import { auth } from "../firebase/config";

// ==================== CREATE ====================

/**
 * Create a new user document in Firestore
 * Typically called during signup process
 */
export const createUserProfile = async (userId, userData) => {
  return await createUser(userId, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// ==================== READ ====================

/**
 * Get user profile by user ID
 * @param {string} userId - The user's UID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getUser(userId);
    console.log("User profile:", userDoc);
    return userDoc;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Get the current authenticated user's profile
 * @returns {Promise<Object>} Current user's profile data
 */
export const getCurrentUserProfile = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user is currently logged in");
  }
  return await getUserProfile(currentUser.uid);
};

/**
 * Get all users (admin functionality)
 * @returns {Promise<Array>} Array of all user profiles
 */
export const getAllUserProfiles = async () => {
  try {
    return await getAllUsers();
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// ==================== UPDATE ====================

/**
 * Update user profile information
 * @param {string} userId - The user's UID
 * @param {Object} updates - Fields to update (e.g., { name: "New Name", bio: "..." })
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    await updateUser(userId, {
      ...updates,
      updatedAt: new Date()
    });
    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update the current authenticated user's profile
 * @param {Object} updates - Fields to update
 */
export const updateCurrentUserProfile = async (updates) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user is currently logged in");
  }
  return await updateUserProfile(currentUser.uid, updates);
};

// ==================== DELETE ====================

/**
 * Delete user from both Firestore and Firebase Auth
 * IMPORTANT: This is a destructive operation that cannot be undone
 * 
 * @param {string} userId - The user's UID
 * @param {Object} user - The Firebase Auth user object (required for auth deletion)
 */
export const deleteUserAccount = async (userId, user) => {
  try {
    // Step 1: Delete user document from Firestore
    await deleteUserFirestore(userId);
    console.log("User deleted from Firestore");
    
    // Step 2: Delete user from Firebase Auth
    if (user) {
      await deleteUserAuth(user);
      console.log("User deleted from Firebase Auth");
    }
    
    console.log("User account completely deleted");
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

/**
 * Delete the current authenticated user's account
 * This will delete both Firestore data and Auth account, then sign them out
 */
export const deleteCurrentUserAccount = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user is currently logged in");
  }
  
  return await deleteUserAccount(currentUser.uid, currentUser);
};

/**
 * Delete only the Firestore user document (keep Auth account)
 * @param {string} userId - The user's UID
 */
export const deleteUserFirestoreOnly = async (userId) => {
  try {
    await deleteUserFirestore(userId);
    console.log("User data deleted from Firestore");
  } catch (error) {
    console.error("Error deleting user from Firestore:", error);
    throw error;
  }
};

