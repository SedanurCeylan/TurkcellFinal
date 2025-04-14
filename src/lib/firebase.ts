// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Bu genelde SSR'de kullanılmaz, istersen yorum satırı olarak bırak.

const firebaseConfig = {
    apiKey: "AIzaSyB13P6jVzi0RriSj6LajMxcDB7z8bvVQ2E",
    authDomain: "cyripto-4c48e.firebaseapp.com",
    projectId: "cyripto-4c48e",
    storageBucket: "cyripto-4c48e.firebasestorage.app",
    messagingSenderId: "724181951061",
    appId: "1:724181951061:web:d243a588b59bd2cbfeeadc",
    measurementId: "G-FZT5ECWZPX",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Auth servisini export et
export const auth = getAuth(app);




