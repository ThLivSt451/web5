// server.js - Updated Express server with additional routes
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Initialize Firebase Admin with environment variables
// Render підтримує змінні середовища для безпечного збереження секретів
let serviceAccount;
try {
    // Для Render використовуємо змінну середовища для Firebase credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('Firebase Admin initialized successfully');
    } else {
        console.warn('Firebase credentials not found in environment variables');
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security and optimization middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://www.gstatic.com", "https://*.firebaseio.com", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://*.firebasestorage.app", "https://firebasestorage.googleapis.com"],
            connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.firebasestorage.app", "https://firestore.googleapis.com", "wss://*.firebaseio.com"]
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint - корисно для моніторингу на Render
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Import API routes
const wishlistRoutes = require('./api/wishlist');
const purchaseHistoryRoutes = require('./api/purchase-history');

// API routes
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/purchase-history', purchaseHistoryRoutes);

// Handle all other routes by serving the React app
// This ensures React Router can handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});