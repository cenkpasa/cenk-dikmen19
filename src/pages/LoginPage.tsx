import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/common/Loader';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
        const success = login(username, password);
        if (!success) {
            setError('Geçersiz kullanıcı adı veya şifre.');
        }
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>CRM Giriş</h1>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Kullanıcı Adı</label>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Şifre</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? <Loader /> : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
