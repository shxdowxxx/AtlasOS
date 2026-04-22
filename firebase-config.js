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
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Session ID for anonymous presence
const _sessionId = 'anon-' + Math.random().toString(36).slice(2, 10);
let _presenceRef = null;

async function _writePresence(user) {
  const id = user ? user.uid : _sessionId;
  _presenceRef = doc(db, 'presence', id);
  await setDoc(_presenceRef, {
    uid: id,
    name: user ? (user.displayName || 'operator') : 'anonymous',
    ts: serverTimestamp(),
  });
}

async function _removePresence() {
  if (_presenceRef) {
    await deleteDoc(_presenceRef).catch(() => {});
    _presenceRef = null;
  }
}

// Watch presence collection → broadcast count
onSnapshot(collection(db, 'presence'), (snap) => {
  window.dispatchEvent(new CustomEvent('atlas:presence', { detail: { count: snap.size } }));
});

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

window.AtlasFirebase = { app, analytics, auth, db, AtlasAuth };

// Manage presence on auth state change
onAuthStateChanged(auth, async (user) => {
  await _removePresence();
  await _writePresence(user).catch(() => {});
  window.dispatchEvent(new CustomEvent('atlas:authchange', { detail: { user } }));
});

// Write anonymous presence immediately on load
_writePresence(null).catch(() => {});

// Remove presence on page unload
window.addEventListener('beforeunload', () => { _removePresence(); });

console.log("ATLAS // Firebase initialized (Auth + Presence ready).");

export { app, analytics, auth, db, AtlasAuth };
