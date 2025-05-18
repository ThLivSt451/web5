import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDU1Ggi36ZQXuanC2regZ5udoC83iRNvlo",
    authDomain: "movex-71a38.firebaseapp.com",
    projectId: "movex-71a38",
    storageBucket: "movex-71a38.firebasestorage.app",
    messagingSenderId: "250029024328",
    appId: "1:250029024328:web:f993d61784c1d752be247d",
    measurementId: "G-TS0JV3D3Q3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };