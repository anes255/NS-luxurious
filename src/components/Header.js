import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../App';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCartClick = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            NS Luxurious
          </Link>
          
          <nav>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              
              {user ? (
                <>
                  <li><Link to="/profile">Profile</Link></li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                </>
              )}
              
              <li>
                <Link 
                  to="/admin" 
                  style={{ 
                    color: '#666', 
                    fontSize: '0.8rem',
                    opacity: 0.7
                  }}
                >
                  🔐 Admin
                </Link>
              </li>
              
              <li>
                <div className="cart-icon" onClick={handleCartClick}>
                  🛒
                  {getCartItemCount() > 0 && (
                    <span className="cart-count">{getCartItemCount()}</span>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;