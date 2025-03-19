// src/Pages/Profile.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user orders when the component mounts
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // You would implement this API call when you have the orders endpoint
        // const response = await fetch('/api/orders', {
        //   headers: {
        //     Authorization: `Bearer ${getAccessToken()}`
        //   }
        // });
        // const data = await response.json();
        // setOrders(data);
        
        // Placeholder for now
        setOrders([
          { id: '1001', date: '2025-03-10', status: 'Delivered', total: 149.99 },
          { id: '1002', date: '2025-03-15', status: 'Processing', total: 89.50 }
        ]);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
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
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.role}</p>
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
        <h2>Order History</h2>
        
        {loading ? (
          <p>Loading your orders...</p>
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
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{order.id}</td>
                  <td style={{ padding: '0.5rem' }}>{order.date}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ 
                      backgroundColor: order.status === 'Delivered' ? '#28a745' : '#ffc107',
                      color: order.status === 'Delivered' ? 'white' : 'black',
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
                      onClick={() => navigate(`/order-status/${order.id}`)}
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
          <p style={{ marginTop: '1rem' }}>You haven&apos;t placed any orders yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;