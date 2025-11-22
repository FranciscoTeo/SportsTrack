// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAbuXB4l1HI14st8cNJ_Dl62pmFZPvy3a0",
  authDomain: "sporttrack-f6727.firebaseapp.com",
  projectId: "sporttrack-f6727",
  storageBucket: "sporttrack-f6727.firebasestorage.app",
  messagingSenderId: "982810279510",
  appId: "1:982810279510:web:0a3e65077b3e32d04385f7"
};

// Inicializar app
export const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

window.app = app;
window.firebaseConfig = firebaseConfig;
