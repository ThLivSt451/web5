import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

function ProductCard({ product }) {
    const { addToCart, isInCart } = useContext(CartContext);

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigation
        if (product.available) {
            addToCart(product);
        }
    };

    const renderPrice = () => {
        if (product.oldPrice) {
            return (
                <>
                    <p><strong><span className="old-price">{product.oldPrice.toFixed(2)} UAH</span></strong></p>
                    <p><span className="new-price">{product.price.toFixed(2)} UAH</span></p>
                </>
            );
        }
        return <p><strong>{product.price.toFixed(2)} UAH</strong></p>;
    };

    const renderButton = () => {
        if (!product.available) {
            return <button className="add-to-cart disabled" disabled>❌ Недоступно</button>;
        }

        if (isInCart(product.id)) {
            return <button className="add-to-cart in-cart" onClick={handleAddToCart}>✓ У кошику</button>;
        }

        return <button className="add-to-cart" onClick={handleAddToCart}>🛒 Додати у кошик</button>;
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-link">
                <img src={product.image} alt={product.name} />
                <h2>{product.name}</h2>
                {renderPrice()}
                <p>[{product.available ? 'Доступно' : 'Недоступно'}]</p>
                <p>Рейтинг: {product.rating}</p>
            </Link>
            {renderButton()}
        </div>
    );
}

export default ProductCard;