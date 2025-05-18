// firebase-admin.js - Server-side Firebase admin setup
const admin = require('firebase-admin');

// You would replace this with your actual service account key file
// For production, use environment variables or secret management services
// instead of including the service account file directly
let serviceAccount;
try {
    // Attempt to load from local file during development
    serviceAccount = require('./service-account-key.json');
} catch (error) {
    // In production, use environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        console.error('Firebase service account not found. Please provide credentials.');
        process.exit(1);
    }
}

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://movex-71a38.firebaseio.com",
    storageBucket: "movex-71a38.firebasestorage.app"
});

const db = admin.firestore();
const auth = admin.auth();

// Експортуємо admin для використання в інших модулях
module.exports = { admin, db, auth };