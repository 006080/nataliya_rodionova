import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './PaymentCancel.module.css';

const getApiUrl = () => {
  const baseUrl =
    import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return baseUrl;
};

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  
  // Get payment information from URL parameters
  const paymentId = searchParams.get('paymentId');
  const orderReference = searchParams.get('reference');
  const paymentMethod = searchParams.get('method');
  const reason = searchParams.get('reason') || 'cancelled';

  useEffect(() => {
    // If we have enough information, notify the backend about the cancelled payment
    if (orderReference && paymentMethod) {
      const notifyCancellation = async () => {
        try {
          await fetch(`${getApiUrl()}/api/payments/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderReference,
              paymentMethod,
              paymentId,
              reason
            })
          });
        } catch (error) {
          console.error('Failed to notify backend of cancellation:', error);
        }
      };
      
      notifyCancellation();
    }
  }, [orderReference, paymentMethod, paymentId, reason]);

  return (
    <div className={styles.cancelContainer}>
      <h1>Payment Cancelled</h1>
      <div className={styles.cancelIcon}>✕</div>
      
      <p>Your payment was cancelled and no charges were made to your account.</p>
      
      {reason === 'expired' && (
        <p>The payment session has expired. Please try again with a new checkout session.</p>
      )}
      
      {reason === 'failed' && (
        <p>The payment could not be processed. Please try a different payment method or contact your bank.</p>
      )}
      
      {orderReference && (
        <p>Order reference: <strong>{orderReference}</strong></p>
      )}
      
      <div className={styles.messageBox}>
        <p>Your cart items have been saved. You can return to checkout to complete your purchase.</p>
      </div>
      
      <div className={styles.buttonContainer}>
        <Link to="/checkout" className={styles.primaryButton}>
          Return to Checkout
        </Link>
        <Link to="/shop" className={styles.secondaryButton}>
          Continue Shopping
        </Link>
      </div>
      
      <div className={styles.supportInfo}>
        <p>Having trouble with your payment?</p>
        <Link to="/contacts" className={styles.supportLink}>
          Contact our support team
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;