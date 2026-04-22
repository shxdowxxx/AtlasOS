// Atlas OS — Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBR3sohvZiUvdV2feYyfnXzgW6jkjmP6Bs",
  authDomain: "atlasos-c61b0.firebaseapp.com",
  projectId: "atlasos-c61b0",
  storageBucket: "atlasos-c61b0.firebasestorage.app",
  messagingSenderId: "257861854436",
  appId: "1:257861854436:web:4b47b13831c196f94678f1",
  measurementId: "G-JMTJ5EZR7D"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Auth helpers exposed to classic scripts
const AtlasAuth = {
  signIn() {
    return signInWithPopup(auth, provider);
  },
  signOut() {
    return signOut(auth);
  },
  onStateChange(cb) {
    return onAuthStateChanged(auth, cb);
  },
  currentUser() {
    return auth.currentUser;
  },
};

window.AtlasFirebase = { app, analytics, auth, AtlasAuth };

// Notify system when auth state changes
onAuthStateChanged(auth, (user) => {
  window.dispatchEvent(new CustomEvent('atlas:authchange', { detail: { user } }));
});

console.log("ATLAS // Firebase initialized (Auth ready).");

export { app, analytics, auth, AtlasAuth };
