import { useState, useEffect } from 'react'
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import styles from './PayPalPayment.module.css'


const LoadingSpinner = () => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner}></div>
    <p>Loading payment options...</p>
  </div>
)


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
  existingOrderId = null,
  clearOrderId // New prop to clear order ID
}) {
  const [paymentStatus, setPaymentStatus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  const [orderId, setOrderId] = useState(existingOrderId) 

  // Check for pending order on component mount
  useEffect(() => {
    const checkForPendingOrder = async () => {
      // If existingOrderId is already provided, use it
      if (existingOrderId) {
        setOrderId(existingOrderId);
        return;
      }
    };


    const timer = setTimeout(() => {
      setIsClientLoaded(true);
    }, 1000);


    checkForPendingOrder();


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


const checkUserInteraction = async (orderId) => {
  try {
    // Wait a short time to allow PayPal popup interaction
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

    
    // Return true if any sign of interaction
    return data.exists || data.created || data.hasEmail || false;
  } catch (error) {
    console.error('Error checking user interaction:', error);
    return false;
  }
};

  // const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0).toFixed(2);

  const createOrder = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // If we already have an order ID (either from props or state), use it
      if (orderId) {
        setPaymentStatus(`Using existing order: ${orderId}`);
        
        // Check if order needs to be persisted to database
        await checkUserInteraction(orderId);
        
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
      // Check for user interaction before capturing
      // const hasInteraction = await checkUserInteraction(data.orderID);
      
      // if (!hasInteraction) {
      //   console.log("Ensuring order exists before capture");
      // }
      
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

      return orderData

    } catch (error) {
      console.error('Error capturing payment:', error)
      setError(error.message || 'Payment failed')
      setPaymentStatus('Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }


// Updated handleCancel function for PayPalPayment.jsx
const handleCancel = async (data) => {
  setPaymentStatus("Payment cancelled");
  
  try {
    // Always check for user interaction when cancel is triggered
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
        
        // Update order status to PAYER_ACTION_REQUIRED
        try {
          const response = await fetch(
            `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
            }
          );
          
          // if (response.ok) {
          //   // const result = await response.json();
          //   // console.log("Order status updated:", result);
          // } else {
          //   console.error("Failed to update order status:", await response.text());
          // }
        } catch (updateError) {
          console.error("Error updating order status:", updateError);
        }
        
        // Clear cart and redirect to order status page
        if (onCancel && typeof onCancel === 'function') {
          onCancel(data, true); // Pass true to indicate redirect should happen
        }
        
        // Redirect to order status page
        window.location.href = `/order-status/${data.orderID}`;
      } else {
        
        // Still redirect to order status if we have an order ID
        if (onCancel && typeof onCancel === 'function') {
          onCancel(data, true); // Pass true to indicate redirect should happen
        }
        
        // Redirect to order status page
        window.location.href = `/order-status/${data.orderID}`;
      }
    } else {
      console.error("Failed to check interaction:", await checkResponse.text());
      // For error cases, still cancel without redirect
      if (onCancel && typeof onCancel === 'function') {
        onCancel(data, false); // No redirect, show message
      }
    }
  } catch (error) {
    console.error("Error in handleCancel:", error);
    if (onCancel && typeof onCancel === 'function') {
      onCancel(data, false); // No redirect, show message
    }
  }
};

  const onError = (error) => {
    console.error('PayPal error:', error)
    setError('An error occurred with PayPal')
    setPaymentStatus('Payment error')
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