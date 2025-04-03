import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../services/authService';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to get API URL based on environment
  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Use the correct API URL format for Vite
        const response = await authFetch(`${getApiUrl()}/api/orders/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found. It may have been removed or you may not have permission to view it.');
          }
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        
        // Make sure orderItems is an array
        if (!data.orderItems) {
          data.orderItems = [];
        }
        
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.message || 'Unable to fetch order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="order-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/orders')}
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.5rem 1rem',
            cursor: 'pointer' 
          }}
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Order not found</h2>
        <button 
          onClick={() => navigate('/orders')}
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.5rem 1rem',
            marginTop: '1rem',
            cursor: 'pointer' 
          }}
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Order Details</h1>
        <button 
          onClick={() => navigate('/orders')}
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.5rem 1rem',
            cursor: 'pointer' 
          }}
        >
          Back to My Orders
        </button>
      </div>
      
      <div className="order-overview" style={{ 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        padding: '1.5rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="order-info">
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Order Information</h3>
          <p><strong>Order ID:</strong> {order.id || 'N/A'}</p>
          <p><strong>Date Placed:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p>
            <strong>Status:</strong> 
            <span style={{ 
              backgroundColor: getStatusColor(order.status),
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              fontSize: '0.875rem'
            }}>
              {order.status || 'Processing'}
            </span>
          </p>
          {order.trackingNumber && (
            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
          )}
        </div>
        
        <div className="payment-info">
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Payment Information</h3>
          <p><strong>Method:</strong> {order.paymentMethod || 'PayPal'}</p>
          <p>
            <strong>Status:</strong> 
            <span style={{ 
              backgroundColor: order.isPaid ? '#28a745' : '#ffc107',
              color: order.isPaid ? 'white' : 'black',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              fontSize: '0.875rem'
            }}>
              {order.isPaid ? 'Paid' : 'Pending'}
            </span>
          </p>
          {order.isPaid && order.paidAt && (
            <p><strong>Paid On:</strong> {new Date(order.paidAt).toLocaleDateString()}</p>
          )}
        </div>
        
        <div className="shipping-info">
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Shipping Information</h3>
          <p>
            <strong>Status:</strong> 
            <span style={{ 
              backgroundColor: order.isDelivered ? '#28a745' : '#ffc107',
              color: order.isDelivered ? 'white' : 'black',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              marginLeft: '0.5rem',
              fontSize: '0.875rem'
            }}>
              {order.isDelivered ? 'Delivered' : 'Pending'}
            </span>
          </p>
          {order.isDelivered && order.deliveredAt && (
            <p><strong>Delivered On:</strong> {new Date(order.deliveredAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {order.shippingAddress && (
        <div className="shipping-address" style={{ 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Shipping Address</h3>
          <p><strong>{order.shippingAddress.fullName || 'N/A'}</strong></p>
          <p>{order.shippingAddress.address || 'N/A'}</p>
          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
          <p>
            {order.shippingAddress.city || 'N/A'}{order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''} {order.shippingAddress.postalCode || 'N/A'}
          </p>
          <p>{order.shippingAddress.country || 'N/A'}</p>
          {order.shippingAddress.phone && <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>}
        </div>
      )}
      
      <div className="order-items" style={{ 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        padding: '1.5rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Order Items</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Price</th>
                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Quantity</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.orderItems || []).map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover', 
                            marginRight: '1rem',
                            borderRadius: '4px'
                          }} 
                        />
                      )}
                      <span>{item.name || 'Product'}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>${(item.price || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'center', padding: '1rem' }}>{item.quantity || 0}</td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.measurements && (
        <div className="measurements" style={{ 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Measurements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <p><strong>Height:</strong> {order.measurements.height || 'N/A'} cm</p>
            </div>
            <div>
              <p><strong>Chest:</strong> {order.measurements.chest || 'N/A'} cm</p>
            </div>
            <div>
              <p><strong>Waist:</strong> {order.measurements.waist || 'N/A'} cm</p>
            </div>
            <div>
              <p><strong>Hips:</strong> {order.measurements.hips || 'N/A'} cm</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="order-summary" style={{ 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        padding: '1.5rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Order Summary</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginBottom: '0.5rem' }}>
            <span>Subtotal:</span>
            {/* <span>${(order.totalPrice - tax - shipping || 0).toFixed(2)}</span> */}
            <span>${(order.totalPrice || 0).toFixed(2)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '300px', 
            borderTop: '1px solid #ddd',
            paddingTop: '0.5rem',
            marginTop: '0.5rem',
            fontWeight: 'bold'
          }}>
            <span>Total:</span>
            <span>${(order.totalPrice || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={() => navigate('/orders')}
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.75rem 1.5rem',
            cursor: 'pointer' 
          }}
        >
          Back to My Orders
        </button>
        
        <button 
          onClick={() => navigate('/shop')}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '0.75rem 1.5rem',
            cursor: 'pointer' 
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;