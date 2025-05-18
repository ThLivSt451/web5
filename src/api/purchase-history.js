// api/purchase-history.js - API routes for purchase history
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { verifyToken } = require('./wishlist');

// Apply token verification middleware to all routes
router.use(verifyToken);

// Get user's purchase history
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid;
        const db = admin.firestore();

        // Get user document from 'users' collection
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        // If user document doesn't exist, create it with empty purchase history
        if (!userDoc.exists) {
            await userRef.set({
                email: req.user.email,
                displayName: req.user.name || '',
                wishlist: [],
                purchaseHistory: []
            });
            return res.json({ purchaseHistory: [] });
        }

        // Get user data with purchase history
        const userData = userDoc.data();

        return res.json({
            purchaseHistory: userData.purchaseHistory || []
        });
    } catch (error) {
        console.error('Get purchase history error:', error);
        return res.status(500).json({ error: 'Failed to retrieve purchase history' });
    }
});

// Add purchase to history
router.post('/add', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { items, totalAmount, date } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid purchase data' });
        }

        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);

        // Create purchase record with timestamp
        const purchaseRecord = {
            items: items,
            totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: date || admin.firestore.FieldValue.serverTimestamp(),
            orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };

        // Get current user document
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user document with this purchase as first history item
            await userRef.set({
                email: req.user.email,
                displayName: req.user.name || '',
                wishlist: [],
                purchaseHistory: [purchaseRecord]
            });
        } else {
            // Add purchase to history
            await userRef.update({
                purchaseHistory: admin.firestore.FieldValue.arrayUnion(purchaseRecord)
            });
        }

        // Create a purchase record in a separate collection for better querying
        await db.collection('purchases').add({
            userId: userId,
            ...purchaseRecord
        });

        return res.json({
            success: true,
            message: 'Purchase added to history',
            orderId: purchaseRecord.orderId
        });
    } catch (error) {
        console.error('Add to purchase history error:', error);
        return res.status(500).json({ error: 'Failed to add purchase to history' });
    }
});

// Get purchase details by orderId
router.get('/:orderId', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const db = admin.firestore();

        // Query for the specific purchase
        const purchasesRef = db.collection('purchases');
        const query = purchasesRef
            .where('userId', '==', userId)
            .where('orderId', '==', orderId);

        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        // Return the first matching purchase (should be only one)
        const purchaseData = querySnapshot.docs[0].data();

        return res.json({
            purchase: purchaseData
        });
    } catch (error) {
        console.error('Get purchase details error:', error);
        return res.status(500).json({ error: 'Failed to retrieve purchase details' });
    }
});

module.exports = router;