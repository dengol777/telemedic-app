import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { fetchOrganizations } from './api';

const App = () => {
  const [token, setToken] = useState(null);

  const handleLogin = async (enteredToken) => {
    // Проверяем токен, запрашивая организации
    try {
      await fetchOrganizations(enteredToken);
      setToken(enteredToken);
    } catch (err) {
      throw new Error('Недействительный токен: ' + err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
};

export default App;
