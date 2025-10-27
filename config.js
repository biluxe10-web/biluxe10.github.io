// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDxxkC9iD1V1w-53Kf4oBrHEXlBLvCc7sE",
    authDomain: "biluxe10-3e894.firebaseapp.com",
    projectId: "biluxe10-3e894",
    storageBucket: "biluxe10-3e894.firebasestorage.app",
    messagingSenderId: "804749588233",
    appId: "1:804749588233:web:7777648c0c7834733c05d8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Auth state management
let currentUser = null;
let userData = null;

// Utility functions
const generateId = () => `ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const showToast = (message, type = 'success') => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
};
