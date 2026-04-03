import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api';

const navItems = [
  { path: '/admin/stats', label: 'Statistiques', icon: '📊' },
  { path: '/admin/orders', label: 'Commandes', icon: '📦' },
  { path: '/admin/products', label: 'Produits', icon: '🏷️' },
  { path: '/admin/shipping', label: 'Livraison', icon: '🚚' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ns-admin-token');
    if (!token) { navigate('/admin/login'); return; }
    api.get('/auth/verify').then(() => setChecking(false)).catch(() => {
      localStorage.removeItem('ns-admin-token');
      navigate('/admin/login');
    });
  }, []);

  if (checking) return <div style={{ padding: 60, textAlign: 'center' }}>Chargement...</div>;

  const logout = () => {
    localStorage.removeItem('ns-admin-token');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 100,
          background: 'var(--burgundy)', color: '#fff', padding: '8px 14px',
          borderRadius: 8, fontSize: '1.2rem'
        }}
        className="mobile-menu-btn"
      >☰</button>

      <aside className="admin-sidebar" style={menuOpen ? { display: 'block' } : {}}>
        <div className="admin-sidebar-logo">NS <span>Luxurious</span></div>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-nav-item ${location.pathname === item.path || (item.path === '/admin/stats' && location.pathname === '/admin') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 16 }}>
          <Link to="/" className="admin-nav-item" target="_blank">
            <span>🌐</span><span>Voir le site</span>
          </Link>
          <div className="admin-nav-item" onClick={logout}>
            <span>🚪</span><span>Déconnexion</span>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.3s; }
          .admin-sidebar[style*="display: block"] { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
