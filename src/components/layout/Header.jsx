import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Header() {
    const { currentUser, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="main-header">
            <Link to="/" className="logo-link">
                <h1 className="logo">MOVEX</h1>
            </Link>

            {currentUser ? (
                <div className="user-dropdown" ref={dropdownRef}>
                    <button className="user-dropdown-btn" onClick={toggleDropdown}>
                        <img
                            src={currentUser.photoURL || "/images/profile-placeholder.jpg"}
                            alt="Profile"
                            className="user-avatar"
                        />
                        <span>{currentUser.displayName || 'User'}</span>
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/profile" className="dropdown-item">Профіль</Link>
                            <button onClick={handleLogout} className="dropdown-item logout-item">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="auth-links-header">
                    <Link to="/login" className="auth-link">Вхід</Link>
                    <Link to="/register" className="auth-link register">Реєстрація</Link>
                </div>
            )}
        </header>
    );
}

export default Header;