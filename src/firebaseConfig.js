import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBA47MsuIJq_kHtfYMND6nJeXK3zuhpa_k",
  authDomain: "postpassport-5ac04.firebaseapp.com",
  projectId: "postpassport-5ac04",
  storageBucket: "postpassport-5ac04.firebasestorage.app",
  messagingSenderId: "1089809445671",
  appId: "1:1089809445671:web:758958f0ea1a4b7c4def02",
  measurementId: "G-7H8776YGZW",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
