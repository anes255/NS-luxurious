import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../App';
import { formatPrice } from '../utils/currency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load product');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.countInStock || 99)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
          {error || 'Product not found'}
        </h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Product Image */}
        <div style={{
          background: 'var(--card-background)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(15px)'
        }}>
          <img 
            src={product.image} 
            alt={product.name}
            style={{
              width: '100%',
              height: '500px',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Product Info */}
        <div style={{
          background: 'var(--card-background)',
          padding: '2.5rem',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(15px)'
        }}>
          {/* Category Badge */}
          {product.category && (
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {product.category}
            </div>
          )}

          {/* Product Name */}
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: 'var(--text-color)',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            {product.name}
          </h1>

          {/* Brand */}
          {product.brand && (
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--primary-color)',
              marginBottom: '1.5rem',
              fontWeight: '500'
            }}>
              by {product.brand}
            </p>
          )}

          {/* Price */}
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--primary-color)',
            marginBottom: '2rem',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {formatPrice(product.price)}
          </div>

          {/* Stock Status */}
          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: product.countInStock > 0 
              ? 'rgba(212, 237, 218, 0.5)' 
              : 'rgba(248, 215, 218, 0.5)',
            borderRadius: '12px',
            border: `2px solid ${product.countInStock > 0 ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <span style={{
              fontWeight: '600',
              color: product.countInStock > 0 ? '#155724' : '#721c24'
            }}>
              {product.countInStock > 0 
                ? `In Stock (${product.countInStock} available)` 
                : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              marginBottom: '1rem',
              color: 'var(--text-color)',
              fontWeight: '600'
            }}>
              Description
            </h3>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.8',
              color: 'var(--text-color)',
              opacity: '0.9'
            }}>
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          {product.countInStock > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-color)'
              }}>
                Quantity
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="btn btn-secondary"
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: '0',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  minWidth: '60px',
                  textAlign: 'center',
                  color: 'var(--text-color)'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.countInStock}
                  className="btn btn-secondary"
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: '0',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0 || addedToCart}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1.25rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}
          >
            {addedToCart ? '✓ Added to Cart!' : 
             product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Additional Info */}
          {product.featured && (
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2))',
              borderRadius: '12px',
              marginTop: '1rem',
              border: '2px solid rgba(255, 193, 7, 0.3)'
            }}>
              <span style={{
                fontSize: '1.5rem',
                marginRight: '0.5rem'
              }}>⭐</span>
              <span style={{
                fontWeight: '600',
                color: '#856404'
              }}>
                Featured Product
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
