import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart, useAuth } from '../App';
import { formatPrice } from '../utils/currency';

const Checkout = () => {
  const { cart, getCartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    phone: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setShippingAddress({
        name: user.name || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const onChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.phone) {
      setError('Please fill in all shipping address fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item._id
      }));

      const orderData = {
        orderItems,
        shippingAddress,
        totalPrice: getCartTotal(),
        notes
      };

      const response = await axios.post('/orders', orderData);
      
      setSuccess(`Order placed successfully! Order number: ${response.data.orderNumber}`);
      clearCart();
      
      // Redirect to profile after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>Order Confirmed!</h2>
          <div className="alert alert-success">
            {success}
          </div>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            You will receive a confirmation email shortly. We'll notify the store owner about your order.
          </p>
          <p style={{ color: '#666' }}>
            Redirecting to your profile in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Checkout</h1>

      {cart.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3>Your cart is empty</h3>
          <p>Add some products to your cart to proceed with checkout.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="checkout-container">
          {/* Order Form */}
          <div>
            <form onSubmit={handleSubmitOrder} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '2rem', color: '#333' }}>Shipping Information</h3>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={shippingAddress.name}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Wilaya *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Any special instructions for your order..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || cart.length === 0}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                  💡 <strong>Note:</strong> This is a demo store. No payment is required. 
                  Order details will be sent to the store owner for processing.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Order Summary</h3>

            {/* Cart Items */}
            <div style={{ marginBottom: '2rem' }}>
              {cart.map(item => (
                <div key={item._id} className="cart-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #e9ecef',
                  marginBottom: '1rem'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="cart-item-image"
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginRight: '1rem'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="cart-item-name" style={{ 
                      fontWeight: '600', 
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      {item.name}
                    </div>
                    <div className="cart-item-price" style={{ 
                      color: '#6c63ff', 
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      {formatPrice(item.price)} each
                    </div>
                    <div className="quantity-controls" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          fontSize: '0.8rem'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          fontSize: '0.8rem'
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          marginLeft: '0.5rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#333',
                    fontSize: '0.9rem'
                  }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            <div className="summary-item">
              <span>Shipping:</span>
              <span style={{ color: '#28a745' }}>FREE</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
