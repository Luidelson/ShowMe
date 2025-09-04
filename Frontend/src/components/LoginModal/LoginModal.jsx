import './LoginModal.css';
import { useState } from 'react';

function LoginModal({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
  const response = await fetch('https://api.showme.jumpingcrab.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (onLogin) onLogin(data);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="login-modal">
      <form onSubmit={handleSubmit} className="login-modal__form">
        <h2 className="login-modal__title">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-modal__input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-modal__input"
        />
        <button type="submit" disabled={loading} className="login-modal__submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="login-modal__error">{error}</div>}
      </form>
    </div>
  );
}

export default LoginModal;
