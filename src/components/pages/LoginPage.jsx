import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/auth.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/profile');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            navigate('/profile');
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h2>Login to MoveX</h2>
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-separator">
                    <span>or</span>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="google-auth-button"
                    disabled={loading}
                >
                    <img
                        src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
                        alt="Google Logo"
                        className="google-logo"
                    />
                    Sign in with Google
                </button>

                <div className="auth-links">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                    <p><Link to="/forgot-password">Forgot Password?</Link></p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;