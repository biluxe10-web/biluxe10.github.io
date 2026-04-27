// ===== Firebase SDK Imports (v10 Modular) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyDxxkC9iD1V1w-53Kf4oBrHEXlBLvCc7sE",
  authDomain: "biluxe10-3e894.firebaseapp.com",
  projectId: "biluxe10-3e894",
  storageBucket: "biluxe10-3e894.appspot.com",
  messagingSenderId: "804749588233",
  appId: "1:804749588233:web:7777648c0c7834733c05d8",
  measurementId: "G-1K0XR7PHQC"
};

// ===== Initialize Firebase =====
const app = initializeApp(firebaseConfig);

// ===== Services =====
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// ===== Export =====
export { app, auth, db, analytics };
