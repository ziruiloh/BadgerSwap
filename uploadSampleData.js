import { addDoc, collection } from "firebase/firestore";
import fs from 'fs';
import { db } from "./firebase/config.js";

// Read the products.json file
const productsData = JSON.parse(fs.readFileSync('./firebase/products.json', 'utf8'));

async function uploadAllProducts() {
  try {
    console.log("Starting to upload sample data to Firebase...");
    
    for (const product of productsData) {
      const docRef = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date()
      });
      console.log(`✅ Uploaded: ${product.title} (ID: ${docRef.id})`);
    }
    
    console.log(`🎉 Successfully uploaded ${productsData.length} products to Firebase!`);
  } catch (error) {
    console.error("❌ Error uploading data:", error);
  }
}

// Run the upload
uploadAllProducts();
