import { initializeApp } from "firebase/app";
import {
  getFirestore
} from "firebase/firestore";

import {
  getStorage
} from "firebase/storage";

import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {

  apiKey:"YOUR_API_KEY",

  authDomain:"YOUR_PROJECT.firebaseapp.com",

  projectId:"YOUR_PROJECT",

  storageBucket:"YOUR_PROJECT.appspot.com",

  messagingSenderId:"XXXXXXXX",

  appId:"XXXXXXXX"

};

const app = initializeApp(firebaseConfig);

export const db=getFirestore(app);

export const storage=getStorage(app);

export const auth=getAuth(app);