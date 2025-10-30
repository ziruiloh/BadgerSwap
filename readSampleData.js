import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/config.js";

async function getProducts() {
    const snapshot = await getDocs(collection(db, "products"));
    snapshot.forEach(doc => {
        console.log(`${doc.id} =>`, doc.data());
    });
}

getProducts();