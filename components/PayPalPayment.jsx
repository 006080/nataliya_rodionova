// import { useState, useEffect } from 'react'
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
// import styles from './PayPalPayment.module.css'
// // import { getPendingOrderId, clearPendingOrderId } from '../src/utils/cookieUtils'

// // Loading spinner component
// const LoadingSpinner = () => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>Loading payment options...</p>
//   </div>
// )

// // PayPal buttons wrapper component to handle loading state
// const PayPalButtonsWrapper = ({ createOrder, onApprove, onCancel, onError, disabled }) => {
//   const [{ isPending }] = usePayPalScriptReducer();
  
//   return (
//     <>
//       {isPending ? (
//         <LoadingSpinner />
//       ) : (
//         <PayPalButtons
//           createOrder={createOrder}
//           onApprove={onApprove}
//           onCancel={onCancel}
//           onError={onError}
//           disabled={disabled}
//           // style={{
//           //   layout: 'vertical',
//           //   color: 'gold',
//           //   shape: 'rect',
//           // }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL
//   return baseUrl
// }

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails, 
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null 
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('')
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [error, setError] = useState(null)
//   const [isClientLoaded, setIsClientLoaded] = useState(false)
//   const [orderId, setOrderId] = useState(existingOrderId) // Track the order ID

//   // Check for pending order in cookie on component mount
//   // useEffect(() => {
//   //   const checkForPendingOrder = async () => {
//   //     // If existingOrderId is already provided, use it
//   //     if (existingOrderId) {
//   //       setOrderId(existingOrderId);
//   //       return;
//   //     }

//   //     // Check cookie for pendingOrderId
//   //     const pendingOrderId = getPendingOrderId();
      
//   //     if (pendingOrderId) {
//   //       try {
//   //         // Verify if order exists and is valid for continuation
//   //         const response = await fetch(`${getApiUrl()}/api/payments/${pendingOrderId}/continue`);
          
//   //         if (response.ok) {
//   //           const data = await response.json();
//   //           console.log("Found valid pending order:", data);
//   //           setOrderId(data.id);
            
//   //           if (onOrderCreated && typeof onOrderCreated === 'function') {
//   //             onOrderCreated(data.id);
//   //           }
//   //         } else {
//   //           // If order is not valid, clear the cookie
//   //           clearPendingOrderId();
//   //           console.log("Pending order is not valid for continuation, will create new order");
//   //         }
//   //       } catch (error) {
//   //         console.error("Error checking pending order:", error);
//   //         // If there's an error, we'll create a new order
//   //       }
//   //     }
//   //   };

//   //   // Set isClientLoaded to true after component mounts
//   //   const timer = setTimeout(() => {
//   //     setIsClientLoaded(true);
//   //   }, 1000); // Add a small delay to ensure visibility of the spinner

//   //   // Check for pending order
//   //   checkForPendingOrder();

//   //   console.log("PayPalPayment initialized with:", { 
//   //     existingOrderId, 
//   //     cart: cart.length,
//   //     hasDeliveryDetails: !!deliveryDetails,
//   //     hasMeasurements: !!measurements,
//   //     pendingOrderId: getPendingOrderId()
//   //   });

//   //   return () => clearTimeout(timer);
//   // }, [existingOrderId, cart, deliveryDetails, measurements, onOrderCreated]);


//   useEffect(() => {
//     // Set isClientLoaded to true after component mounts
//     const timer = setTimeout(() => {
//       setIsClientLoaded(true);
//     }, 1000); // Add a small delay to ensure visibility of the spinner
  
//     // If existingOrderId is provided, use it
//     if (existingOrderId) {
//       console.log(`Using existing order ID: ${existingOrderId}`);
//       setOrderId(existingOrderId);
      
//       // Optionally check if the order is valid on the server
//       // const validateExistingOrder = async () => {
//       //   try {
//       //     const response = await fetch(`${getApiUrl()}/api/payments/${existingOrderId}/continue`);
          
//       //     if (response.ok) {
//       //       const data = await response.json();
//       //       console.log("Confirmed valid order:", data);
            
//       //       // Notify parent component if needed
//       //       if (onOrderCreated && typeof onOrderCreated === 'function') {
//       //         onOrderCreated(data.id);
//       //       }
//       //     } else {
//       //       console.log("Order is not valid for continuation, will create new order");
//       //       // If invalid, reset the orderId
//       //       setOrderId(null);
//       //     }
//       //   } catch (error) {
//       //     console.error("Error validating order:", error);
//       //   }
//       // };

// // Update the validateExistingOrder function in useEffect
// const validateExistingOrder = async () => {
//   try {
//     // Only attempt to validate if we have a non-null, non-empty ID
//     if (!existingOrderId) {
//       console.log("No existing order ID to validate");
//       return;
//     }
    
