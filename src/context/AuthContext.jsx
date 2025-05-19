import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register a new user
    const register = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with display name
            await updateProfile(userCredential.user, { displayName });

            // Initialize user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: userCredential.user.email,
                displayName,
                wishlist: [],
                purchaseHistory: []
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

            // Update user document in Firestore
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                displayName: userData.displayName
            });

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

    // Add to wishlist
    const addToWishlist = async (product) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Add product to the user's wishlist in Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                wishlist: arrayUnion(product)
            });

            // Update local user state
            const updatedWishlist = [...(currentUser.wishlist || [])];
            if (!updatedWishlist.some(item => item.id === product.id)) {
                updatedWishlist.push(product);
            }

            setCurrentUser({
                ...currentUser,
                wishlist: updatedWishlist
            });

            return true;
        } catch (error) {
            console.error('Add to wishlist error:', error);
            throw error;
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Find the product to remove
            const productToRemove = currentUser.wishlist.find(item => item.id === productId);
            if (!productToRemove) {
                throw new Error('Product not found in wishlist');
            }

            // Remove product from the user's wishlist in Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                wishlist: arrayRemove(productToRemove)
            });

            // Update local user state
            const updatedWishlist = (currentUser.wishlist || []).filter(
                item => item.id !== productId
            );

            setCurrentUser({
                ...currentUser,
                wishlist: updatedWishlist
            });

            return true;
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            throw error;
        }
    };

    // Add to purchase history
    const addToPurchaseHistory = async (purchaseRecord) => {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Add purchase to the user's history in Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                purchaseHistory: arrayUnion(purchaseRecord)
            });

            // Update local user state
            const updatedPurchaseHistory = [...(currentUser.purchaseHistory || []), purchaseRecord];

            setCurrentUser({
                ...currentUser,
                purchaseHistory: updatedPurchaseHistory
            });

            return true;
        } catch (error) {
            console.error('Add to purchase history error:', error);
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

    // Initialize user data
    const initializeUserData = async (user) => {
        if (!user) {
            setCurrentUser(null);
            return;
        }

        try {
            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                // User exists in Firestore, get their data
                const userData = userDoc.data();

                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userData.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    wishlist: userData.wishlist || [],
                    purchaseHistory: userData.purchaseHistory || []
                });
            } else {
                // User doesn't exist in Firestore yet, create them
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    displayName: user.displayName || '',
                    wishlist: [],
                    purchaseHistory: []
                });

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
        addToPurchaseHistory,
        isInWishlist,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};