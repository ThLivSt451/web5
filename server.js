// server.js - Express server for MovEx application
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { ... });

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

// API route for health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Import API routes
const wishlistRoutes = require('./api/wishlist');

// API routes
app.use('/api/wishlist', wishlistRoutes);

// Handle all other routes by serving the React app
// This ensures React Router can handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});