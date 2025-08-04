import { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import styles from './PayPalPayment.module.css';
import { hasThirdPartyConsent } from '../src/utils/consentUtils';

const LoadingSpinner = () => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner}></div>
    <p>Loading payment options...</p>
  </div>
);

const PayPalButtonsWrapper = ({ createOrder, onApprove, onCancel, onError, disabled }) => {
  const [{ isPending }] = usePayPalScriptReducer();
  
  return (
    <>
      {isPending ? (
        <LoadingSpinner />
      ) : (
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
          disabled={disabled}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
          }}
        />
      )}
    </>
  );
};

const getApiUrl = () => {
  const baseUrl =
    import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return baseUrl;
};

function PayPalPayment({ 
  cart = [], 
  measurements, 
  deliveryDetails,
  onSuccess, 
  onCancel, 
  onOrderCreated, 
  existingOrderId = null,
  clearOrderId
}) {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [orderId, setOrderId] = useState(existingOrderId);
  const [consentRequired, setConsentRequired] = useState(!hasThirdPartyConsent());

  // Listen for consent changes - ALWAYS at the top level
  useEffect(() => {
    const handleConsentChange = (event) => {
      if (event.detail && event.detail.consent === 'all') {
        // Update consent status immediately when accepted
        setConsentRequired(false);
        
        // Force a refresh of the client loading state
        setIsClientLoaded(false);
        
        // Manually trigger script loading
        import('../src/utils/consentUtils').then(module => {
          module.loadPayPal();
          
          // Set a timeout to ensure the PayPal script has time to load
          setTimeout(() => {
            setIsClientLoaded(true);
          }, 1500);
        });
      } else if (event.detail && event.detail.consent === 'essential') {
        // Update to show consent required message immediately
        setConsentRequired(true);
        setIsClientLoaded(false);
      }
    };
    
    window.addEventListener('consentChanged', handleConsentChange);
    
    // Initial check on mount
    if (hasThirdPartyConsent()) {
      setConsentRequired(false);
    } else {
      setConsentRequired(true);
    }
    
    return () => {
      window.removeEventListener('consentChanged', handleConsentChange);
    };
  }, []);

  // Listen for PayPal script loading events - ALWAYS at the top level
  useEffect(() => {
    // Only add event listeners if consent is given
    if (!consentRequired) {
      const handlePayPalLoaded = () => {
        console.log("PayPal script load event detected");
        setIsClientLoaded(true);
      };
      
      window.addEventListener('paypalLoaded', handlePayPalLoaded);
      
      // Add some extra time to make sure script is properly initialized
      const timer = setTimeout(() => {
        setIsClientLoaded(true);
      }, 2000);
      
      return () => {
        window.removeEventListener('paypalLoaded', handlePayPalLoaded);
        clearTimeout(timer);
      };
    }
  }, [consentRequired]); // Depend on consentRequired to re-run when consent changes

  // Check for pending order on component mount - ALWAYS at the top level
  useEffect(() => {
    const checkForPendingOrder = async () => {
      // If existingOrderId is already provided, use it
      if (existingOrderId) {
        setOrderId(existingOrderId);
        return;
      }
    };

    checkForPendingOrder();
  }, [existingOrderId]);

  const formatCartItems = (cartItems) => {
    return cartItems.map(item => ({
      id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`,
      image: item.image,
      color: item.color || ''
    }));
  };

  const createOrder = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // If we already have an order ID (either from props or state), use it
      if (orderId) {
        setPaymentStatus(`Using existing order: ${orderId}`);
        return orderId;
      }

      setPaymentStatus('Creating order...');

      if (!measurements || !deliveryDetails) {
        throw new Error("Measurements and delivery details are required");
      }

      const formattedCart = formatCartItems(cart);

      const res = await fetch(`${getApiUrl()}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: formattedCart,
          measurements: measurements,
          deliveryDetails: deliveryDetails
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await res.json();

      if (!data.id) {
        throw new Error('No order ID returned from backend');
      }

      // Store the new order ID
      setOrderId(data.id);
      
      // Notify parent component about the created order ID
      if (onOrderCreated && typeof onOrderCreated === 'function') {
        onOrderCreated(data.id);
      }

      setPaymentStatus("Order created successfully");
      return data.id;

    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('Error creating order');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const onApprove = async (data, actions) => {
    setIsProcessing(true);
    setPaymentStatus('Processing payment...');

    try {
      const response = await fetch(
        `${getApiUrl()}/api/payments/${data.orderID}/capture`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to capture payment');
      }

      const orderData = await response.json();
      const paymentStatus = orderData.status;

      if (paymentStatus === 'COMPLETED') {
        setPaymentStatus('Payment successful!');
        
        // Clear the pending order ID using the provided callback
        if (clearOrderId && typeof clearOrderId === 'function') {
          clearOrderId();
        }
        
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(orderData);
        }
      } else {
        setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
      }

      return orderData;

    } catch (error) {
      console.error('Error capturing payment:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (data) => {
    setPaymentStatus("Payment cancelled");
    
    try {
      if (onCancel && typeof onCancel === 'function') {
        onCancel(data, false);
      }
    } catch (error) {
      console.error("Error in handleCancel:", error);
    }
  };

  const onError = (error) => {
    console.error('PayPal error:', error);
    setError('An error occurred with PayPal');
    setPaymentStatus('Payment error');
  };

  const isDataValid = cart.length > 0 && 
                     measurements && 
                     deliveryDetails && 
                     deliveryDetails.fullName &&
                     deliveryDetails.address &&
                     deliveryDetails.postalCode &&
                     deliveryDetails.city &&
                     deliveryDetails.country &&
                     deliveryDetails.email &&
                     deliveryDetails.phone;

  if (!isDataValid) {
    let missingItems = [];
    if (cart.length === 0) missingItems.push("cart items");
    if (!measurements) missingItems.push("measurements");
    if (!deliveryDetails) missingItems.push("delivery details");
    else {
      if (!deliveryDetails.fullName) missingItems.push("full name");
      if (!deliveryDetails.address) missingItems.push("address");
      if (!deliveryDetails.postalCode) missingItems.push("postal code");
      if (!deliveryDetails.city) missingItems.push("city");
      if (!deliveryDetails.country) missingItems.push("country");
      if (!deliveryDetails.email) missingItems.push("email");
      if (!deliveryDetails.phone) missingItems.push("phone");
    }
    
    return (
      <div className={styles.payPalContainer}>
        <div className={styles.errorMessage}>
          Cannot proceed with payment. Missing: {missingItems.join(", ")}
        </div>
      </div>
    );
  }

  // Render the consent message if needed
  if (consentRequired) {
    return (
      <div className={styles.payPalContainer}>
        <div className={styles.consentMessage}>
          <h3>Cookie Consent Required for Payment</h3>
          <p>
            To process payments with PayPal, you need to accept cookies. 
            PayPal requires cookies to function properly and ensure secure transactions.
          </p>
          <p>
            Please accept cookies by clicking &quot;Accept All&quot; in the 
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
              className={styles.cookieSettingsLink}
            >
              cookie settings
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Show spinner if client is not loaded yet
  if (!isClientLoaded) {
    return (
      <div className={styles.payPalContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
        currency: 'EUR',
      }}
    >
      <div className={styles.payPalContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.paypalButtonContainer}>
          <PayPalButtonsWrapper
            createOrder={createOrder}
            onApprove={onApprove}
            onCancel={handleCancel}
            onError={onError}
            disabled={isProcessing}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export default PayPalPayment;










