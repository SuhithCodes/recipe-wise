// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-2778202276-db872",
  "appId": "1:950303384009:web:0532070fc7abe77c8b4818",
  "apiKey": "AIzaSyDg7pJVHW1FM5OKVZNQofXt6M3hv7LQ3iU",
  "authDomain": "studio-2778202276-db872.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "950303384009"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
