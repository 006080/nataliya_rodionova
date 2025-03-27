import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PayPalPayment from '../../components/PayPalPayment';
import styles from './OrderStatus.module.css';

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentCancelled, setPaymentCancelled] = useState(false);


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
        if (response.status === 404) {
          setOrder(null);
        } else {
          const errorText = await response.text();
          console.error(`Server response error: ${response.status} ${errorText}`);
          throw new Error(`Error fetching order: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log("Order details:", data);
        setOrder(data);
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
  window.location.reload(); 
};


const handlePaymentCancel = () => {
  setPaymentCancelled(true);
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
      <div className={styles.orderStatus_container}>
        <div className={styles.orderStatus_errorCard}>
          <div className={styles.orderStatus_iconContainer}>
            <div className={styles.orderStatus_systemErrorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <h2 className={styles.orderStatus_titleHeading}>Error Loading Order</h2>
          
          <div className={styles.orderStatus_messageContent}>
            <p className={styles.orderStatus_errorDetail}>{error}</p>
            <p>We encountered a problem while retrieving your order information.</p>
            <p className={styles.orderStatus_reassuranceNote}>
              Please try again later if the issue persists.
            </p>
          </div>
          
          <div className={styles.orderStatus_buttonGroup}>
            <Link to="/shop" className={styles.orderStatus_primaryBtn}>
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }


if (!order) {
  return (
    <div className={styles.orderStatus_container}>
      <div className={styles.orderStatus_errorCard}>
        <div className={styles.orderStatus_iconContainer}>
          <div className={styles.orderStatus_notFoundIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <h2 className={styles.orderStatus_titleHeading}>Payment Not Completed</h2>
        
        <div className={styles.orderStatus_messageContent}>
          <p>It looks like your payment process was interrupted before completion.</p>
          <p>This usually happens when:</p>
          <ul className={styles.orderStatus_bulletList}>
            <li>You closed the PayPal window before finishing checkout</li>
            <li>The payment process was canceled from PayPal's side</li>
            <li>There was a temporary connection issue during payment</li>
          </ul>
          <p className={styles.orderStatus_reassuranceNote}>
            Don't worry! You can return to our shop and try again whenever you're ready.
          </p>
        </div>
        
        <div className={styles.orderStatus_buttonGroup}>
          <Link to="/shop" className={styles.orderStatus_primaryBtn}>
            Browse Products
          </Link>
        </div>
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
  

  if (order.status === 'PAYER_ACTION_REQUIRED') {
    const formattedCartItems = order.items.map(item => ({
      id: item.productId || item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`
    }));
    
    const measurements = {
      height: order.measurements?.height || 0,
      chest: order.measurements?.chest || 0,
      waist: order.measurements?.waist || 0,
      hips: order.measurements?.hips || 0
    };
    
    const deliveryDetails = {
      fullName: order.deliveryDetails?.fullName || '',
      address: order.deliveryDetails?.address || '',
      postalCode: order.deliveryDetails?.postalCode || '',
      city: order.deliveryDetails?.city || '',
      country: order.deliveryDetails?.country || '',
      email: order.deliveryDetails?.email || order.customer?.email || '',
      phone: order.deliveryDetails?.phone || order.customer?.phone || ''
    };
    
    
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
              existingOrderId={orderId} 
            />
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




