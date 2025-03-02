// components/PaymentProcessor.jsx
import { useState } from 'react';
import PayPalPayment from './PayPalPayment';
// Future payment methods
// import StripePayment from './StripePayment';
// import MolliePayment from './MolliePayment';
import styles from './PaymentProcessor.module.css';

const PaymentProcessor = ({ cart = [], onSuccess, onCancel }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePaymentSuccess = (data) => {
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess({
        ...data,
        paymentMethod: selectedPaymentMethod
      });
    }
  };

  const handlePaymentCancel = (data) => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel({
        ...data,
        paymentMethod: selectedPaymentMethod
      });
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setError(null);
    setPaymentStatus('');
  };

  if (!cart.length) {
    return <div>No items in cart</div>;
  }

  return (
    <div className={styles.paymentProcessorContainer}>
      <div className={styles.paymentMethodSelector}>
        <h3>Select Payment Method</h3>
        <div className={styles.paymentOptions}>
          <button
            className={`${styles.paymentOption} ${selectedPaymentMethod === 'paypal' ? styles.selected : ''}`}
            onClick={() => handlePaymentMethodChange('paypal')}
          >
            <img src="/path-to-paypal-logo.png" alt="PayPal" />
            <span>PayPal</span>
          </button>
          
          {/* Uncomment when ready to implement */}
          {/* <button
            className={`${styles.paymentOption} ${selectedPaymentMethod === 'stripe' ? styles.selected : ''}`}
            onClick={() => handlePaymentMethodChange('stripe')}
            disabled
          >
            <img src="/path-to-stripe-logo.png" alt="Stripe" />
            <span>Credit Card</span>
          </button>
          
          <button
            className={`${styles.paymentOption} ${selectedPaymentMethod === 'mollie' ? styles.selected : ''}`}
            onClick={() => handlePaymentMethodChange('mollie')}
            disabled
          >
            <img src="/path-to-mollie-logo.png" alt="Mollie" />
            <span>Mollie</span>
          </button> */}
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}

      <div className={styles.paymentComponentContainer}>
        {selectedPaymentMethod === 'paypal' && (
          <PayPalPayment
            cart={cart}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            setError={setError}
            setPaymentStatus={setPaymentStatus}
            setIsProcessing={setIsProcessing}
          />
        )}
        
        {/* Uncomment when ready to implement */}
        {/* {selectedPaymentMethod === 'stripe' && (
          <StripePayment
            cart={cart}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            setError={setError}
            setPaymentStatus={setPaymentStatus}
            setIsProcessing={setIsProcessing}
          />
        )}
        
        {selectedPaymentMethod === 'mollie' && (
          <MolliePayment
            cart={cart}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            setError={setError}
            setPaymentStatus={setPaymentStatus}
            setIsProcessing={setIsProcessing}
          />
        )} */}
      </div>
    </div>
  );
};

export default PaymentProcessor;