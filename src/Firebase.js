// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5zkJ642PVtskarS8IWbg11PuPXnUJsZU",
  authDomain: "studentdashboard-83fa5.firebaseapp.com",
  projectId: "studentdashboard-83fa5",
  storageBucket: "studentdashboard-83fa5.firebasestorage.app",
  messagingSenderId: "276584590503",
  appId: "1:276584590503:web:7beb219f946303ff243f82",
  measurementId: "G-M3V5RN8R6D",
};

// Initialize Firebase

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
