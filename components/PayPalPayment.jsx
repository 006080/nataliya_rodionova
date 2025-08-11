import { useState, useEffect, useRef } from 'react';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import styles from './PayPalPayment.module.css';
import { hasThirdPartyConsent } from '../src/utils/consentUtils';

const LoadingSpinner = ({ message = "Loading payment options..." }) => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner}></div>
    <p>{message}</p>
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
  const [orderId, setOrderId] = useState(existingOrderId);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Much simpler state management
  const [showPayPal, setShowPayPal] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initRef = useRef(false);

  // Setup initial state and handle consent changes
  useEffect(() => {
    const setupPayPal = () => {
      const currentConsent = hasThirdPartyConsent();
      
      if (currentConsent) {
        console.log('PayPal: Has consent, setting up...');
        setHasConsent(true);
        setIsLoading(true);
        setShowPayPal(false);
        
        // Load PayPal script
        import('../src/utils/consentUtils').then(module => {
          module.loadPayPal();
        }).catch(error => {
          console.error('PayPal: Script import failed:', error);
          // Still try to show buttons
          setTimeout(() => {
            setShowPayPal(true);
            setIsLoading(false);
          }, 1000);
        });
        
        // Primary timeout to show buttons
        setTimeout(() => {
          console.log('PayPal: Showing buttons');
          setShowPayPal(true);
          setIsLoading(false);
        }, 1500);
        
      } else {
        console.log('PayPal: No consent');
        setHasConsent(false);
        setShowPayPal(false);
        setIsLoading(false);
      }
    };

    // Only run initial check once
    if (!initRef.current) {
      initRef.current = true;
      setupPayPal();
    }

    const handleConsentChange = (event) => {
      console.log('PayPal: Consent changed!', event.detail);
      
      if (event.detail && event.detail.consent === 'all') {
        console.log('PayPal: Granting consent - setting up...');
        setHasConsent(true);
        setIsLoading(true);
        setShowPayPal(false);
        
        import('../src/utils/consentUtils').then(module => {
          module.loadPayPal();
        }).catch(error => {
          console.error('PayPal: Script import failed:', error);
          setTimeout(() => {
            setShowPayPal(true);
            setIsLoading(false);
          }, 1000);
        });
        
        setTimeout(() => {
          console.log('PayPal: Consent granted - showing buttons');
          setShowPayPal(true);
          setIsLoading(false);
        }, 1500);
        
      } else if (event.detail && (event.detail.consent === 'essential' || event.detail.consent === 'none')) {
        console.log('PayPal: Revoking consent - hiding buttons immediately');
        setHasConsent(false);
        setShowPayPal(false);
        setIsLoading(false);
      }
    };

    const handlePayPalLoaded = () => {
      console.log('PayPal: Script loaded event');
      // Check current consent state when script loads
      if (hasThirdPartyConsent()) {
        setTimeout(() => {
          console.log('PayPal: Script loaded - showing buttons');
          setShowPayPal(true);
          setIsLoading(false);
        }, 300);
      }
    };

    // Register event listeners
    window.addEventListener('consentChanged', handleConsentChange);
    window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
    return () => {
      window.removeEventListener('consentChanged', handleConsentChange);
      window.removeEventListener('paypalLoaded', handlePayPalLoaded);
    };
  }, []); // Empty dependency array

  // Handle existing order ID
  useEffect(() => {
    if (existingOrderId && existingOrderId !== orderId) {
      setOrderId(existingOrderId);
    }
  }, [existingOrderId, orderId]);

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

  const checkUserInteraction = async (orderId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(
        `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (!response.ok) {
        console.error(`Failed to check interaction: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      return data.exists || data.created || data.hasEmail || false;
    } catch (error) {
      console.error('Error checking user interaction:', error);
      return false;
    }
  };

  const createOrder = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      if (orderId) {
        setPaymentStatus(`Using existing order: ${orderId}`);
        await checkUserInteraction(orderId);
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

      setOrderId(data.id);
      
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

  const onApprove = async (data) => {
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
    setIsRedirecting(true);
    setPaymentStatus("Processing cancellation...");
    
    try {
      const checkResponse = await fetch(
        `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (checkData.hasEmail || checkData.exists) {
          try {
            await fetch(
              `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
              }
            );
          } catch (updateError) {
            console.error("Error updating order status:", updateError);
          }
        }
        
        if (onCancel && typeof onCancel === 'function') {
          onCancel(data, true);
        }
        
        setTimeout(() => {
          window.location.href = `/order-status/${data.orderID}`;
        }, 500);
        
      } else {
        console.error("Failed to check interaction:", await checkResponse.text());
        
        if (onCancel && typeof onCancel === 'function') {
          onCancel(data, true);
        }
        
        setTimeout(() => {
          window.location.href = `/order-status/${data.orderID}`;
        }, 500);
      }
    } catch (error) {
      console.error("Error in handleCancel:", error);
      
      if (onCancel && typeof onCancel === 'function') {
        onCancel(data, true);
      }
      
      if (data && data.orderID) {
        setTimeout(() => {
          window.location.href = `/order-status/${data.orderID}`;
        }, 500);
      } else {
        setIsRedirecting(false);
        if (onCancel && typeof onCancel === 'function') {
          onCancel(data, false);
        }
      }
    }
  };

  const onError = (error) => {
    console.error('PayPal error:', error);
    setError('An error occurred with PayPal');
    setPaymentStatus('Payment error');
  };

  // Data validation
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

  // Show redirecting spinner
  if (isRedirecting) {
    return (
      <div className={styles.payPalContainer}>
        <LoadingSpinner message="Redirecting to complete payment..." />
      </div>
    );
  }

  // Show consent message if no consent
  if (!hasConsent && !isLoading) {
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
              onClick={() => {
                console.log('PayPal: Opening cookie settings...');
                window.dispatchEvent(new CustomEvent('openCookieSettings'));
              }}
              className={styles.cookieSettingsLink}
            >
              cookie settings
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Show loading while setting up
  if (isLoading) {
    return (
      <div className={styles.payPalContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  // Show PayPal buttons when ready
  if (hasConsent && showPayPal) {
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

  // Fallback
  return (
    <div className={styles.payPalContainer}>
      <LoadingSpinner />
    </div>
  );
}

export default PayPalPayment;
















