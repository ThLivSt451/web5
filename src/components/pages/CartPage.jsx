import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import '../../styles/cart.css';

function CartPage() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        clearCart
    } = useContext(CartContext);

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity > 0) {
            updateQuantity(id, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (cart.length > 0) {
            alert(`Дякуємо за покупку! Сума покупки становить ${getTotalPrice().toFixed(2)} UAH`);
            clearCart();
        }
    };

    return (
        <div className="cart-container">
            <Link to="/" className="continue-shopping">← Продовжити покупки</Link>
            <h2>🛒 Ваш кошик</h2>

            <div id="cart-container">
                {cart.length === 0 ? (
                    <p id="empty-cart">Ваш кошик пустий.</p>
                ) : (
                    <table id="cart-table">
                        <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Ціна</th>
                            <th>Кількість</th>
                            <th>Сума</th>
                            <th>Видалити</th>
                        </tr>
                        </thead>
                        <tbody id="cart-items">
                        {cart.map((item) => {
                            const itemTotal = item.price * item.quantity;

                            return (
                                <tr key={item.id}>
                                    <td className="product-info">
                                        <img src={item.image} alt={item.name} className="cart-item-image" />
                                        <span>{item.name}</span>
                                    </td>
                                    <td>{item.price.toFixed(2)} UAH</td>
                                    <td>
                                        <div className="quantity-control">
                                            <button
                                                className="quantity-btn decrease"
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                className="quantity-input"
                                            />
                                            <button
                                                className="quantity-btn increase"
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="item-total">{itemTotal.toFixed(2)} UAH</td>
                                    <td>
                                        <button
                                            className="remove-item"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            ❌
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {cart.length > 0 && (
                <div id="cart-summary">
                    <h3>Total: <span id="total-price">{getTotalPrice().toFixed(2)} UAH</span></h3>
                    <button id="checkout-button" onClick={handleCheckout}>Оплата</button>
                </div>
            )}
        </div>
    );
}

export default CartPage;