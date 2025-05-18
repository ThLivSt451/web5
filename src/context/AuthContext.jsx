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
            setCurrentUser({
                ...currentUser,
                ...userData
            });

            return true;
        } catch (error) {
            console.error('Update user data error:', error);
            throw error;
        }
    };

    // Improved addToWishlist function
    const addToWishlist = async (product) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            setWishlistLoading(true);

            // Check if product is already in wishlist locally
            const isAlreadyInWishlist = isInWishlist(product.id);
            if (isAlreadyInWishlist) {
                setWishlistLoading(false);
                return { success: true, message: 'Product already in wishlist' };
            }

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

            // Update local user state with server data
            const updatedWishlist = [...(currentUser.wishlist || [])];
            if (!updatedWishlist.some(item => item.id === product.id)) {
                updatedWishlist.push(product);

                setCurrentUser({
                    ...currentUser,
                    wishlist: updatedWishlist
                });
            }

            setWishlistLoading(false);
            return { success: true, message: data.message || 'Product added to wishlist' };
        } catch (error) {
            setWishlistLoading(false);
            console.error('Add to wishlist error:', error);
            throw error;
        }
    };

    // Improved removeFromWishlist function
    const removeFromWishlist = async (productId) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            setWishlistLoading(true);

            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove from wishlist');
            }

            const data = await response.json();

            // Update local user state after successful server operation
            const updatedWishlist = (currentUser.wishlist || []).filter(
                item => item.id !== productId
            );

            setCurrentUser({
                ...currentUser,
                wishlist: updatedWishlist
            });

            setWishlistLoading(false);
            return { success: true, message: data.message || 'Product removed from wishlist' };
        } catch (error) {
            setWishlistLoading(false);
            console.error('Remove from wishlist error:', error);
            throw error;
        }
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        if (!currentUser || !currentUser.wishlist) {
            return false;
        }
        return currentUser.wishlist.some(item => item.id === productId);
    };

    // Initialize user data with wishlist and purchase history
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
                    wishlist: data.wishlist || [],
                    purchaseHistory: purchaseHistory
                });
            } else {
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
        loading,
        wishlistLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};