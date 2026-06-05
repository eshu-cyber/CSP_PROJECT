// Firebase SDK v9+ modular approach
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANWn5tCNJRTmtg-u2zhIb8hl-Gy5Cb-bQ",
  authDomain: "csp-c0aad.firebaseapp.com",
  projectId: "csp-c0aad",
  storageBucket: "csp-c0aad.firebasestorage.app",
  messagingSenderId: "38282469918",
  appId: "1:38282469918:web:47b2fbb36b2388bd20840f",
  measurementId: "G-M5R9REFB1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export for use in other files
export { auth, db, analytics, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc };
