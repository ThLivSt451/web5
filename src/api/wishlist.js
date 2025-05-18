// api/wishlist.js - API routes for wishlist
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

// Export for use in other API files
module.exports.verifyToken = verifyToken;

// Apply token verification middleware to all routes
router.use(verifyToken);

// Get user's wishlist
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid;
        const db = admin.firestore();

        // Get user document from 'users' collection
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        // If user document doesn't exist, create it with empty wishlist
        if (!userDoc.exists) {
            await userRef.set({
                email: req.user.email,
                displayName: req.user.name || '',
                wishlist: [],
                purchaseHistory: []
            });
            return res.json({ wishlist: [] });
        }

        // Get user data with wishlist
        const userData = userDoc.data();

        return res.json({
            wishlist: userData.wishlist || []
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        return res.status(500).json({ error: 'Failed to retrieve wishlist' });
    }
});

// Add product to wishlist
router.post('/add', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { product } = req.body;

        if (!product || !product.id) {
            return res.status(400).json({ error: 'Invalid product data' });
        }

        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);

        // Get current user document
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user document with this product as first wishlist item
            await userRef.set({
                email: req.user.email,
                displayName: req.user.name || '',
                wishlist: [product],
                purchaseHistory: []
            });
        } else {
            // Get current wishlist
            const userData = userDoc.data();
            const currentWishlist = userData.wishlist || [];

            // Check if product already exists in wishlist
            const productExists = currentWishlist.some(item => item.id === product.id);

            if (!productExists) {
                // Add product to wishlist
                await userRef.update({
                    wishlist: admin.firestore.FieldValue.arrayUnion(product)
                });
            } else {
                return res.json({ message: 'Product already in wishlist' });
            }
        }

        return res.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return res.status(500).json({ error: 'Failed to add product to wishlist' });
    }
});

// Remove product from wishlist
router.delete('/remove/:productId', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);

        // Get current user document
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get current wishlist
        const userData = userDoc.data();
        const currentWishlist = userData.wishlist || [];

        // Find product to remove
        const productToRemove = currentWishlist.find(item => item.id === productId);

        if (!productToRemove) {
            return res.status(404).json({ error: 'Product not found in wishlist' });
        }

        // Remove product from wishlist
        const updatedWishlist = currentWishlist.filter(item => item.id !== productId);

        // Update user document
        await userRef.update({
            wishlist: updatedWishlist
        });

        return res.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return res.status(500).json({ error: 'Failed to remove product from wishlist' });
    }
});

module.exports = router;