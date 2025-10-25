// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase config (keep your same values)
const firebaseConfig = {
  apiKey: "AIzaSyDxxkC9iD1V1w-53Kf4oBrHEXlBLvCc7sE",
  authDomain: "biluxe10-3e894.firebaseapp.com",
  projectId: "biluxe10-3e894",
  storageBucket: "biluxe10-3e894.firebasestorage.app",
  messagingSenderId: "804749588233",
  appId: "1:804749588233:web:7777648c0c7834733c05d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for user to be logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userDocRef = doc(db, "user_collection", user.email);

    // 🔁 Real-time listener — updates live if data changes in Firebase
    onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // ✅ Update all dashboard fields
        document.getElementById("userName").innerText = data.name || "User";
        document.getElementById("totalEarnings").innerText = data.totalearnings || 0;
        document.getElementById("activeEarnings").innerText = data.activeearnings || 0;
        document.getElementById("passiveEarnings").innerText = data.passiveearnings || 0;
        document.getElementById("adsBonus").innerText = data.adsbonus || 0;
        document.getElementById("paymentStatus").innerText = data.paymentstatus || "Pending";
        document.getElementById("userId").innerText = user.email;
      } else {
        console.log("⚠️ User data not found in Firestore!");
      }
    });
  } else {
    window.location.href = "login.html"; // if not logged in
  }
});
