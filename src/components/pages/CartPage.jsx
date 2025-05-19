import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/cart.css';

function CartPage() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        clearCart
    } = useContext(CartContext);

    const { currentUser, addToPurchaseHistory } = useContext(AuthContext);

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity > 0) {
            updateQuantity(id, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (cart.length > 0) {
            const total = getTotalPrice();

            // Record purchases in user history if logged in
            if (currentUser) {
                const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

                // Add each cart item to purchase history
                cart.forEach(item => {
                    const purchaseRecord = {
                        item: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        date: currentDate,
                        productId: item.id
                    };

                    addToPurchaseHistory(purchaseRecord);
                });
            }

            alert(`Thank you for your order! Your total is ${total.toFixed(2)} UAH`);
            clearCart();
        }
    };

    return (
        <div className="cart-container">
            <Link to="/" className="continue-shopping">← Continue Shopping</Link>
            <h2>🛒 Your Shopping Cart</h2>

            <div id="cart-container">
                {cart.length === 0 ? (
                    <p id="empty-cart">Your cart is empty.</p>
                ) : (
                    <table id="cart-table">
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Remove</th>
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
                    <button id="checkout-button" onClick={handleCheckout}>Proceed to Checkout</button>
                    {!currentUser && (
                        <p className="login-prompt">
                            <Link to="/login">Log in</Link> to save your purchase history
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default CartPage;