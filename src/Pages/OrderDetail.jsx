import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../services/authService';
import styles from './OrderDetail.module.css';

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return styles.badgeSuccess;
      case 'Shipped':
        return styles.badgeInfo;
      case 'Processing':
        return styles.badgeWarning;
      case 'Confirmed':
        return styles.badgePrimary;
      case 'Cancelled':
        return styles.badgeDanger;
      case 'Payment Pending':
        return styles.badgeSecondary;
      default:
        return styles.badgeSecondary;
    }
  };

  // Determine if order requires payment action
  const isPaymentPending = (order) => {
    return order?.status === 'Payment Pending' || 
           order?.paymentStatus === 'PAYER_ACTION_REQUIRED';
  };

  // Handle complete payment button click
  const handleCompletePayment = () => {
    // Navigate to order status page where payment can be completed
    navigate(`/order-status/${order.paypalOrderId || order.id}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Loading order details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorAlert}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/orders')}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Order not found</h2>
          <button 
            onClick={() => navigate('/orders')}
            className={`${styles.button} ${styles.secondaryButton} ${styles.buttonLarge}`}
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Order Details</h1>
        <button 
          onClick={() => navigate('/orders')}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Back to My Orders
        </button>
      </div>
      
      {/* Payment Action Alert for Pending Payments */}
      {isPaymentPending(order) && (
        <div className={styles.paymentAlert}>
          <h3>Payment Action Required</h3>
          <p>This order requires your action to complete the payment process.</p>
          <button
            onClick={handleCompletePayment}
            className={`${styles.button} ${styles.warningButton} ${styles.buttonLarge}`}
          >
            Complete Payment Now
          </button>
        </div>
      )}
      
      <div className={`${styles.card} ${styles.orderOverview}`}>
        <div>
          <h3 className={styles.cardTitle}>Order Information</h3>
          <p><strong>Order ID:</strong> {order.id || 'N/A'}</p>
          <p><strong>Date Placed:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p>
            {/*Hide status badge for now */}
            {/* <strong>Status:</strong> 
            <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
              {order.status || 'Processing'}
            </span> */}
            
            {/* Complete Payment Button next to status if payment is pending */}
            {isPaymentPending(order) && (
              <button
                onClick={handleCompletePayment}
                className={`${styles.button} ${styles.warningButton} ${styles.buttonSmall}`}
              >
                Complete Payment
              </button>
            )}
          </p>
          {order.trackingNumber && (
            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
          )}
        </div>
        
        <div>
          <h3 className={styles.cardTitle}>Payment Information</h3>
          <p><strong>Method:</strong> {order.paymentMethod || 'PayPal'}</p>
          <p>
            <strong>Status:</strong> 
            <span className={`${styles.badge} ${order.isPaid ? styles.badgeSuccess : styles.badgeWarning}`}>
              {order.isPaid ? 'Paid' : 'Pending'}
            </span>
          </p>
          {order.isPaid && order.paidAt && (
            <p><strong>Paid On:</strong> {new Date(order.paidAt).toLocaleDateString()}</p>
          )}
        </div>
        

        {/* Add Shipping Information Section */}
        {/* <div>
          <h3 className={styles.cardTitle}>Shipping Information</h3>
          <p>
            <strong>Status:</strong> 
            <span className={`${styles.badge} ${order.isDelivered ? styles.badgeSuccess : styles.badgeWarning}`}>
              {order.isDelivered ? 'Delivered' : 'Pending'}
            </span>
          </p>
          {order.isDelivered && order.deliveredAt && (
            <p><strong>Delivered On:</strong> {new Date(order.deliveredAt).toLocaleDateString()}</p>
          )}
        </div> */}
      </div>

      {order.shippingAddress && (
        <div className={`${styles.card} ${styles.addressSection}`}>
          <h3 className={styles.cardTitle}>Shipping Address</h3>
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
      
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Order Items</h3>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Color</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.orderItems || []).map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className={styles.productCell}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className={styles.productImage}
                        />
                      )}
                      <span>{item.name || 'Product'}</span>
                    </div>
                  </td>
                  <td>${(item.price || 0).toFixed(2)}</td>
                  <td>{item.quantity || 0}</td>
                  <td>
                    {item.color ? (
                      <div className={styles.colorSwatch} style={{ backgroundColor: item.color }}></div>
                    ) : 'N/A'}
                  </td>
                  <td>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.measurements && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Measurements</h3>
          <div className={styles.measurementsGrid}>
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
      
      {/* Add Color Preference Section */}
      {order.colorPreference && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Color Preference</h3>
          <div className={styles.colorPreference}>
            <div className={styles.colorItem}>
              <strong>Primary Color:</strong>
              <div 
                className={`${styles.colorSwatch} ${styles.large}`} 
                style={{ backgroundColor: order.colorPreference.primaryColor || '#000000' }}
              ></div>
            </div>
            
            {order.colorPreference.description && (
              <div>
                <strong>Notes:</strong>
                <p>{order.colorPreference.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Order Summary</h3>
        
        <div className={styles.orderSummary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>${(order.totalPrice || 0).toFixed(2)}</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total:</span>
            <span>${(order.totalPrice || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.actionButtons}>
        <button 
          onClick={() => navigate('/orders')}
          className={`${styles.button} ${styles.secondaryButton} ${styles.buttonLarge}`}
        >
          Back to My Orders
        </button>
        
        {/* Add Complete Payment button if payment is pending */}
        {isPaymentPending(order) ? (
          <button 
            onClick={handleCompletePayment}
            className={`${styles.button} ${styles.warningButton} ${styles.buttonLarge}`}
          >
            Complete Payment
          </button>
        ) : (
          <button 
            onClick={() => navigate('/shop')}
            className={`${styles.button} ${styles.primaryButton} ${styles.buttonLarge}`}
          >
            Continue Shopping
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;