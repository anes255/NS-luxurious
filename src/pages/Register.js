import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const { name, email, phone, password, confirmPassword, address } = formData;

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
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!address.street || !address.city) {
      setError('Please fill in all address fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/register', {
        name,
        email,
        phone,
        password,
        address: {
          street: address.street,
          city: address.city,
          state: address.city, // Use city as state for simplicity
          zipCode: '00000', // Default zip code
          country: 'USA' // Default country
        }
      });

      const { token, ...userData } = response.data;
      login(userData, token);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="form-container" style={{ maxWidth: '450px' }}>
        <h2 className="form-title">Join NS Luxurious</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* Personal Information */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Address Information */}
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
            Address Information
          </h3>

          <div className="form-group">
            <label htmlFor="address.street">Street Address *</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={address.street}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your street address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.city">City *</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={address.city}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your city"
              required
            />
          </div>

          {/* Password */}
          <h3 style={{ margin: '2rem 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>
            Account Security
          </h3>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-control"
              placeholder="Enter your password (min. 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="form-control"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6c63ff', textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;