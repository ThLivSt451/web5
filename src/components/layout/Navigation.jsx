import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

function Navigation() {
    const { getTotalItems } = useContext(CartContext);

    return (
        <nav>
            <Link to="/"><span>Товари</span></Link>
            <Link to="/sales"><span>Акції</span></Link>
            <Link to="/profile"><span>Профіль</span></Link>
            <Link to="/about"><span>Про нас</span></Link>
            <Link to="/cart">🛒 Кошик (<span id="cart-count">{getTotalItems()}</span>)</Link>
        </nav>
    );
}

export default Navigation;