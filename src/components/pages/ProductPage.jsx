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
    const [notification, setNotification] = useState(null);
    const { addToCart, isInCart } = useContext(CartContext);
    const { currentUser, addToWishlist, isInWishlist, removeFromWishlist, wishlistLoading } = useContext(AuthContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const productData = await ProductsService.getProductById(id);

                if (productData) {
                    setProduct(productData);
                    setError(null);
                } else {
                    setError('Товар не знайдено');
                }
            } catch (err) {
                console.error(`Error fetching product with ID ${id}:`, err);
                setError('Помилка завантаження товару. Спробуйте пізніше.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Show notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddToCart = () => {
        if (product.available) {
            addToCart(product);
            showNotification('Товар додано до кошика!');
        }
    };

    const handleWishlist = async () => {
        try {
            if (!currentUser) {
                showNotification('Будь ласка, увійдіть, щоб додавати товари до списку бажаного', 'error');
                return;
            }

            if (isInWishlist(product.id)) {
                const result = await removeFromWishlist(product.id);
                if (result.success) {
                    showNotification('Товар видалено зі списку бажаного');
                }
            } else {
                const result = await addToWishlist(product);
                if (result.success) {
                    showNotification('Товар додано до списку бажаного');
                }
            }
        } catch (error) {
            console.error('Wishlist operation error:', error);
            showNotification(
                error.message || 'Помилка при роботі зі списком бажаного. Спробуйте пізніше.',
                'error'
            );
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
            return <button id="add-to-cart" disabled className="disabled">❌ Недоступно</button>;
        }

        if (isInCart(product.id)) {
            return <button id="add-to-cart" className="in-cart" onClick={handleAddToCart}>✓ У кошику</button>;
        }

        return <button id="add-to-cart" onClick={handleAddToCart}>🛒 Додати до кошика</button>;
    };

    const renderWishlistButton = () => {
        const inWishlist = currentUser && isInWishlist(product.id);
        return (
            <button
                id="add-to-wishlist"
                className={`${inWishlist ? 'in-wishlist' : ''} ${wishlistLoading ? 'loading' : ''}`}
                onClick={handleWishlist}
                disabled={wishlistLoading}
            >
                {wishlistLoading ? (
                    <span className="loading-spinner">⟳</span>
                ) : (
                    <>
                        {inWishlist ? '❤️' : '🤍'}
                        {inWishlist ? 'У списку бажаного' : 'Додати до бажаного'}
                    </>
                )}
            </button>
        );
    };

    if (loading) {
        return <div className="product-page loading">Завантаження товару...</div>;
    }

    if (error || !product) {
        return <div className="product-page error"><h2>{error || 'Товар не знайдено'}</h2></div>;
    }

    return (
        <main>
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="product-page">
                <div className="image-container">
                    <img id="product-image" src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                    <h2 id="product-name">{product.name}</h2>
                    {renderPrice()}
                    <p id="product-status">
                        {product.available ? "✔ В наявності" : "❌ Недоступно"}
                    </p>
                    <p id="product-rating">Рейтинг: {product.rating}</p>
                    <p id="product-description">{product.description}</p>
                    <div className="product-actions">
                        {renderCartButton()}
                        {renderWishlistButton()}
                    </div>
                    {!currentUser && (
                        <p className="login-prompt">
                            <Link to="/login">Увійдіть</Link> щоб зберігати товари у список бажаного
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ProductPage;