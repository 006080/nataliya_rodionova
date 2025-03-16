import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PayPalPayment from '../../components/PayPalPayment';
import styles from './OrderStatus.module.css';
import { setPendingOrderId, clearPendingOrderId } from '../utils/cookieUtils';

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [debug, setDebug] = useState({}); // Debug info
console.log(debug);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_NODE_ENV === 'production'
          ? import.meta.env.VITE_API_BASE_URL_PROD
          : import.meta.env.VITE_API_BASE_URL_LOCAL;
          
        console.log(`Fetching order details for ID: ${orderId} from ${apiUrl}/api/payments/${orderId}`);
        const response = await fetch(`${apiUrl}/api/payments/${orderId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Server response error: ${response.status} ${errorText}`);
          throw new Error(`Error fetching order: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Order details:", data);
        
        // Save debug info
        setDebug({
          orderData: data,
          timestamp: new Date().toISOString()
        });
        
        setOrder(data);
        
        // If the order requires payment action, set the order ID in the cookie
        if (data.status === 'PAYER_ACTION_REQUIRED') {
          setPendingOrderId(orderId);
        } else if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
          // If the order is completed or approved, clear the cookie
          clearPendingOrderId();
        }
        
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handlePaymentSuccess = (data) => {
    console.log("Payment success:", data);
    // Clear the cookie since payment is complete
    clearPendingOrderId();
    window.location.reload(); // Reload to show updated status
  };

  const handlePaymentCancel = () => {
    setPaymentCancelled(true);
    // Don't clear the cookie, we want to preserve the order ID
    setTimeout(() => {
      setPaymentCancelled(false);
    }, 5000);
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Order</h2>
          <p>{error}</p>
          <Link to="/shop" className={styles.button}>Return to Shop</Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Order Not Found</h2>
          <p>The order you're looking for couldn't be found.</p>
          <Link to="/shop" className={styles.button}>Return to Shop</Link>
        </div>
      </div>
    );
  }
  
  // Order is completed
  if (order.status === 'COMPLETED' || order.status === 'APPROVED') {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.checkmark}>✓</div>
          <h2>Order Completed!</h2>
          <p>Your order has been successfully processed.</p>
          <div className={styles.orderDetails}>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <h4>Items:</h4>
            <ul className={styles.itemsList}>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity} - €{(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className={styles.total}>
              <strong>Total: €{order.totalAmount.toFixed(2)}</strong>
            </p>
          </div>
          <Link to="/shop" className={styles.button}>Continue Shopping</Link>
        </div>
      </div>
    );
  }
  
  // Order is cancelled or voided
  if (order.status === 'CANCELED' || order.status === 'VOIDED') {
    return (
      <div className={styles.container}>
        <div className={styles.cancelledContainer}>
          <div className={styles.cancelIcon}>✕</div>
          <h2>Order Cancelled</h2>
          <p>This order has been cancelled and will not be processed.</p>
          {order.cancelReason && (
            <p className={styles.cancelReason}>
              <strong>Reason:</strong> {order.cancelReason}
            </p>
          )}
          <div className={styles.orderDetails}>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <h4>Items:</h4>
            <ul className={styles.itemsList}>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity} - €{(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className={styles.total}>
              <strong>Total: €{order.totalAmount.toFixed(2)}</strong>
            </p>
          </div>
          <div className={styles.actionButtons}>
            <Link to="/shop" className={styles.button}>Return to Shop</Link>
            <Link to="/checkout" className={styles.secondaryButton}>Start New Order</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Order requires payment action
  if (order.status === 'PAYER_ACTION_REQUIRED') {
    // Format cart items for PayPal
    const formattedCartItems = order.items.map(item => ({
      id: item.productId || item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`
    }));
    
    // Create complete measurements object
    const measurements = {
      height: order.measurements?.height || 0,
      chest: order.measurements?.chest || 0,
      waist: order.measurements?.waist || 0,
      hips: order.measurements?.hips || 0
    };
    
    // Create complete deliveryDetails object with all required fields
    const deliveryDetails = {
      fullName: order.deliveryDetails?.fullName || '',
      address: order.deliveryDetails?.address || '',
      postalCode: order.deliveryDetails?.postalCode || '',
      city: order.deliveryDetails?.city || '',
      country: order.deliveryDetails?.country || '',
      email: order.deliveryDetails?.email || order.customer?.email || '',
      phone: order.deliveryDetails?.phone || order.customer?.phone || ''
    };
    
    // Log the data we're passing to PayPalPayment
    console.log("Data for PayPalPayment:", {
      cart: formattedCartItems,
      measurements,
      deliveryDetails,
      existingOrderId: orderId
    });
    
    return (
      <div className={styles.container}>
        <div className={styles.paymentContainer}>
          <h2>Complete Your Payment</h2>
          <p>Your order requires payment to be completed. Please use the PayPal button below.</p>
          
          <div className={styles.orderSummary}>
            <h3>Order Summary</h3>
            <div className={styles.itemList}>
              {order.items.map((item, index) => (
                <div key={index} className={styles.item}>
                  <span className={styles.itemName}>{item.name} x {item.quantity}</span>
                  <span className={styles.itemPrice}>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total:</span>
              <span className={styles.totalAmount}>€{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Cancelled Message */}
          {paymentCancelled && (
            <div className={styles.cancelMessage}>
              <span
                className={styles.closeIcon}
                onClick={() => setPaymentCancelled(false)}
              >
                ✕
              </span>
              <h3>Payment Cancelled</h3>
              <p>
                Your payment was cancelled. You can try again whenever you're
                ready.
              </p>
              <button onClick={() => setPaymentCancelled(false)}>
                Try Again
              </button>
            </div>
          )}
          
          <div className={styles.paymentSection}>
            <h3>Payment Options</h3>
            <PayPalPayment
              cart={formattedCartItems}
              measurements={measurements}
              deliveryDetails={deliveryDetails}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              existingOrderId={orderId} // Pass the existing order ID to use instead of creating a new one
            />
          </div>
          
          {/* Debug info */}
          <div className={styles.debugInfo}>
            <details>
              <summary>Debug Information</summary>
              <div style={{fontSize: '12px', background: '#f7f7f7', padding: '8px', borderRadius: '4px', textAlign: 'left', maxHeight: '200px', overflow: 'auto'}}>
                <h4>Formatted Data:</h4>
                <pre>
                  {JSON.stringify({cart: formattedCartItems.length, measurements, deliveryDetails}, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }
  
  // Default: any other status
  return (
    <div className={styles.container}>
      <div className={styles.statusContainer}>
        <h2>Order Status: {order.status}</h2>
        <p>Your order is currently being processed.</p>
        <div className={styles.orderDetails}>
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <h4>Items:</h4>
          <ul className={styles.itemsList}>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} x {item.quantity} - €{(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className={styles.total}>
            <strong>Total: €{order.totalAmount.toFixed(2)}</strong>
          </p>
        </div>
        <Link to="/shop" className={styles.button}>Return to Shop</Link>
      </div>
    </div>
  );
};

export default OrderStatus;




