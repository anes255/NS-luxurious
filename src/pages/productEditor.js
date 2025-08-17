import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Luxury Bags',
    image: '',
    images: '',
    quantity: '',
    featured: false,
    sizes: '',
    colors: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
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
    if (isEditing) {
      loadProduct();
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (productForm.image) {
      setImagePreview(productForm.image);
    }
  }, [productForm.image]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      const product = response.data;
      
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image: product.image,
        images: (product.images || []).join(', '),
        quantity: product.quantity.toString(),
        featured: product.featured || false,
        sizes: (product.sizes || []).join(', '),
        colors: (product.colors || []).join(', ')
      });
    } catch (error) {
      setError('Failed to load product');
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!productForm.name || !productForm.description || !productForm.price || !productForm.image || !productForm.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(productForm.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (parseInt(productForm.quantity) < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        quantity: parseInt(productForm.quantity),
        images: productForm.images ? productForm.images.split(',').map(img => img.trim()).filter(img => img) : [],
        sizes: productForm.sizes ? productForm.sizes.split(',').map(size => size.trim()).filter(size => size) : [],
        colors: productForm.colors ? productForm.colors.split(',').map(color => color.trim()).filter(color => color) : [],
        inStock: parseInt(productForm.quantity) > 0
      };

      if (isEditing) {
        await axios.put(`/admin/products/${id}`, productData);
        setSuccess('Product updated successfully!');
      } else {
        await axios.post('/admin/products', productData);
        setSuccess('Product created successfully!');
        // Reset form for new product
        setProductForm({
          name: '', description: '', price: '', category: 'Luxury Bags',
          image: '', images: '', quantity: '', featured: false, sizes: '', colors: ''
        });
        setImagePreview('');
      }

      setTimeout(() => {
        setSuccess('');
        if (isEditing) {
          navigate('/admin/dashboard');
        }
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setProductForm({ ...productForm, image: url });
    
    // Validate URL format
    try {
      new URL(url);
      setImagePreview(url);
    } catch {
      setImagePreview('');
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333' }}>
            {isEditing ? '✏️ Edit Product' : '➕ Add New Product'}
          </h1>
          <button 
            onClick={handleCancel}
            className="btn btn-outline"
          >
            ← Back to Dashboard
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="profile-section">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>📝 Basic Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="form-control"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="form-control"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="form-control"
                rows="4"
                placeholder="Describe your product in detail..."
                required
              />
              <small style={{ color: '#666' }}>
                Characters: {productForm.description.length}/1000
              </small>
            </div>

            {/* Pricing and Inventory */}
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>💰 Pricing & Inventory</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Price * ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="form-control"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity in Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                  className="form-control"
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  ⭐ Featured Product
                </label>
                <small style={{ color: '#666' }}>Featured products appear on the home page</small>
              </div>
            </div>

            {/* Images */}
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>🖼️ Product Images</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
              <div>
                <div className="form-group">
                  <label>Main Image URL *</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={handleImageUrlChange}
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <small style={{ color: '#666' }}>
                    This will be the primary image displayed for your product
                  </small>
                </div>

                <div className="form-group">
                  <label>Additional Images (Optional)</label>
                  <textarea
                    value={productForm.images}
                    onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                    className="form-control"
                    rows="3"
                    placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg"
                  />
                  <small style={{ color: '#666' }}>
                    Separate multiple image URLs with commas
                  </small>
                </div>
              </div>

              {/* Image Preview */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Image Preview
                </label>
                <div style={{
                  width: '100%',
                  height: '200px',
                  border: '2px dashed #ddd',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa'
                }}>
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Product preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '10px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                      <div>Image preview will appear here</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>🎨 Product Variants (Optional)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Available Sizes</label>
                <input
                  type="text"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm({...productForm, sizes: e.target.value})}
                  className="form-control"
                  placeholder="XS, S, M, L, XL, XXL"
                />
                <small style={{ color: '#666' }}>
                  Separate sizes with commas (e.g., S, M, L, XL)
                </small>
              </div>
              <div className="form-group">
                <label>Available Colors</label>
                <input
                  type="text"
                  value={productForm.colors}
                  onChange={(e) => setProductForm({...productForm, colors: e.target.value})}
                  className="form-control"
                  placeholder="Red, Blue, Black, White, Pink"
                />
                <small style={{ color: '#666' }}>
                  Separate colors with commas (e.g., Red, Blue, Black)
                </small>
              </div>
            </div>

            {/* Product Preview */}
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>👀 Product Preview</h3>
            
            <div style={{
              border: '2px solid #e9ecef',
              borderRadius: '12px',
              padding: '1.5rem',
              background: '#fafafa',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
                <div>
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Product preview"
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '150px',
                      background: '#ddd',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666'
                    }}>
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                    {productForm.name || 'Product Name'}
                    {productForm.featured && <span style={{ color: '#ffc107', marginLeft: '0.5rem' }}>⭐</span>}
                  </h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Category: {productForm.category}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {productForm.description || 'Product description will appear here...'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: '#e91e63' 
                    }}>
                      ${productForm.price || '0.00'}
                    </span>
                    <span style={{ 
                      color: productForm.quantity && parseInt(productForm.quantity) > 0 ? '#28a745' : '#dc3545',
                      fontSize: '0.9rem'
                    }}>
                      {productForm.quantity && parseInt(productForm.quantity) > 0 
                        ? `${productForm.quantity} in stock` 
                        : 'Out of stock'
                      }
                    </span>
                  </div>
                  {(productForm.sizes || productForm.colors) && (
                    <div style={{ marginTop: '1rem' }}>
                      {productForm.sizes && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Sizes:</strong> {productForm.sizes}
                        </div>
                      )}
                      {productForm.colors && (
                        <div>
                          <strong>Colors:</strong> {productForm.colors}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                style={{ padding: '1rem 2rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '1rem 2rem' }}
              >
                {loading ? (
                  <>
                    <div style={{ 
                      display: 'inline-block', 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #ffffff', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }}></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? '💾 Update Product' : '✨ Create Product'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips and Guidelines */}
        <div className="profile-section" style={{ marginTop: '2rem' }}>
          <h3 style={{ color: '#333' }}>💡 Tips for Better Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#e91e63', fontSize: '1rem', marginBottom: '0.5rem' }}>📸 Images</h4>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <li>Use high-quality images (at least 800x800px)</li>
                <li>Show product from multiple angles</li>
                <li>Use consistent lighting and background</li>
              </ul>
            </div>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#e91e63', fontSize: '1rem', marginBottom: '0.5rem' }}>📝 Description</h4>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <li>Highlight key features and benefits</li>
                <li>Include material and care instructions</li>
                <li>Mention dimensions or sizing details</li>
              </ul>
            </div>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#e91e63', fontSize: '1rem', marginBottom: '0.5rem' }}>💰 Pricing</h4>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <li>Research competitor pricing</li>
                <li>Consider your cost and desired margin</li>
                <li>Use psychological pricing (e.g., $99.99)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;