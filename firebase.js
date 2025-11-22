// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbuXB4l1HI14st8cNJ_Dl62pmFZPvy3a0",
  authDomain: "sporttrack-f6727.firebaseapp.com",
  projectId: "sporttrack-f6727",
  storageBucket: "sporttrack-f6727.firebasestorage.app",
  messagingSenderId: "982810279510",
  appId: "1:982810279510:web:0a3e65077b3e32d04385f7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Expõe globalmente (opcional para testes)
window.app = app;
window.db = db;
window.auth = auth;
window.firebaseConfig = firebaseConfig;

export { app, db, auth };