//     console.log("Validating order ID:", existingOrderId);
    
//     // Try the simpler endpoint first that just gets order details
//     const basicResponse = await fetch(`${getApiUrl()}/api/payments/${existingOrderId}`);
    
//     if (basicResponse.ok) {
//       // Order exists, so we can use it
//       const data = await basicResponse.json();
//       console.log("Order exists, using it:", data);
      
//       // Notify parent component if needed
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(existingOrderId);
//       }
      
//       // Check if it's in the right state for continuation (client-side check)
//       if (data.status !== 'PAYER_ACTION_REQUIRED' && 
//           data.status !== 'CREATED' && 
//           data.status !== 'SAVED') {
//         console.log(`Order status ${data.status} not eligible for continuation`);
//         setOrderId(null);
//       }
//     } else {
//       // If basic endpoint fails, the order doesn't exist or can't be accessed
//       console.log("Order does not exist or cannot be accessed");
//       setOrderId(null);
//     }
//   } catch (error) {
//     console.error("Error validating order:", error);
//     // If validation fails, just continue with a new order
//     setOrderId(null);
//   }
// };

      
//       validateExistingOrder();
//     }
  
//     // console.log("PayPalPayment initialized with:", { 
//     //   existingOrderId, 
//     //   cart: cart.length,
//     //   hasDeliveryDetails: !!deliveryDetails,
//     //   hasMeasurements: !!measurements
//     // });
  
//     return () => clearTimeout(timer);
//   }, [existingOrderId, cart, deliveryDetails, measurements, onOrderCreated]);


//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`
//     }));
//   };


// const checkUserInteraction = async (orderId) => {
//   try {
//     // Wait a short time to allow PayPal popup interaction
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     const response = await fetch(
//       `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
    
//     if (!response.ok) {
//       console.error(`Failed to check interaction: ${response.status}`);
//       return false;
//     }
    
//     const data = await response.json();
    
//     // Log detailed information about the interaction check
//     console.log("Interaction check response:", {
//       exists: data.exists,
//       created: data.created,
//       hasEmail: data.hasEmail,
//       hasInteraction: data.exists || data.created || data.hasEmail
//     });
    
//     // Return true if any sign of interaction
//     return data.exists || data.created || data.hasEmail || false;
//   } catch (error) {
//     console.error('Error checking user interaction:', error);
//     return false;
//   }
// };

//   // const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0).toFixed(2);

//   const createOrder = async () => {
//     setIsProcessing(true)
//     setError(null)
    
//     try {
//       // If we already have an order ID (either from props, state or cookie), use it
//       if (orderId) {
//         console.log(`Using existing order ID: ${orderId}`);
//         setPaymentStatus(`Using existing order: ${orderId}`);
        
//         // Check if order needs to be persisted to database
//         await checkUserInteraction(orderId);
        
//         return orderId;
//       }

//       setPaymentStatus('Creating order...')

//       if (!measurements || !deliveryDetails) {
//         throw new Error("Measurements and delivery details are required");
//       }

//       const formattedCart = formatCartItems(cart);

//       const res = await fetch(`${getApiUrl()}/api/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           cart: formattedCart,
//           measurements: measurements,
//           deliveryDetails: deliveryDetails
//         }),
//       })

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json()

//       if (!data.id) {
//         throw new Error('No order ID returned from backend')
//       }

//       // Store the new order ID
//       setOrderId(data.id)
      
//       // Notify parent component about the created order ID
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       console.log(`New order created: ${data.id}`);
//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error)
//       setError(error.message || 'Payment failed')
//       setPaymentStatus('Error creating order')
//       throw error
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const onApprove = async (data, actions) => {
//     setIsProcessing(true)
//     setPaymentStatus('Processing payment...')

//     try {
//       // Check for user interaction before capturing
//       const hasInteraction = await checkUserInteraction(data.orderID);
      
//       if (!hasInteraction) {
//         console.log("Ensuring order exists before capture");
//       }
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       )

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || 'Failed to capture payment')
//       }

//       const orderData = await response.json()

//       const paymentStatus = orderData.status

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!')
        
//         // Clear the pending order cookie since payment is complete
//         // clearPendingOrderId();
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData

//     } catch (error) {
//       console.error('Error capturing payment:', error)
//       setError(error.message || 'Payment failed')
//       setPaymentStatus('Payment failed')
//     } finally {
//       setIsProcessing(false)
//     }
//   }


//   // Updated handleCancel function for PayPalPayment.jsx
// const handleCancel = async (data) => {
//   setPaymentStatus("Payment cancelled");
  
//   try {
//     // Always check for user interaction when cancel is triggered
//     const checkResponse = await fetch(
//       `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
    
//     if (checkResponse.ok) {
//       const checkData = await checkResponse.json();
      
