import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

 const firebaseConfig = {
  apiKey: "AIzaSyAgVAk3oMXyLQNRJVUZjhbZg5PZyQab1A8",
  authDomain: "pacta-844ce.firebaseapp.com",
  projectId: "pacta-844ce",
  storageBucket: "pacta-844ce.firebasestorage.app",
  messagingSenderId: "163475092846",
  appId: "1:163475092846:web:e2ed70d46f788e8a64fd7f",
  measurementId: "G-95NMVY7PCL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
