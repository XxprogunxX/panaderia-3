// lib/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyCMrz_gD0b6SEI4XRF-J76AW7NY5hMlbAc",
  authDomain: "admin-panel-c1cba.firebaseapp.com",
  databaseURL: "https://admin-panel-c1cba-default-rtdb.firebaseio.com",
  projectId: "admin-panel-c1cba",
  storageBucket: "admin-panel-c1cba.firebasestorage.app",
  messagingSenderId: "1062581664344",
  appId: "1:1062581664344:web:815789a13dcfbf613ea82d"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth, firebaseConfig };
export const db = getFirestore(app);
