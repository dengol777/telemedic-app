import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { login } from './api';

const App = () => {
  const [token, setToken] = useState(null);

  const handleLogin = async (username, password) => {
    const data = await login(username, password);
    setToken(data.token);
    return data;
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
