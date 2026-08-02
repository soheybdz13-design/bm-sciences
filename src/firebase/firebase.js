import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvRMDphiv7QswpOtq31Gn1u4I6E9aCEYg",
  authDomain: "bm-sciences-ecfda.firebaseapp.com",
  projectId: "bm-sciences-ecfda",
  storageBucket: "bm-sciences-ecfda.firebasestorage.app",
  messagingSenderId: "954410556995",
  appId: "1:954410556995:web:024576db58076f965dfef6",
  measurementId: "G-EQ197EVNNZ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;