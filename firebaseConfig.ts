import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBQzdNkgbH5jpcBexV8WVoIJtvm2gQj8eo",
    authDomain: "insurehub-e870f.firebaseapp.com",
    projectId: "insurehub-e870f",
    storageBucket: "insurehub-e870f.firebasestorage.app",
    messagingSenderId: "979803936224",
    appId: "1:979803936224:web:946de2644e2138ecc74785",
    measurementId: "G-YTRDCYK6PE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
