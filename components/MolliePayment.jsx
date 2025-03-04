import { useState } from 'react';
import { useMeasurements } from './MeasureForm';
import styles from './MolliePayment.module.css';

const getApiUrl = () => {
  const baseUrl =
    import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return baseUrl;
};

function MolliePayment({ cart = [], onSuccess, onCancel }) {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const { measurements } = useMeasurements();

  const formatCartItems = (cartItems) => {
    return cartItems.map(item => ({
      id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`
    }));
  };

  const createPayment = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentStatus('Creating payment...');

    try {
      const formattedCart = formatCartItems(cart);
      
      const res = await fetch(`${getApiUrl()}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: formattedCart,
          measurements,
          paymentMethod: 'mollie'
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create payment");
      }

      const data = await res.json();
      
      if (!data.checkoutUrl) {
        throw new Error('No checkout URL returned from backend');
      }

      setCheckoutUrl(data.checkoutUrl);
      setPaymentStatus("Payment created successfully");
    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('Error creating payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart.length) {
    return <div>No items in cart</div>;
  }

  return (
    <div className={styles.mollieContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}

      {!checkoutUrl ? (
        <button 
          onClick={createPayment} 
          disabled={isProcessing}
          className={styles.payButton}
        >
          {isProcessing ? 'Processing...' : 'Pay with Mollie'}
        </button>
      ) : (
        <div className={styles.redirectContainer}>
          <p>You will be redirected to Mollie&apos;s secure payment page.</p>
          <a 
            href={checkoutUrl} 
            className={styles.redirectButton}
            target="_blank" 
            rel="noopener noreferrer"
          >
            Continue to Payment
          </a>
        </div>
      )}
    </div>
  );
}

export default MolliePayment;