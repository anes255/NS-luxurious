import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/adminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ThemeControl from './pages/themeControl';
import ProductEditor from './pages/productEditor';
import './App.css';

// Create contexts
const AuthContext = createContext();
const CartContext = createContext();
const ThemeContext = createContext();

// Context providers
export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useTheme = () => useContext(ThemeContext);

// Set up axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [themeLoading, setThemeLoading] = useState(true);

  // Apply theme to CSS variables
  const applyThemeToCSS = (themeConfig) => {
    if (!themeConfig) return;
    
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--primary-color', themeConfig.primary);
    root.style.setProperty('--secondary-color', themeConfig.secondary);
    root.style.setProperty('--accent-color', themeConfig.accent);
    root.style.setProperty('--text-color', themeConfig.textColor);
    root.style.setProperty('--border-color', themeConfig.borderColor);
    root.style.setProperty('--background-gradient', themeConfig.background);
    root.style.setProperty('--card-background', themeConfig.cardBackground);

    // Apply to body
    document.body.style.background = themeConfig.background;
    document.body.style.color = themeConfig.textColor;
    document.body.style.transition = 'all 0.3s ease';

    console.log('Theme applied:', themeConfig.themeName);
  };

  // Load theme from backend
  const loadTheme = async () => {
    try {
      const response = await axios.get('/theme');
      console.log('Theme loaded from server:', response.data);
      setTheme(response.data);
      applyThemeToCSS(response.data);
    } catch (error) {
      console.error('Error loading theme:', error);
      // Use default theme if loading fails
      const defaultTheme = {
        primary: '#e91e63',
        secondary: '#f06292',
        accent: '#ec407a',
        background: 'linear-gradient(135deg, #ffeef8 0%, #fff0f5 50%, #fdf2f8 100%)',
        cardBackground: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,242,248,0.7))',
        textColor: '#4a4a4a',
        borderColor: '#f8bbd9',
        themeName: 'Pink Theme'
      };
      setTheme(defaultTheme);
      applyThemeToCSS(defaultTheme);
    } finally {
      setThemeLoading(false);
    }
  };

  useEffect(() => {
    // Load theme immediately
    loadTheme();
    
    // Poll for theme changes every 10 seconds for more responsive updates
    const interval = setInterval(() => {
      loadTheme();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loadTheme, themeLoading, applyThemeToCSS }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Admin Layout Component
const AdminLayout = ({ children, setAdmin }) => {
  return (
    <div className="App">
      <div style={{ 
        background: 'var(--background-gradient)',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Check for existing user/admin on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      // Check admin token
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      setAdmin({ email: 'nessbusiness66@gmail.com', role: 'admin' });
      setLoading(false);
    } else if (token) {
      // Check user token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/auth/profile')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Auth functions
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdmin(null);
    setCart([]);
  };

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ user, login, logout }}>
        <CartContext.Provider value={{
          cart,
          addToCart,
          removeFromCart,
          updateQuantity,
          clearCart,
          getCartTotal,
          getCartItemCount
        }}>
          <Router>
            <div className="App">
              {/* Check if admin is logged in */}
              {admin ? (
                // Admin Routes - No Header/Footer
                <AdminLayout setAdmin={setAdmin}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/theme" element={<ThemeControl />} />
                    <Route path="/admin/product/new" element={<ProductEditor />} />
                    <Route path="/admin/product/edit/:id" element={<ProductEditor />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              ) : (
                // Regular User Routes - With Header/Footer
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route 
                        path="/login" 
                        element={!user ? <Login /> : <Navigate to="/" replace />} 
                      />
                      <Route 
                        path="/register" 
                        element={!user ? <Register /> : <Navigate to="/" replace />} 
                      />
                      <Route 
                        path="/profile" 
                        element={user ? <Profile /> : <Navigate to="/login" replace />} 
                      />
                      <Route 
                        path="/checkout" 
                        element={user ? <Checkout /> : <Navigate to="/login" replace />} 
                      />
                      <Route 
                        path="/admin" 
                        element={<AdminLogin setAdmin={setAdmin} />} 
                      />
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              )}
            </div>
          </Router>
        </CartContext.Provider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
