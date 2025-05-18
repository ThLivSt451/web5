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
    const [activeTab, setActiveTab] = useState('wishlist'); // Changed default tab to 'wishlist' to test
    const [wishlistItems, setWishlistItems] = useState([]);
    const navigate = useNavigate();

    // Update user data when currentUser changes
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setUserData({
            fullName: currentUser.displayName || '',
            email: currentUser.email || ''
        });

        // Update wishlist items state from currentUser
        if (currentUser.wishlist) {
            setWishlistItems(currentUser.wishlist);
        }
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
        alert(`${product.name} додано до кошику!`);
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const result = await removeFromWishlist(productId);
            if (result.success) {
                // Оновлення локального стану списку бажаного
                setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
            }
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    // Ensure wishlist is always an array
    const wishlist = currentUser.wishlist || [];

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
                                <button onClick={handleSave} className="save-btn">Зберегти</button>
                                <button onClick={handleEditToggle} className="cancel-btn">Відміна</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2>{currentUser.displayName || 'User'}</h2>
                            <p>Email: {currentUser.email}</p>
                            <div className="profile-actions">
                                <button className="edit-profile" onClick={handleEditToggle}>Редагувати профіль</button>
                                <button className="logout-btn" onClick={handleLogout}>Вийти</button>
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
                                <th>Товар</th>
                                <th>Ціна</th>
                                <th>К-сть</th>
                                <th>Дата</th>
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
                            <p>Ви не здійснювали покупок (поки).</p>
                            <Link to="/">Почати покупки</Link>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'wishlist' && (
                <div className="profile-section">
                    <h3>Wishlist</h3>
                    {/* Додано консоль-лог для налагодження */}
                    {console.log('Current wishlist items:', wishlist)}
                    {wishlist && wishlist.length > 0 ? (
                        <div className="wishlist-items">
                            {wishlist.map((item, index) => (
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
                                                🛒 Додати до кошика
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
                            <p>Ваш список бажаного пустий.</p>
                            <Link to="/">Знайти товари</Link>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default ProfilePage;