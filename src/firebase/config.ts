import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP8INaJgPgMl_I-NLxSux5Vb5JW9xVeHE",
  authDomain: "society-organiser.firebaseapp.com",
  projectId: "society-organiser",
  storageBucket: "society-organiser.firebasestorage.app",
  messagingSenderId: "1039031583687",
  appId: "1:1039031583687:web:187fd3800379aeedcbcfe2",
  measurementId: "G-VHH7B41CJH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;