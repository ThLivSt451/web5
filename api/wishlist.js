// api/wishlist.js - API routes for wishlist management
const express = require('express');
const router = express.Router();
const { db } = require('../firebase-admin');

// Middleware to verify Firebase Auth token
const verifyToken = async (req, res, next) => {
    const { admin } = require('../firebase-admin');

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Apply auth middleware to all routes
router.use(verifyToken);

// Get user's wishlist
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid;

        // Get user document from Firestore
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            // Create a new user document if it doesn't exist
            await db.collection('users').doc(userId).set({
                email: req.user.email,
                displayName: req.user.name || '',
                wishlist: [],
                purchaseHistory: []
            });

            return res.json({ wishlist: [] });
        }

        const userData = userDoc.data();
        return res.json({ wishlist: userData.wishlist || [] });

    } catch (error) {
        console.error('Error getting wishlist:', error);
        res.status(500).json({ error: 'Failed to retrieve wishlist' });
    }
});

// Add item to wishlist
router.post('/add', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { product } = req.body;

        if (!product || !product.id) {
            return res.status(400).json({ error: 'Invalid product data' });
        }

        // Get user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user document if it doesn't exist
            await userRef.set({
                email: req.user.email,
                displayName: req.user.name || '',
                wishlist: [product],
                purchaseHistory: []
            });

            return res.status(201).json({
                message: 'Product added to wishlist',
                product
            });
        }

        const userData = userDoc.data();
        const wishlist = userData.wishlist || [];

        // Check if product already exists in wishlist
        const existingProduct = wishlist.find(item => item.id === product.id);

        if (existingProduct) {
            return res.status(409).json({
                message: 'Product already in wishlist',
                product: existingProduct
            });
        }

        // Add product to wishlist
        wishlist.push(product);

        // Update user document
        await userRef.update({ wishlist });

        return res.status(201).json({
            message: 'Product added to wishlist',
            product
        });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add item to wishlist' });
    }
});

// Remove item from wishlist
router.delete('/remove/:productId', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Get user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const wishlist = userData.wishlist || [];

        // Remove product from wishlist
        const updatedWishlist = wishlist.filter(item => item.id !== productId);

        // Check if product was in wishlist
        if (wishlist.length === updatedWishlist.length) {
            return res.status(404).json({ error: 'Product not found in wishlist' });
        }

        // Update user document
        await userRef.update({ wishlist: updatedWishlist });

        return res.json({
            message: 'Product removed from wishlist',
            productId
        });

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove item from wishlist' });
    }
});

module.exports = router;