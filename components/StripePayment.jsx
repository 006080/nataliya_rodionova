import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMeasurements } from './MeasureForm';
import styles from './StripePayment.module.css';

const getApiUrl = () => {
  const baseUrl =
    import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return baseUrl;
};

// Load stripe outside component to avoid recreating it on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// The checkout form that will contain the card element
const CheckoutForm = ({ cart, onSuccess, onCancel }) => {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderReference, setOrderReference] = useState('');
  
  const { measurements } = useMeasurements();
  const stripe = useStripe();
  const elements = useElements();
  
  const formatCartItems = (cartItems) => {
    return cartItems.map(item => ({
      id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`
    }));
  };

  // Create payment intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
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
            paymentMethod: 'stripe'
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create payment");
        }
        
        const data = await res.json();
        setClientSecret(data.clientSecret);
        setOrderReference(data.orderReference);
        setPaymentStatus('Ready to pay');
      } catch (error) {
        console.error('Error creating payment:', error);
        setError(error.message || 'Payment initialization failed');
        setPaymentStatus('Error creating payment');
      } finally {
        setIsProcessing(false);
      }
    };
    
    if (cart.length > 0) {
      createPaymentIntent();
    }
  }, [cart]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }
    
    setIsProcessing(true);
    setPaymentStatus('Processing payment...');
    
    try {
      // Complete payment when the submit button is clicked
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can collect billing details here if needed
          },
        }
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment successful, capture it on the backend
        const captureResponse = await fetch(
          `${getApiUrl()}/api/payments/${result.paymentIntent.id}/capture`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderReference,
              paymentMethod: 'stripe'
            }),
          }
        );
        
        if (!captureResponse.ok) {
          const errorData = await captureResponse.json();
          throw new Error(errorData.message || 'Failed to capture payment');
        }
        
        const captureData = await captureResponse.json();
        setPaymentStatus('Payment successful!');
        
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(captureData);
        }
      } else {
        setPaymentStatus(`Payment ${result.paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('Payment failed');
      
      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.stripeForm}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}
      
      <div className={styles.cardElementContainer}>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isProcessing || !stripe || !clientSecret}
        className={styles.payButton}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

// Main component that wraps everything in Stripe Elements
function StripePayment({ cart = [], onSuccess, onCancel }) {
  if (!cart.length) {
    return <div>No items in cart</div>;
  }
  
  return (
    <div className={styles.stripeContainer}>
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          cart={cart}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}

export default StripePayment;