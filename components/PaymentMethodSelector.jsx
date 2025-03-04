import styles from './PaymentMethodSelector.module.css';

const PaymentMethodSelector = ({ onSelectMethod, selectedMethod }) => {
  return (
    <div className={styles.paymentMethods}>
      <h3>Select Payment Method</h3>
      
      <div className={styles.methodOptions}>
        <div 
          className={`${styles.method} ${selectedMethod === 'paypal' ? styles.selected : ''}`}
          onClick={() => onSelectMethod('paypal')}
        >
          <img src="/images/paypal-logo.png" alt="PayPal" />
          <span>PayPal</span>
        </div>
        
        <div 
          className={`${styles.method} ${selectedMethod === 'stripe' ? styles.selected : ''}`}
          onClick={() => onSelectMethod('stripe')}
        >
          <img src="/images/stripe-logo.png" alt="Credit Card" />
          <span>Credit Card</span>
        </div>
        
        <div 
          className={`${styles.method} ${selectedMethod === 'mollie' ? styles.selected : ''}`}
          onClick={() => onSelectMethod('mollie')}
        >
          <img src="/images/mollie-logo.png" alt="Mollie" />
          <span>Mollie</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;