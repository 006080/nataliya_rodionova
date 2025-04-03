import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../services/authService';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };

  useEffect(() => {
    // Fetch real user orders from the server
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await authFetch(`${getApiUrl()}/api/orders`);
        
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Unable to fetch your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get color based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#28a745'; // Green
      case 'Shipped':
        return '#17a2b8'; // Teal
      case 'Processing':
        return '#ffc107'; // Yellow
      case 'Confirmed':
        return '#007bff'; // Blue
      case 'Cancelled':
        return '#dc3545'; // Red
      case 'Payment Pending':
        return '#6c757d'; // Gray
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusTextColor = (status) => {
    return ['Delivered', 'Shipped', 'Confirmed'].includes(status) ? 'white' : 'black';
  };

  if (!user) {
    return <div className="loading-container">Loading user information...</div>;
  }

  return (
    <div className="profile-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Your Profile</h1>
      
      <div className="profile-card" style={{ 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        padding: '2rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <p><strong>Name:</strong></p>
            <p><strong>Email:</strong></p>
            <p><strong>Role:</strong></p>
          </div>
          <div>
            <p>{user.name || 'Not provided'}</p>
            <p>{user.email || 'Not provided'}</p>
            <p>{user.role || 'Customer'}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.5rem 1rem', 
            marginTop: '1rem',
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </div>
      
      <div className="orders-section" style={{ 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        padding: '2rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Recent Orders</h2>
          <button 
            onClick={() => navigate('/orders')}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '0.5rem 1rem',
              cursor: 'pointer' 
            }}
          >
            View All Orders
          </button>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '0.75rem', 
            borderRadius: '4px', 
            marginTop: '1rem' 
          }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Total</th>
                <th style={{ textAlign: 'center', padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{order.id.substring(0, 8)}...</td>
                  <td style={{ padding: '0.5rem' }}>{order.date}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ 
                      backgroundColor: getStatusColor(order.status),
                      color: getStatusTextColor(order.status),
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>${order.total.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <button 
                      onClick={() => navigate(`/orders/${order.id}`)}
                      style={{ 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>You haven&apos;t placed any orders yet.</p>
            <button 
              onClick={() => navigate('/shop')}
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '0.5rem 1rem', 
                marginTop: '1rem',
                cursor: 'pointer' 
              }}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;