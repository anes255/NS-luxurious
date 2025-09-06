import React, { useState } from 'react';
import { useCart, useAuth } from '../App';
import { formatPrice } from '../utils/currency';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      addToCart(product);
      // Show success message
      const button = document.getElementById(`add-btn-${product._id}`);
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.style.background = '#28a745';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
    setIsAdding(false);
  };

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x250?text=Image+Not+Available';
        }}
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description
          }
        </p>
        <div className="product-price">{formatPrice(product.price)}</div>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ 
            color: product.inStock ? '#28a745' : '#dc3545',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            {product.inStock ? `In Stock (${product.quantity})` : 'Out of Stock'}
          </span>
        </div>
        <button
          id={`add-btn-${product._id}`}
          className="btn btn-primary"
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
          style={{ 
            width: '100%',
            opacity: !product.inStock ? 0.6 : 1,
            cursor: !product.inStock ? 'not-allowed' : 'pointer'
          }}
        >
          {isAdding ? 'Adding...' : !product.inStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
