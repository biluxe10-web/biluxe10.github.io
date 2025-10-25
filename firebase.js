// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxxkC9iD1V1w-53Kf4oBrHEXlBLvCc7sE",
  authDomain: "biluxe10-3e894.firebaseapp.com",
  projectId: "biluxe10-3e894",
  storageBucket: "biluxe10-3e894.firebasestorage.app",
  messagingSenderId: "804749588233",
  appId: "1:804749588233:web:7777648c0c7834733c05d8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
