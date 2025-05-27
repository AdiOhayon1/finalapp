// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ודא שאתה מייבא את זה
import { getFirestore } from "firebase/firestore"; // אם אתה משתמש ב-Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBA47MsuIJq_kHtfYMND6nJeXK3zuhpa_k",
  authDomain: "postpassport-5ac04.firebaseapp.com",
  projectId: "postpassport-5ac04",
  storageBucket: "postpassport-5ac04.firebasestorage.app",
  messagingSenderId: "1089809445671",
  appId: "1:1089809445671:web:758958f0ea1a4b7c4def02",
  measurementId: "G-7H8776YGZW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and EXPORT them
export const auth = getAuth(app); // *** ודא שיש לך שורה כזו! ***
export const db = getFirestore(app); // אם אתה משתמש ב-Firestore, ודא שאתה מייצא גם אותו

export default app;
