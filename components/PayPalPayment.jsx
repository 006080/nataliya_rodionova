import { useState, useEffect } from 'react'
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import styles from './PayPalPayment.module.css'
import { getPendingOrderId, clearPendingOrderId } from '../src/utils/cookieUtils'

// Loading spinner component
const LoadingSpinner = () => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner}></div>
    <p>Loading payment options...</p>
  </div>
)

// PayPal buttons wrapper component to handle loading state
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
      : import.meta.env.VITE_API_BASE_URL_LOCAL
  return baseUrl
}

function PayPalPayment({ 
  cart = [], 
  measurements, 
  deliveryDetails, 
  onSuccess, 
  onCancel, 
  onOrderCreated, 
  existingOrderId = null 
}) {
  const [paymentStatus, setPaymentStatus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  const [orderId, setOrderId] = useState(existingOrderId) // Track the order ID

  // Check for pending order in cookie on component mount
  useEffect(() => {
    const checkForPendingOrder = async () => {
      // If existingOrderId is already provided, use it
      if (existingOrderId) {
        setOrderId(existingOrderId);
        return;
      }

      // Check cookie for pendingOrderId
      const pendingOrderId = getPendingOrderId();
      
      if (pendingOrderId) {
        try {
          // Verify if order exists and is valid for continuation
          const response = await fetch(`${getApiUrl()}/api/payments/${pendingOrderId}/continue`);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Found valid pending order:", data);
            setOrderId(data.id);
            
            if (onOrderCreated && typeof onOrderCreated === 'function') {
              onOrderCreated(data.id);
            }
          } else {
            // If order is not valid, clear the cookie
            clearPendingOrderId();
            console.log("Pending order is not valid for continuation, will create new order");
          }
        } catch (error) {
          console.error("Error checking pending order:", error);
          // If there's an error, we'll create a new order
        }
      }
    };

    // Set isClientLoaded to true after component mounts
    const timer = setTimeout(() => {
      setIsClientLoaded(true);
    }, 1000); // Add a small delay to ensure visibility of the spinner

    // Check for pending order
    checkForPendingOrder();

    console.log("PayPalPayment initialized with:", { 
      existingOrderId, 
      cart: cart.length,
      hasDeliveryDetails: !!deliveryDetails,
      hasMeasurements: !!measurements,
      pendingOrderId: getPendingOrderId()
    });

    return () => clearTimeout(timer);
  }, [existingOrderId, cart, deliveryDetails, measurements, onOrderCreated]);

  const formatCartItems = (cartItems) => {
    return cartItems.map(item => ({
      id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      description: item.description || `${item.name} product`
    }));
  };

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0).toFixed(2);

  const createOrder = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // If we already have an order ID (either from props, state or cookie), use it
      if (orderId) {
        console.log(`Using existing order ID: ${orderId}`);
        setPaymentStatus(`Using existing order: ${orderId}`);
        return orderId;
      }

      setPaymentStatus('Creating order...')

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
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await res.json()

      if (!data.id) {
        throw new Error('No order ID returned from backend')
      }

      // Store the new order ID
      setOrderId(data.id)
      
      // Notify parent component about the created order ID
      if (onOrderCreated && typeof onOrderCreated === 'function') {
        onOrderCreated(data.id);
      }

      console.log(`New order created: ${data.id}`);
      setPaymentStatus("Order created successfully");
      return data.id;

    } catch (error) {
      console.error('Error creating order:', error)
      setError(error.message || 'Payment failed')
      setPaymentStatus('Error creating order')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const onApprove = async (data, actions) => {
    setIsProcessing(true)
    setPaymentStatus('Processing payment...')

    try {
      const response = await fetch(
        `${getApiUrl()}/api/payments/${data.orderID}/capture`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to capture payment')
      }

      const orderData = await response.json()

      const paymentStatus = orderData.status

      if (paymentStatus === 'COMPLETED') {
        setPaymentStatus('Payment successful!')
        
        // Clear the pending order cookie since payment is complete
        clearPendingOrderId();
        
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(orderData);
        }
      } else {
        setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
      }

      return orderData

    } catch (error) {
      console.error('Error capturing payment:', error)
      setError(error.message || 'Payment failed')
      setPaymentStatus('Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = (data) => {
    setPaymentStatus("Payment cancelled");
    
    // NOTE: We do NOT clear the cookie here to allow retrying with the same order
    
    if (onCancel && typeof onCancel === 'function') {
      onCancel(data);
    }
  };

  const onError = (error) => {
    console.error('PayPal error:', error)
    setError('An error occurred with PayPal')
    setPaymentStatus('Payment error')
    
    // NOTE: We do NOT clear the cookie on error to allow retrying with the same order
  }

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
        <pre style={{fontSize: '12px', background: '#f7f7f7', padding: '10px', borderRadius: '4px'}}>
          {JSON.stringify({cart: cart.length > 0, measurements: !!measurements, deliveryDetails: !!deliveryDetails}, null, 2)}
        </pre>
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
        {/* {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}
        {orderId && (
          <div className={styles.statusMessage}>
            {existingOrderId ? 'Continuing payment for existing order' : 'Using previously started order'}
          </div>
        )} */}

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
  )
}

export default PayPalPayment



