// components/AdminProductList.jsx
import { useState, useEffect } from 'react';
import styles from './AdminProductList.module.css';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    tags: ''
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    });
  };

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      tags: product.tags ? product.tags.join(', ') : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      tags: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Parse tags from comma-separated string to array
      const productData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      
      let url = 'http://localhost:4000/api/products';
      let method = 'POST';
      
      // If editing, use PUT and include ID
      if (editingProduct) {
        url = `http://localhost:4000/api/products/${editingProduct}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Refresh product list
      fetchProducts();
      
      // Reset form
      handleCancelEdit();
      
    } catch (err) {
      setError(`Failed to save product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Refresh product list
      fetchProducts();
      
    } catch (err) {
      setError(`Failed to delete product: ${err.message}`);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className={styles.adminContainer}>
      <h2>Product Management</h2>
      
      <form onSubmit={handleSubmit} className={styles.productForm}>
        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (comma-separated):</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
          />
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className={styles.productList}>
        <h3>Current Products</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name}</td>
                <td>€{product.price.toFixed(2)}</td>
                <td>{product.status}</td>
                <td>{product.category || '-'}</td>
                <td>
                  <button 
                    onClick={() => handleEditClick(product)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProductList;