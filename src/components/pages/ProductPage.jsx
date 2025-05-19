import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { ProductsService } from '../../firestore-service';
import '../../styles/product.css';

function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart, isInCart } = useContext(CartContext);
    const { currentUser, addToWishlist, isInWishlist, removeFromWishlist } = useContext(AuthContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const productData = await ProductsService.getProductById(id);

                if (productData) {
                    setProduct(productData);
                    setError(null);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error(`Error fetching product with ID ${id}:`, err);
                setError('Failed to load product. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return <div className="product-page loading">Loading product details...</div>;
    }

    if (error || !product) {
        return <div className="product-page error"><h2>{error || 'Product not found'}</h2></div>;
    }

    const handleAddToCart = () => {
        if (product.available) {
            addToCart(product);
        }
    };

    const handleWishlist = () => {
        if (!currentUser) {
            // Redirect to login or show a message
            alert("Please log in to add items to your wishlist");
            return;
        }

        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const renderPrice = () => {
        if (product.oldPrice) {
            return (
                <p id="product-price">
                    <span className="old-price">{product.oldPrice.toFixed(2)} UAH</span>
                    <span className="new-price">{product.price.toFixed(2)} UAH</span>
                </p>
            );
        }
        return <p id="product-price"><strong>{product.price.toFixed(2)} UAH</strong></p>;
    };

    const renderCartButton = () => {
        if (!product.available) {
            return <button id="add-to-cart" disabled className="disabled">❌ Out of Stock</button>;
        }

        if (isInCart(product.id)) {
            return <button id="add-to-cart" className="in-cart" onClick={handleAddToCart}>✓ Added to Cart</button>;
        }

        return <button id="add-to-cart" onClick={handleAddToCart}>🛒 Add to Cart</button>;
    };

    const renderWishlistButton = () => {
        const inWishlist = currentUser && isInWishlist(product.id);
        return (
            <button
                id="add-to-wishlist"
                className={inWishlist ? 'in-wishlist' : ''}
                onClick={handleWishlist}
            >
                {inWishlist ? '❤️' : '🤍'}
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
        );
    };

    return (
        <main>
            <div className="product-page">
                <div className="image-container">
                    <img id="product-image" src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                    <h2 id="product-name">{product.name}</h2>
                    {renderPrice()}
                    <p id="product-status">
                        {product.available ? "✔ Available" : "❌ Out of stock"}
                    </p>
                    <p id="product-rating">Rating: {product.rating}</p>
                    <p id="product-description">{product.description}</p>
                    <div className="product-actions">
                        {renderCartButton()}
                        {renderWishlistButton()}
                    </div>
                    {!currentUser && (
                        <p className="login-prompt">
                            <Link to="/login">Log in</Link> to save items to your wishlist
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ProductPage;