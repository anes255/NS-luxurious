import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'All',
    'Luxury Bags',
    'Watches', 
    'Jewelry',
    'Accessories',
    'Shoes',
    'Clothing',
    'Electronics',
    'Home Decor'
  ];

  useEffect(() => {
    fetchProducts();
    createSampleProducts();
  }, []);

  const createSampleProducts = async () => {
    try {
      await axios.post('/products/sample');
    } catch (error) {
      // Sample products already exist or other error
      console.log('Sample products status:', error.response?.data?.message);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const response = await axios.get(`/products?${params.toString()}`);
      setProducts(response.data.products);

      // Also fetch featured products
      const featuredResponse = await axios.get('/products?featured=true');
      setFeaturedProducts(featuredResponse.data.products);
      
      setError('');
    } catch (error) {
      setError('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to NS Luxurious</h1>
          <p>Discover premium luxury goods and accessories</p>
          <p>Experience elegance, quality, and style like never before</p>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2 className="section-title">Featured Products</h2>
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Catalog */}
      <section style={{ padding: '4rem 0', background: '#fafafa' }}>
        <div className="container">
          <h2 className="section-title">Our Products</h2>
          
          {/* Search and Filter */}
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
                style={{ margin: 0 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category === 'All' ? '' : category)}
                  className={`btn ${
                    (category === 'All' && !selectedCategory) || 
                    category === selectedCategory 
                      ? 'btn-primary' 
                      : 'btn-secondary'
                  }`}
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;