//       if (checkData.hasEmail || checkData.exists) {
//         console.log("User provided email before cancelling. Updating order status...");
        
//         // Update order status to PAYER_ACTION_REQUIRED
//         try {
//           const response = await fetch(
//             `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//             {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//             }
//           );
          
//           if (response.ok) {
//             const result = await response.json();
//             console.log("Order status updated:", result);
//           } else {
//             console.error("Failed to update order status:", await response.text());
//           }
//         } catch (updateError) {
//           console.error("Error updating order status:", updateError);
//         }
        
//         // Clear cart and redirect to order status page
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true); // Pass true to indicate redirect should happen
//         }
        
//         // Redirect to order status page
//         window.location.href = `/order-status/${data.orderID}`;
//       } else {
//         console.log("User closed PayPal popup without providing email");
        
//         // Still redirect to order status if we have an order ID
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true); // Pass true to indicate redirect should happen
//         }
        
//         // Redirect to order status page
//         window.location.href = `/order-status/${data.orderID}`;
//       }
//     } else {
//       console.error("Failed to check interaction:", await checkResponse.text());
//       // For error cases, still cancel without redirect
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, false); // No redirect, show message
//       }
//     }
//   } catch (error) {
//     console.error("Error in handleCancel:", error);
//     if (onCancel && typeof onCancel === 'function') {
//       onCancel(data, false); // No redirect, show message
//     }
//   }
// };



//   const onError = (error) => {
//     console.error('PayPal error:', error)
//     setError('An error occurred with PayPal')
//     setPaymentStatus('Payment error')
//   }

//   const isDataValid = cart.length > 0 && 
//                      measurements && 
//                      deliveryDetails && 
//                      deliveryDetails.fullName &&
//                      deliveryDetails.address &&
//                      deliveryDetails.postalCode &&
//                      deliveryDetails.city &&
//                      deliveryDetails.country &&
//                      deliveryDetails.email &&
//                      deliveryDetails.phone;

//   if (!isDataValid) {
//     let missingItems = [];
//     if (cart.length === 0) missingItems.push("cart items");
//     if (!measurements) missingItems.push("measurements");
//     if (!deliveryDetails) missingItems.push("delivery details");
//     else {
//       if (!deliveryDetails.fullName) missingItems.push("full name");
//       if (!deliveryDetails.address) missingItems.push("address");
//       if (!deliveryDetails.postalCode) missingItems.push("postal code");
//       if (!deliveryDetails.city) missingItems.push("city");
//       if (!deliveryDetails.country) missingItems.push("country");
//       if (!deliveryDetails.email) missingItems.push("email");
//       if (!deliveryDetails.phone) missingItems.push("phone");
//     }
    
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.errorMessage}>
//           Cannot proceed with payment. Missing: {missingItems.join(", ")}
//         </div>
//         <pre style={{fontSize: '12px', background: '#f7f7f7', padding: '10px', borderRadius: '4px'}}>
//           {JSON.stringify({cart: cart.length > 0, measurements: !!measurements, deliveryDetails: !!deliveryDetails}, null, 2)}
//         </pre>
//       </div>
//     );
//   }

//   // Show spinner if client is not loaded yet
//   if (!isClientLoaded) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   return (
//     <PayPalScriptProvider
//       options={{
//         'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
//         currency: 'EUR',
//       }}
//     >
//       <div className={styles.payPalContainer}>
//         {error && <div className={styles.errorMessage}>{error}</div>}

//         <div className={styles.paypalButtonContainer}>
//           <PayPalButtonsWrapper
//             createOrder={createOrder}
//             onApprove={onApprove}
//             onCancel={handleCancel}
//             onError={onError}
//             disabled={isProcessing}
//           />
//         </div>
//       </div>
//     </PayPalScriptProvider>
//   )
// }

// export default PayPalPayment







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
    
    // Log detailed information about the interaction check
    console.log("Interaction check response:", {
      exists: data.exists,
      created: data.created,
      hasEmail: data.hasEmail,
      hasInteraction: data.exists || data.created || data.hasEmail
    });
    
    // Return true if any sign of interaction
    return data.exists || data.created || data.hasEmail || false;
  } catch (error) {
    console.error('Error checking user interaction:', error);
    return false;
  }
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
      // Check for user interaction before capturing
      const hasInteraction = await checkUserInteraction(data.orderID);
      
      if (!hasInteraction) {
        console.log("Ensuring order exists before capture");
      }
      
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
        console.log("User provided email before cancelling. Updating order status...");
        
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
          
          if (response.ok) {
            const result = await response.json();
            console.log("Order status updated:", result);
          } else {
            console.error("Failed to update order status:", await response.text());
          }
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
        console.log("User closed PayPal popup without providing email");
        
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