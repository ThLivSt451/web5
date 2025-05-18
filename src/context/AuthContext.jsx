import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [lastWishlistUpdate, setLastWishlistUpdate] = useState(null);

    // Register a new user
    const register = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with display name
            await updateProfile(userCredential.user, { displayName });

            // Initialize user data in Firestore through the API
            const token = await userCredential.user.getIdToken();
            await fetch('/api/wishlist', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return userCredential.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Login existing user
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout user
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    // Update user data
    const updateUserData = async (userId, userData) => {
        try {
            await updateProfile(auth.currentUser, userData);

            // Refresh user object
            setCurrentUser(prevUser => ({
                ...prevUser,
                ...userData
            }));

            return true;
        } catch (error) {
            console.error('Update user data error:', error);
            throw error;
        }
    };

    /**
     * Improved addToWishlist function with better state management and error handling
     * @param {Object} product - The product to add to wishlist
     * @returns {Promise<Object>} - Result of the operation
     */
    const addToWishlist = async (product) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Set loading state
            setWishlistLoading(true);

            // Check if product is already in wishlist locally
            const isAlreadyInWishlist = isInWishlist(product.id);
            if (isAlreadyInWishlist) {
                setWishlistLoading(false);
                return { success: true, message: 'Product already in wishlist' };
            }

            // Get authentication token
            const token = await auth.currentUser.getIdToken();

            // Send request to API
            const response = await fetch('/api/wishlist/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product })
            });

            // Check HTTP response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add to wishlist');
            }

            // Parse response data
            const data = await response.json();

            // Update local user state with optimistic update
            setCurrentUser(prevUser => {
                // Make sure wishlist is always an array
                const currentWishlist = Array.isArray(prevUser.wishlist) ? prevUser.wishlist : [];

                // Check if product is already in the list
                if (!currentWishlist.some(item => item.id === product.id)) {
                    // Add new product to the list
                    return {
                        ...prevUser,
                        wishlist: [...currentWishlist, product]
                    };
                }
                return prevUser;
            });

            // Record time of update for potential refreshes
            setLastWishlistUpdate(new Date());
            setWishlistLoading(false);
            return { success: true, message: data.message || 'Product added to wishlist' };
        } catch (error) {
            setWishlistLoading(false);
            console.error('Add to wishlist error:', error);
            throw error;
        }
    };

    /**
     * Improved removeFromWishlist function with better state management
     * @param {string} productId - ID of the product to remove
     * @returns {Promise<Object>} - Result of the operation
     */
    const removeFromWishlist = async (productId) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            setWishlistLoading(true);

            // Get authentication token
            const token = await auth.currentUser.getIdToken();

            // Call API to remove item
            const response = await fetch(`/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check for API errors
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove from wishlist');
            }

            const data = await response.json();

            // Update local state with optimistic update
            setCurrentUser(prevUser => {
                // Ensure wishlist exists and is an array
                if (prevUser && Array.isArray(prevUser.wishlist)) {
                    return {
                        ...prevUser,
                        wishlist: prevUser.wishlist.filter(item => item.id !== productId)
                    };
                }
                return prevUser;
            });

            // Record time of update for potential refreshes
            setLastWishlistUpdate(new Date());
            setWishlistLoading(false);
            return { success: true, message: data.message || 'Product removed from wishlist' };
        } catch (error) {
            setWishlistLoading(false);
            console.error('Remove from wishlist error:', error);
            throw error;
        }
    };

    /**
     * Check if product is in wishlist
     * @param {string} productId - ID of the product to check
     * @returns {boolean} - True if product is in wishlist
     */
    const isInWishlist = (productId) => {
        if (!currentUser || !Array.isArray(currentUser.wishlist)) {
            return false;
        }
        return currentUser.wishlist.some(item => item.id === productId);
    };

    /**
     * Refreshes wishlist data from the server
     * @returns {Promise<Array>} - The updated wishlist
     */
    const refreshWishlist = async () => {
        try {
            if (!currentUser || !currentUser.uid) {
                return [];
            }

            // Get authentication token
            const token = await auth.currentUser.getIdToken();

            // Fetch wishlist from API
            const response = await fetch('/api/wishlist', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to refresh wishlist');
            }

            const data = await response.json();

            // Ensure wishlist is always an array
            const wishlistData = Array.isArray(data.wishlist) ? data.wishlist : [];

            // Update user state with fresh data
            setCurrentUser(prevUser => ({
                ...prevUser,
                wishlist: wishlistData
            }));

            // Update the last refresh timestamp
            setLastWishlistUpdate(new Date());

            return wishlistData;
        } catch (error) {
            console.error('Error refreshing wishlist:', error);
            return currentUser?.wishlist || [];
        }
    };

    /**
     * Initialize user data with wishlist and purchase history
     * @param {Object} user - Firebase user object
     */
    const initializeUserData = async (user) => {
        if (!user) {
            setCurrentUser(null);
            return;
        }

        try {
            // Get user token
            const token = await user.getIdToken();

            // Fetch user's wishlist from API
            const response = await fetch('/api/wishlist', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Ensure wishlist is always an array
                const wishlistData = Array.isArray(data.wishlist) ? data.wishlist : [];

                // Get purchase history (in a real app, this would be another API endpoint)
                // For now, we'll mock an empty purchase history
                const purchaseHistory = [];

                // Set complete user data with wishlist and purchase history
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    wishlist: wishlistData,
                    purchaseHistory: purchaseHistory
                });

                // Set the initial wishlist update timestamp
                setLastWishlistUpdate(new Date());
            } else {
                console.warn('Failed to fetch wishlist data, initializing with empty array');
                // Set basic user data without wishlist
                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    wishlist: [],
                    purchaseHistory: []
                });
            }
        } catch (error) {
            console.error('Error initializing user data:', error);
            // Fallback to basic user data
            setCurrentUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                wishlist: [],
                purchaseHistory: []
            });
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await initializeUserData(user);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Auto-refresh wishlist periodically when user is logged in
    useEffect(() => {
        let refreshInterval;

        if (currentUser?.uid) {
            // Refresh immediately on mount
            refreshWishlist();

            // Set up periodic refresh (every 5 minutes)
            refreshInterval = setInterval(() => {
                refreshWishlist();
            }, 5 * 60 * 1000);
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [currentUser?.uid]);

    const value = {
        currentUser,
        register,
        login,
        logout,
        resetPassword,
        updateUserData,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
        loading,
        wishlistLoading,
        lastWishlistUpdate
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};