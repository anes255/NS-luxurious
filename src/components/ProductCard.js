import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import { formatPrice } from '../utils/currency';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    addToCart(product, 1);
  };

  return (
    <div 
      className="product-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Featured Badge */}
      {product.featured && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 193, 7, 0.9))',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '700',
          zIndex: 2,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          ⭐ Featured
        </div>
      )}

      {/* Stock Badge */}
      {product.countInStock === 0 && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(220, 53, 69, 0.9)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '700',
          zIndex: 2,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          textTransform: 'uppercase'
        }}>
          Out of Stock
        </div>
      )}

      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image"
      />
      
      <div className="product-info">
        {/* Category */}
        {product.category && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--primary-color)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.5rem'
          }}>
            {product.category}
          </div>
        )}

        <h3 className="product-name">{product.name}</h3>
        
        {/* Brand */}
        {product.brand && (
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            marginBottom: '0.5rem'
          }}>
            by {product.brand}
          </div>
        )}

        <p className="product-description">
          {product.description.length > 80 
            ? `${product.description.substring(0, 80)}...` 
            : product.description}
        </p>
        
        <div className="product-price">{formatPrice(product.price)}</div>
        
        {/* Stock Info */}
        <div style={{
          fontSize: '0.85rem',
          color: product.countInStock > 0 ? '#28a745' : '#dc3545',
          fontWeight: '600',
          marginBottom: '1rem'
        }}>
          {product.countInStock > 0 
            ? `${product.countInStock} in stock` 
            : 'Out of stock'}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
        >
          {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
