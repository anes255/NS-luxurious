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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/upload/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'email': 'nessbusiness66@gmail.com',
          'password': 'lavieestbelle070478'
        }
      });

      setProductForm({ ...productForm, image: response.data.imageUrl });
      setImagePreview(response.data.imageUrl);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setError('All files must be images');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image file must be less than 5MB');
        return;
      }
    }

    setUploadingImages(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'email': 'nessbusiness66@gmail.com',
          'password': 'lavieestbelle070478'
        }
      });

      // Add new image URLs to existing ones
      const currentImages = productForm.images ? productForm.images.split(',').map(img => img.trim()).filter(img => img) : [];
      const newImages = [...currentImages, ...response.data.imageUrls];
      setProductForm({ ...productForm, images: newImages.join(', ') });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
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

  const removeImageFromList = (indexToRemove) => {
    const currentImages = productForm.images.split(',').map(img => img.trim()).filter(img => img);
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    setProductForm({ ...productForm, images: updatedImages.join(', ') });
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333' }}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <button 
            onClick={handleCancel}
            className="btn btn-outline"
          >
            Back to Dashboard
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
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Basic Information</h3>
            
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
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>Pricing & Inventory</h3>
            
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
                  Featured Product
                </label>
                <small style={{ color: '#666' }}>Featured products appear on the home page</small>
              </div>
            </div>

            {/* Images */}
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>Product Images</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
              <div>
                {/* Main Image Upload */}
                <div className="form-group">
                  <label>Main Product Image *</label>
                  <div style={{ 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    textAlign: 'center',
                    background: '#fafafa',
                    marginBottom: '1rem'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      style={{ display: 'none' }}
                      id="main-image-upload"
                      disabled={uploadingImage}
                    />
                    <label 
                      htmlFor="main-image-upload" 
                      className="btn btn-secondary"
                      style={{ 
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        opacity: uploadingImage ? 0.6 : 1 
                      }}
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload Main Image'}
                    </label>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      Or drag and drop an image here (Max 5MB)
                    </p>
                  </div>
                  
                  <label>Or enter image URL:</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={handleImageUrlChange}
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Additional Images Upload */}
                <div className="form-group">
                  <label>Additional Images (Optional)</label>
                  <div style={{ 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    textAlign: 'center',
                    background: '#fafafa',
                    marginBottom: '1rem'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleImagesUpload}
                      style={{ display: 'none' }}
                      id="additional-images-upload"
                      disabled={uploadingImages}
                    />
                    <label 
                      htmlFor="additional-images-upload" 
                      className="btn btn-secondary"
                      style={{ 
                        cursor: uploadingImages ? 'not-allowed' : 'pointer',
                        opacity: uploadingImages ? 0.6 : 1 
                      }}
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Additional Images'}
                    </label>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      Select multiple images (Max 5 files, 5MB each)
                    </p>
                  </div>

                  {/* Display uploaded additional images */}
                  {productForm.images && (
                    <div>
                      <label>Uploaded Additional Images:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {productForm.images.split(',').map((img, index) => {
                          const imageUrl = img.trim();
                          if (!imageUrl) return null;
                          return (
                            <div key={index} style={{ 
                              position: 'relative', 
                              display: 'inline-block',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              padding: '4px'
                            }}>
                              <img 
                                src={imageUrl} 
                                alt={`Additional ${index + 1}`}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImageFromList(index)}
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Main Image Preview
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
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                      <div>Image preview will appear here</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <h3 style={{ margin: '2rem 0 1.5rem 0', color: '#333' }}>Product Variants (Optional)</h3>
            
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
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
                disabled={loading || uploadingImage || uploadingImages}
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
                  isEditing ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;
