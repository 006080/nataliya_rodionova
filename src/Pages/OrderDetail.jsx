import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../services/authService';
import styles from './OrderDetail.module.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

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
        
        const response = await authFetch(`${getApiUrl()}/api/orders/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found. It may have been removed or you may not have permission to view it.');
          }
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        
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

  // Simple status mapping for display
  const getDisplayStatus = () => {
    if (!order) return 'Unknown';
    
    // Check if order is cancelled
    if (order.status === 'Cancelled' || order.paymentStatus === 'CANCELED') {
      return 'Canceled';
    }
    
    // Map other statuses
    if (order.status === 'Processing') {
      return 'Paid';
    }
    
    return order.status || 'Processing';
  };

  const getPaymentStatusDisplay = () => {
    if (!order) return 'Unknown';
    
    // Visual update: if Order Status is "Canceled", show "Canceled"
    if (order.status === 'Cancelled' || order.paymentStatus === 'CANCELED') {
      return 'Canceled';
    }
    
    if (order.isPaid) {
      return 'Paid';
    }
    
    return 'Pending';
  };

  const getStatusBadgeClass = (displayStatus) => {
    switch (displayStatus) {
      case 'Delivered':
        return styles.badgeSuccess;
      case 'Shipped':
        return styles.badgeInfo;
      case 'Paid':
        return styles.badgeSuccess;
      case 'Processing':
        return styles.badgeWarning;
      case 'Confirmed':
        return styles.badgePrimary;
      case 'Canceled':
        return styles.badgeDanger;
      case 'Cancelled':
        return styles.badgeDanger;
      case 'StatusCancelled': 
        return styles.badgeDanger;
      case 'Payment Pending':
        return styles.badgeSecondary;
      case 'Pending':
        return styles.badgeWarning;
      default:
        return styles.badgeSecondary;
    }
  };

  // Check if order can be closed by user
  const canCloseOrder = () => {
    if (!order) return false;
    return order.status === 'PaymentActionRequired' || 
           order.paymentStatus === 'PAYER_ACTION_REQUIRED' ||
           order.status === 'Payment Pending';
  };

  // Determine if order requires payment action
  const isPaymentPending = (order) => {
    return order?.status === 'Payment Pending' || 
           order?.paymentStatus === 'PAYER_ACTION_REQUIRED' ||
           order?.status === 'PaymentActionRequired';
  };

  // Handle complete payment button click
  const handleCompletePayment = () => {
    // Navigate to order status page where payment can be completed
    navigate(`/order-status/${order.paypalOrderId || order.id}`);
  };

  const handleCloseOrder = async () => {
    setIsClosing(true);
    setError('');

    try {
      console.log('Closing order using authFetch...');
      
      // Use authFetch - same as you do for fetching order details
      const response = await authFetch(`${getApiUrl()}/api/orders/${id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You are not authorized to close this order.');
        } else if (response.status === 404) {
          throw new Error('Order not found.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'This order cannot be closed.');
        }
        
        throw new Error(errorData.message || `Failed to close order (${response.status})`);
      }

      const result = await response.json();
      console.log('Order closed successfully:', result);

      // Update order status locally
      setOrder(prev => ({
        ...prev,
        status: 'CANCELED',
        paymentStatus: 'CANCELED'
      }));
      
      setShowCloseDialog(false);
      
    } catch (error) {
      console.error('Error closing order:', error);
      setError(error.message);
    } finally {
      setIsClosing(false);
    }
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

  const displayStatus = getDisplayStatus();
  const paymentStatusDisplay = getPaymentStatusDisplay();
  const showCloseButton = canCloseOrder();
  const showPaymentPending = isPaymentPending(order);

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
      {showPaymentPending && (
        <div className={styles.paymentAlert}>
          <h3>Payment Action Required</h3>
          <p>This order requires your action to complete the payment process.</p>
          <div className={styles.alertActions}>
            <button
              onClick={handleCompletePayment}
              className={`${styles.button} ${styles.warningButton} ${styles.buttonLarge}`}
            >
              Complete Payment Now
            </button>
            {showCloseButton && (
              <button 
                onClick={() => setShowCloseDialog(true)}
                className={`${styles.button} ${styles.dangerButton} ${styles.buttonLarge}`}
                disabled={isClosing}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={`${styles.card} ${styles.orderOverview}`}>
        <div>
          <h3 className={styles.cardTitle}>Order Information</h3>
          <p><strong>Order ID:</strong> {order.paypalOrderId || 'N/A'}</p>
          <p><strong>Date Placed:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p>
            {/* <strong>Status:</strong> 
            <span className={`${styles.badge} ${getStatusBadgeClass(displayStatus)}`}>
              {displayStatus}
            </span> */}
            
            {/* Complete Payment Button next to status if payment is pending */}
            {/* {showPaymentPending && (
              <button
                onClick={handleCompletePayment}
                className={`${styles.button} ${styles.warningButton} ${styles.buttonSmall}`}
                style={{ marginLeft: '0px' }}
              >
                Complete Payment
              </button>
            )} */}
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
            <span className={`${styles.badge} ${getStatusBadgeClass(paymentStatusDisplay)}`}>
              {paymentStatusDisplay}
            </span>
          </p>
          {order.isPaid && order.paidAt && paymentStatusDisplay !== 'Canceled' && (
            <p><strong>Paid On:</strong> {new Date(order.paidAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Close Order Button - only show for orders that can be closed */}
      {showCloseButton && !showPaymentPending && (
        <div className={styles.closeOrderSection}>
          <button 
            onClick={() => setShowCloseDialog(true)}
            className={`${styles.button} ${styles.warningButton}`}
            disabled={isClosing}
          >
            Close Order
          </button>
          <p className={styles.closeOrderNote}>
            You can close this order if you no longer wish to proceed with the payment.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showCloseDialog && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Close Order</h3>
            <p>Are you sure you want to close this order? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => setShowCloseDialog(false)}
                className={`${styles.button} ${styles.secondaryButton}`}
                disabled={isClosing}
              >
                Cancel
              </button>
              <button 
                onClick={handleCloseOrder}
                className={`${styles.button} ${styles.dangerButton}`}
                disabled={isClosing}
              >
                {isClosing ? 'Closing...' : 'Yes, Close Order'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        {/* Show Complete Payment button if payment is pending, otherwise show Continue Shopping */}
        {showPaymentPending ? (
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