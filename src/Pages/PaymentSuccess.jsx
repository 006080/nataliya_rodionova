import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './PaymentSuccess.module.css';

const getApiUrl = () => {
  const baseUrl =
    import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return baseUrl;
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get payment information from URL parameters
  const paymentId = searchParams.get('paymentId');
  const orderReference = searchParams.get('reference');
  const paymentMethod = searchParams.get('method');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!paymentId || !orderReference || !paymentMethod) {
        setError('Missing payment information');
        setIsLoading(false);
        return;
      }

      try {
        // Retrieve order details from the backend
        const response = await fetch(
          `${getApiUrl()}/api/orders/${orderReference}?paymentId=${paymentId}&method=${paymentMethod}`, 
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to retrieve order details');
        }

        const data = await response.json();
        setOrderDetails(data);
        
        // If using Mollie or another payment method that needs payment verification
        if (paymentMethod === 'mollie' && !data.isPaid) {
          await verifyPayment(paymentId, orderReference, paymentMethod);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paymentId, orderReference, paymentMethod]);

  const verifyPayment = async (paymentId, orderReference, paymentMethod) => {
    try {
      // Final verification/capture of payment
      const response = await fetch(
        `${getApiUrl()}/api/payments/${paymentId}/capture`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderReference,
            paymentMethod
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      setOrderDetails(prev => ({
        ...prev,
        ...data,
        isPaid: true,
        status: 'COMPLETED'
      }));
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError('Payment verification failed. Please contact support.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.successContainer}>
        <h1>Processing Your Order</h1>
        <div className={styles.loadingSpinner}></div>
        <p>Please wait while we confirm your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.successContainer}>
        <h1>Something Went Wrong</h1>
        <p className={styles.errorMessage}>{error}</p>
        <p>Your payment may have been processed, but we couldn&apos;t retrieve your order details.</p>
        <p>Please contact our customer support and provide your order reference: {orderReference}</p>
        <div className={styles.buttonContainer}>
          <Link to="/shop" className={styles.button}>Return to Shop</Link>
          <Link to="/contacts" className={styles.button}>Contact Support</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.successContainer}>
      <h1>Order Confirmed!</h1>
      <div className={styles.successIcon}>✓</div>
      <p>Thank you for your purchase. Your payment was successful!</p>
      
      {orderDetails && (
        <div className={styles.orderDetails}>
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {orderDetails.orderId || orderReference}</p>
          <p><strong>Status:</strong> {orderDetails.status}</p>
          
          {orderDetails.items && orderDetails.items.length > 0 && (
            <>
              <h3>Items Purchased:</h3>
              <ul className={styles.itemsList}>
                {orderDetails.items.map((item, index) => (
                  <li key={item.productId || `item-${index}`}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.totalPrice}>
                <strong>Total:</strong> €{orderDetails.totalAmount.toFixed(2)}
              </p>
            </>
          )}
        </div>
      )}
      
      <p>We&apos;ll send a confirmation email shortly with all your order details.</p>
      
      <div className={styles.buttonContainer}>
        <Link to="/shop" className={styles.button}>Continue Shopping</Link>
        <Link to="/account/orders" className={styles.button}>View My Orders</Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;