import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Product form state
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
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'dashboard') {
        const statsResponse = await axios.get('/admin/stats');
        setStats(statsResponse.data);
      } else if (activeTab === 'orders') {
        const ordersResponse = await axios.get('/admin/orders');
        setOrders(ordersResponse.data.orders);
      } else if (activeTab === 'products') {
        const productsResponse = await axios.get('/admin/products');
        setProducts(productsResponse.data);
      }
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        quantity: parseInt(productForm.quantity),
        images: productForm.images ? productForm.images.split(',').map(img => img.trim()) : [],
        sizes: productForm.sizes ? productForm.sizes.split(',').map(size => size.trim()) : [],
        colors: productForm.colors ? productForm.colors.split(',').map(color => color.trim()) : []
      };

      if (editingProduct) {
        await axios.put(`/admin/products/${editingProduct._id}`, productData);
      } else {
        await axios.post('/admin/products', productData);
      }

      // Reset form and refresh products
      setProductForm({
        name: '', description: '', price: '', category: 'Luxury Bags',
        image: '', images: '', quantity: '', featured: false, sizes: '', colors: ''
      });
      setEditingProduct(null);
      fetchDashboardData();
    } catch (error) {
      setError('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      images: (product.images || []).join(', '),
      quantity: product.quantity.toString(),
      featured: product.featured,
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', ')
    });
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/admin/products/${productId}`);
        fetchDashboardData();
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333' }}>🏪 Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.location.href = '/admin/theme'}
              className="btn btn-secondary"
            >
              🎨 Theme Control
            </button>
            <button 
              onClick={() => window.location.href = '/admin/product/new'}
              className="btn btn-primary"
            >
              ➕ Add Product
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/';
              }}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid #e9ecef'
        }}>
          {['dashboard', 'orders', 'products'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '8px 8px 0 0', textTransform: 'capitalize' }}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : 
               tab === 'orders' ? '📦 Orders' : '🛍️ Products'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                  <div className="profile-section" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#e91e63', fontSize: '2rem', margin: '0' }}>{stats.totalOrders || 0}</h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Total Orders</p>
                  </div>
                  <div className="profile-section" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#28a745', fontSize: '2rem', margin: '0' }}>${(stats.totalRevenue || 0).toFixed(2)}</h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Total Revenue</p>
                  </div>
                  <div className="profile-section" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#17a2b8', fontSize: '2rem', margin: '0' }}>{stats.totalProducts || 0}</h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Total Products</p>
                  </div>
                  <div className="profile-section" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#ffc107', fontSize: '2rem', margin: '0' }}>{stats.pendingOrders || 0}</h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Pending Orders</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Recent Orders */}
                  <div className="profile-section">
                    <h3>📦 Recent Orders</h3>
                    {stats.recentOrders && stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map(order => (
                        <div key={order._id} style={{ 
                          padding: '1rem', 
                          marginBottom: '1rem', 
                          border: '1px solid #eee', 
                          borderRadius: '8px',
                          background: '#fafafa'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>#{order.orderNumber}</strong>
                              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                                {order.user ? order.user.name : 'Unknown'} - ${order.totalPrice.toFixed(2)}
                              </p>
                            </div>
                            <span style={{
                              background: getStatusColor(order.orderStatus),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              textTransform: 'capitalize'
                            }}>
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#666' }}>No recent orders</p>
                    )}
                  </div>

                  {/* Top Products */}
                  <div className="profile-section">
                    <h3>🏆 Top Products</h3>
                    {stats.topProducts && stats.topProducts.length > 0 ? (
                      stats.topProducts.map((product, index) => (
                        <div key={product._id} style={{ 
                          padding: '1rem', 
                          marginBottom: '1rem', 
                          border: '1px solid #eee', 
                          borderRadius: '8px',
                          background: '#fafafa'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>#{index + 1} {product._id}</strong>
                              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                                Sold: {product.totalSold} units
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                                ${product.revenue.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#666' }}>No sales data yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="profile-section">
                <h3>📦 All Orders ({orders.length})</h3>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <div key={order._id} style={{
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
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
                          <h4 style={{ margin: 0, color: '#333' }}>Order #{order.orderNumber}</h4>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '2px solid #e9ecef',
                              background: 'white'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: '#333'
                          }}>
                            ${order.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                        {/* Customer Info */}
                        <div>
                          <h5 style={{ marginBottom: '0.5rem', color: '#333' }}>👤 Customer</h5>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Name:</strong> {order.user ? order.user.name : 'N/A'}</p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Email:</strong> {order.user ? order.user.email : 'N/A'}</p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {order.user ? order.user.phone : 'N/A'}</p>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h5 style={{ marginBottom: '0.5rem', color: '#333' }}>📍 Shipping</h5>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{order.shippingAddress.name}</p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{order.shippingAddress.address}</p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Wilaya: {order.shippingAddress.city}</p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Phone: {order.shippingAddress.phone}</p>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h5 style={{ marginBottom: '0.5rem', color: '#333' }}>🛒 Items</h5>
                          {order.orderItems.map((item, index) => (
                            <p key={index} style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                              {item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          ))}
                          {order.notes && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                              <strong>Notes:</strong> {order.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No orders yet</p>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                {/* Add/Edit Product Form */}
                <div className="profile-section" style={{ marginBottom: '2rem' }}>
                  <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                  <form onSubmit={handleProductSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          className="form-control"
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
                          <option value="Luxury Bags">Luxury Bags</option>
                          <option value="Watches">Watches</option>
                          <option value="Jewelry">Jewelry</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Home Decor">Home Decor</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="form-control"
                        rows="3"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Price * ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Quantity *</label>
                        <input
                          type="number"
                          value={productForm.quantity}
                          onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                          />
                          Featured Product
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Main Image URL *</label>
                      <input
                        type="url"
                        value={productForm.image}
                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                        className="form-control"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Additional Images (comma-separated URLs)</label>
                      <input
                        type="text"
                        value={productForm.images}
                        onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                        className="form-control"
                        placeholder="https://img1.jpg, https://img2.jpg"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Available Sizes (comma-separated)</label>
                        <input
                          type="text"
                          value={productForm.sizes}
                          onChange={(e) => setProductForm({...productForm, sizes: e.target.value})}
                          className="form-control"
                          placeholder="S, M, L, XL"
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Colors (comma-separated)</label>
                        <input
                          type="text"
                          value={productForm.colors}
                          onChange={(e) => setProductForm({...productForm, colors: e.target.value})}
                          className="form-control"
                          placeholder="Red, Blue, Black, White"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn btn-primary">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                      {editingProduct && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: '', description: '', price: '', category: 'Luxury Bags',
                              image: '', images: '', quantity: '', featured: false, sizes: '', colors: ''
                            });
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Products List */}
                <div className="profile-section">
                  <h3>🛍️ All Products ({products.length})</h3>
                  {products.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {products.map(product => (
                        <div key={product._id} style={{
                          border: '1px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1rem',
                          background: 'white'
                        }}>
                          <img 
                            src={product.image} 
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '1rem'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
                            }}
                          />
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{product.name}</h4>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                            {product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...` 
                              : product.description
                            }
                          </p>
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 'bold', color: '#e91e63' }}>${product.price.toFixed(2)}</span>
                              <span style={{ color: product.inStock ? '#28a745' : '#dc3545' }}>
                                {product.inStock ? `${product.quantity} in stock` : 'Out of stock'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              Category: {product.category}
                              {product.featured && <span style={{ color: '#ffc107', marginLeft: '0.5rem' }}>⭐ Featured</span>}
                            </div>
                            {product.sizes && product.sizes.length > 0 && (
                              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                Sizes: {product.sizes.join(', ')}
                              </div>
                            )}
                            {product.colors && product.colors.length > 0 && (
                              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                Colors: {product.colors.join(', ')}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => window.location.href = `/admin/product/edit/${product._id}`}
                              className="btn btn-secondary"
                              style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="btn"
                              style={{ 
                                flex: 1, 
                                padding: '0.5rem', 
                                fontSize: '0.9rem',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No products yet. Add your first product above!</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;