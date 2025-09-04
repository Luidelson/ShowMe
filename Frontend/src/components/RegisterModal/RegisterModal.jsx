import './RegisterModal.css';
import { useState } from 'react';

function RegisterModal({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        'https://api.showme.jumpingcrab.com/api/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, confirmPassword }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (onRegister) onRegister(data);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="register-modal">
      <form onSubmit={handleSubmit} className="register-modal__form">
        <h2 className="register-modal__title">Register</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="register-modal__input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="register-modal__input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="register-modal__input"
        />
        <button
          type="submit"
          disabled={loading}
          className="register-modal__submit"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <div className="register-modal__error">{error}</div>}
      </form>
    </div>
  );
}

export default RegisterModal;
