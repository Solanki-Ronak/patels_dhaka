import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent. Check your inbox.');
      setError(null);
    } catch (error) {
      setError(error.message);
      setResetMessage(null);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">🍲</div>
      <h2>Welcome to Patel's Tadka</h2>
      {error && <p className="auth-error">{error}</p>}
      {resetMessage && <p className="auth-success">{resetMessage}</p>}
      {!showResetPassword ? (
        <>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Log In</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setShowResetPassword(true)} className="forgot-password-link">
              Forgot Password?
            </button>
          </div>
          <div className="auth-switch">
            <p>New to Patel's Tadka? <button onClick={() => navigate('/signup')}>Sign Up</button></p>
          </div>
        </>
      ) : (
        <form onSubmit={handleResetPassword}>
          <h3>Reset Password</h3>
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
          <button type="button" onClick={() => setShowResetPassword(false)} className="cancel-button">
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;