import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../App';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide header when scrolling down (but not immediately)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', controlHeader);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

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
    <header 
      className="header" 
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
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
                  Admin
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
