//handles image uploads and downloads
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image to Firebase Storage
 * 
 * Flow:
 * 1. Convert image URI to blob
 * 2. Upload blob to Firebase Storage
 * 3. Get download URL
 * 4. Return the URL to store in Firestore
 * 
 * @param {string} uri - Local image URI from image picker
 * @param {string} path - Storage path (e.g., 'listings/abc123.jpg')
 * @returns {Promise<string>} - Download URL of the uploaded image
 */
export const uploadImage = async (uri, path) => {
  try {
    // Step 1: Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Step 2: Create storage reference
    const storageRef = ref(storage, path);
    
    // Step 3: Upload blob to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Image uploaded successfully:', snapshot.metadata.fullPath);
    
    // Step 4: Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload a listing image with auto-generated path
 * 
 * @param {string} uri - Local image URI
 * @param {string} listingId - Unique listing identifier (or generate one)
 * @returns {Promise<string>} - Download URL
 */
export const uploadListingImage = async (uri, listingId = null) => {
  // Generate unique filename
  const timestamp = Date.now();
  const id = listingId || `listing_${timestamp}`;
  const filename = `${id}_${timestamp}.jpg`;
  const path = `listings/${filename}`;
  
  return await uploadImage(uri, path);
};

/**
 * Upload a user profile image
 * 
 * @param {string} uri - Local image URI
 * @param {string} userId - User's UID
 * @returns {Promise<string>} - Download URL
 */
export const uploadProfileImage = async (uri, userId) => {
  const timestamp = Date.now();
  const filename = `${userId}_${timestamp}.jpg`;
  const path = `profiles/${filename}`;
  
  return await uploadImage(uri, path);
};

/**
 * Upload multiple images for a listing
 * 
 * @param {string[]} uris - Array of local image URIs
 * @param {string} listingId - Unique listing identifier
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultipleImages = async (uris, listingId = null) => {
  const timestamp = Date.now();
  const id = listingId || `listing_${timestamp}`;
  
  const uploadPromises = uris.map((uri, index) => {
    const filename = `${id}_${timestamp}_${index}.jpg`;
    const path = `listings/${filename}`;
    return uploadImage(uri, path);
  });
  
  return await Promise.all(uploadPromises);
};
