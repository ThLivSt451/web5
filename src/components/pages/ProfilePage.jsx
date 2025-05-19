import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import '../../styles/profile.css';

function ProfilePage() {
    const { currentUser, logout, updateUserData, removeFromWishlist } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        fullName: '',
        email: ''
    });
    const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'wishlist'
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setUserData({
            fullName: currentUser.displayName || '',
            email: currentUser.email || ''
        });
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setUserData({
                fullName: currentUser.displayName || '',
                email: currentUser.email || ''
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            await updateUserData(currentUser.uid, {
                displayName: userData.fullName
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

    const handleRemoveFromWishlist = (productId) => {
        removeFromWishlist(productId);
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <section className="profile-container">
            <div className="profile-header">
                <img src={currentUser.photoURL || "/images/profile-placeholder.jpg"} alt="Profile" />
                <div>
                    {isEditing ? (
                        <div className="edit-form">
                            <input
                                type="text"
                                name="fullName"
                                value={userData.fullName}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className="edit-input"
                            />
                            <div className="edit-actions">
                                <button onClick={handleSave} className="save-btn">Save</button>
                                <button onClick={handleEditToggle} className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2>{currentUser.displayName || 'User'}</h2>
                            <p>Email: {currentUser.email}</p>
                            <div className="profile-actions">
                                <button className="edit-profile" onClick={handleEditToggle}>Edit Profile</button>
                                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchases')}
                >
                    Purchase History
                </button>
                <button
                    className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wishlist')}
                >
                    Wishlist
                </button>
            </div>

            {activeTab === 'purchases' && (
                <div className="profile-section">
                    <h3>Purchase History</h3>
                    {currentUser.purchaseHistory && currentUser.purchaseHistory.length > 0 ? (
                        <table className="purchase-table">
                            <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentUser.purchaseHistory.map((purchase, index) => (
                                <tr key={index}>
                                    <td>{purchase.item}</td>
                                    <td>{purchase.price.toFixed(2)} UAH</td>
                                    <td>{purchase.quantity || 1}</td>
                                    <td>{purchase.date}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <p>No purchase history yet.</p>
                            <Link to="/">Start shopping</Link>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'wishlist' && (
                <div className="profile-section">
                    <h3>Wishlist</h3>
                    {currentUser.wishlist && currentUser.wishlist.length > 0 ? (
                        <div className="wishlist-items">
                            {currentUser.wishlist.map((item, index) => (
                                <div key={index} className="wishlist-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="wishlist-item-info">
                                        <h4>{item.name}</h4>
                                        <div className="wishlist-item-price">{item.price.toFixed(2)} UAH</div>
                                        <div className="wishlist-item-actions">
                                            <button
                                                className="wishlist-add-to-cart"
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                🛒 Add to Cart
                                            </button>
                                            <button
                                                className="wishlist-remove-btn"
                                                onClick={() => handleRemoveFromWishlist(item.id)}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Your wishlist is empty.</p>
                            <Link to="/">Browse products</Link>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default ProfilePage;