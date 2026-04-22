// Atlas OS — Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBR3sohvZiUvdV2feYyfnXzgW6jkjmP6Bs",
  authDomain: "atlasos-c61b0.firebaseapp.com",
  projectId: "atlasos-c61b0",
  storageBucket: "atlasos-c61b0.firebasestorage.app",
  messagingSenderId: "257861854436",
  appId: "1:257861854436:web:4b47b13831c196f94678f1",
  measurementId: "G-JMTJ5EZR7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("ATLAS // Firebase initialized.");

export { app, analytics };
