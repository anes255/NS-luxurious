import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('ns-admin-token', res.data.token);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>NS <span style={{ color: 'var(--gold)' }}>Luxurious</span></h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 32 }}>Administration</p>
        <div className="form-group">
          <label>Nom d'utilisateur</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
        </div>
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}
