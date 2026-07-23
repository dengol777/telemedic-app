import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(token.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '80px' }}>
      <div className="card">
        <h1>Вход в систему</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Введите JWT-токен, полученный от ONE Telemedic
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label>Токен</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              required
              style={{ width: '100%' }}
            />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
