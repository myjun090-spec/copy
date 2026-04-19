import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInAnonymously, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD6jgI85aajKOeK1_of0Q2eCO_izLcWoCQ",
  authDomain: "copy-77145.firebaseapp.com",
  projectId: "copy-77145",
  storageBucket: "copy-77145.firebasestorage.app",
  messagingSenderId: "263602859447",
  appId: "1:263602859447:web:39b0d99265e8f71b414c32",
  measurementId: "G-MYL2X1FCZB"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
// Request repo scope for repository management
githubProvider.addScope('repo');

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  return result;
};
export const loginAnonymously = () => signInAnonymously(auth);
export const logout = () => signOut(auth);
