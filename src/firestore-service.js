import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';

// Константи колекцій
const PRODUCTS_COLLECTION = 'products';

// Сервіс для роботи з продуктами
export const ProductsService = {
    // Отримати всі продукти
    getAllProducts: async () => {
        try {
            const productsCollection = collection(db, PRODUCTS_COLLECTION);
            const productsSnapshot = await getDocs(productsCollection);
            return productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    },

    // Отримати продукт за ID
    /*getProductById: async (productId) => {
        try {
            const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
            const productSnapshot = await getDoc(productDoc);

            if (productSnapshot.exists()) {
                return {
                    id: productSnapshot.id,
                    ...productSnapshot.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error getting product with ID ${productId}:`, error);
            throw error;
        }

    },*/

    getProductById: async (id) => {
        try {
            const productsRef = collection(db, "products");
            const q = query(productsRef, where("id", "==", parseInt(id)));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // беремо перший знайдений документ
                const docSnap = querySnapshot.docs[0];
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null; // продукт не знайдено
            }
        } catch (error) {
            console.error("Error getting product by custom ID:", error);
            return null;
        }
    },

    // Отримати продукти зі знижкою
    getDiscountedProducts: async () => {
        try {
            const productsCollection = collection(db, PRODUCTS_COLLECTION);
            // Запит для фільтрації продуктів, у яких є поле oldPrice
            const discountedProductsQuery = query(
                productsCollection,
                where('oldPrice', '>', 0)
            );

            const productsSnapshot = await getDocs(discountedProductsQuery);
            return productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting discounted products:', error);
            throw error;
        }
    },

    // Додати новий продукт
    addProduct: async (productData) => {
        try {
            const productsCollection = collection(db, PRODUCTS_COLLECTION);
            const docRef = await addDoc(productsCollection, productData);
            return docRef.id;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    },

    // Оновити існуючий продукт
    updateProduct: async (productId, productData) => {
        try {
            const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
            await updateDoc(productDoc, productData);
            return true;
        } catch (error) {
            console.error(`Error updating product with ID ${productId}:`, error);
            throw error;
        }
    },

    // Видалити продукт
    deleteProduct: async (productId) => {
        try {
            const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
            await deleteDoc(productDoc);
            return true;
        } catch (error) {
            console.error(`Error deleting product with ID ${productId}:`, error);
            throw error;
        }
    }
};

export default ProductsService;