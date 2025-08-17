import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'USA'
        }
      });
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get('/orders/my');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const onChange = (e) => {
    if (e.target.name.startsWith('address.')) {
      const addressField = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/auth/profile', formData);
      const { token, ...userData } = response.data;
      login(userData, token);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>My Account</h1>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid #e9ecef'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            Order History
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3>Profile Information</h3>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <h4 style={{ margin: '2rem 0 1rem 0', color: '#333' }}>Address</h4>

              <div className="form-group">
                <label htmlFor="address.street">Street Address</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.city">Wilaya</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: '1rem' }}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="profile-section">
            <h3>Order History</h3>
            
            {ordersLoading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h4>No orders yet</h4>
                <p>When you place orders, they will appear here.</p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <div key={order._id} style={{
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#333' }}>
                          Order #{order.orderNumber}
                        </h4>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          background: getStatusColor(order.orderStatus),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {order.orderStatus}
                        </div>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: '#333',
                          marginTop: '0.5rem'
                        }}>
                          ${order.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 style={{ marginBottom: '0.5rem', color: '#333' }}>Items:</h5>
                      {order.orderItems.map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: index < order.orderItems.length - 1 ? '1px solid #f8f9fa' : 'none'
                        }}>
                          <span>{item.name} (x{item.quantity})</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <h5 style={{ marginBottom: '0.5rem', color: '#333' }}>Shipping Address:</h5>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                        {order.shippingAddress.name}<br/>
                        {order.shippingAddress.address}<br/>
                        Wilaya: {order.shippingAddress.city}
                      </p>
                    </div>

                    {order.notes && (
                      <div style={{ marginTop: '1rem' }}>
                        <h5 style={{ marginBottom: '0.5rem', color: '#333' }}>Notes:</h5>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;