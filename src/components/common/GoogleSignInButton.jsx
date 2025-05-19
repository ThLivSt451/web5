import React from 'react';

function GoogleSignInButton({ onGoogleSignIn, disabled }) {
    return (
        <>
            <div className="auth-separator">
                <span>or</span>
            </div>

            <button
                onClick={onGoogleSignIn}
                className="google-auth-button"
                disabled={disabled}
            >
                <img
                    src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
                    alt="Google Logo"
                    className="google-logo"
                />
                Sign in with Google
            </button>
        </>
    );
}

export default GoogleSignInButton;