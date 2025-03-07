// import { useState } from 'react';
// import { useMeasurements } from './MeasureForm';
// import styles from './MolliePayment.module.css';

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function MolliePayment({ cart = [], onSuccess, onCancel }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [checkoutUrl, setCheckoutUrl] = useState('');
//   const { measurements } = useMeasurements();

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`
//     }));
//   };

//   const createPayment = async () => {
//     setIsProcessing(true);
//     setError(null);
//     setPaymentStatus('Creating payment...');

//     try {
//       const formattedCart = formatCartItems(cart);
      
//       const res = await fetch(`${getApiUrl()}/api/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           cart: formattedCart,
//           measurements,
//           paymentMethod: 'mollie'
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create payment");
//       }

//       const data = await res.json();
      
//       if (!data.checkoutUrl) {
//         throw new Error('No checkout URL returned from backend');
//       }

//       setCheckoutUrl(data.checkoutUrl);
//       setPaymentStatus("Payment created successfully");
//     } catch (error) {
//       console.error('Error creating payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (!cart.length) {
//     return <div>No items in cart</div>;
//   }

//   return (
//     <div className={styles.mollieContainer}>
//       {error && <div className={styles.errorMessage}>{error}</div>}
//       {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}

//       {!checkoutUrl ? (
//         <button 
//           onClick={createPayment} 
//           disabled={isProcessing}
//           className={styles.payButton}
//         >
//           {isProcessing ? 'Processing...' : 'Pay with Mollie'}
//         </button>
//       ) : (
//         <div className={styles.redirectContainer}>
//           <p>You will be redirected to Mollie&apos;s secure payment page.</p>
//           <a 
//             href={checkoutUrl} 
//             className={styles.redirectButton}
//             target="_blank" 
//             rel="noopener noreferrer"
//           >
//             Continue to Payment
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MolliePayment;



// import { useState, useEffect } from 'react';
// import { useMeasurements } from './MeasureForm';
// import styles from './MolliePayment.module.css';

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function MolliePayment({ cart = [], onSuccess, onCancel }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [checkoutUrl, setCheckoutUrl] = useState('');
//   const [orderReference, setOrderReference] = useState('');
//   const { measurements } = useMeasurements();

//   // Check the payment status on component mount or when URL parameters change
//   useEffect(() => {
//     const checkPaymentStatus = async () => {
//       // Get URL parameters
//       const urlParams = new URLSearchParams(window.location.search);
//       const paymentId = urlParams.get('id');
//       const status = urlParams.get('status');
      
//       // If we have both payment ID and status in URL and a stored order reference
//       if (paymentId && status && orderReference) {
//         setIsProcessing(true);
//         setPaymentStatus('Verifying payment status...');
        
//         try {
//           const res = await fetch(`${getApiUrl()}/api/payments/${paymentId}/status`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               orderReference,
//               paymentMethod: 'mollie'
//             }),
//           });
          
//           if (!res.ok) {
//             const errorData = await res.json();
//             throw new Error(errorData.message || "Failed to verify payment");
//           }
          
//           const data = await res.json();
          
//           if (data.status === 'paid') {
//             setPaymentStatus('Payment successful!');
            
//             if (onSuccess && typeof onSuccess === 'function') {
//               onSuccess(data);
//             }
//           } else if (data.status === 'canceled' || data.status === 'failed' || data.status === 'expired') {
//             setPaymentStatus(`Payment ${data.status}`);
            
//             if (onCancel && typeof onCancel === 'function') {
//               onCancel(data);
//             }
//           } else {
//             setPaymentStatus(`Payment status: ${data.status}`);
//           }
//         } catch (error) {
//           console.error('Error checking payment status:', error);
//           setError(error.message || 'Failed to verify payment');
          
//           if (onCancel && typeof onCancel === 'function') {
//             onCancel({ error: error.message });
//           }
//         } finally {
//           setIsProcessing(false);
          
//           // Clear URL parameters after processing
//           window.history.replaceState({}, document.title, window.location.pathname);
//         }
//       }
//     };
    
//     checkPaymentStatus();
//   }, [orderReference, onSuccess, onCancel]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`
//     }));
//   };

//   const createPayment = async () => {
//     setIsProcessing(true);
//     setError(null);
//     setPaymentStatus('Creating payment...');

//     try {
//       const formattedCart = formatCartItems(cart);
      
//       // Construct redirect URLs for success and cancelation
//       const currentUrl = window.location.href.split('?')[0]; // Remove any existing query params
//       const redirectUrl = `${currentUrl}?status=paid`;
//       const cancelUrl = `${currentUrl}?status=canceled`;
      
//       const res = await fetch(`${getApiUrl()}/api/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           cart: formattedCart,
//           measurements,
//           paymentMethod: 'mollie',
//           redirectUrl,
//           cancelUrl
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create payment");
//       }

//       const data = await res.json();
      
//       if (!data.checkoutUrl) {
//         throw new Error('No checkout URL returned from backend');
//       }

//       // Store the order reference for use on redirect
//       if (data.orderReference) {
//         setOrderReference(data.orderReference);
//         // Also save to localStorage as a fallback
//         localStorage.setItem('mollieOrderReference', data.orderReference);
//       }

//       setCheckoutUrl(data.checkoutUrl);
//       setPaymentStatus("Payment created successfully");
//     } catch (error) {
//       console.error('Error creating payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Handle manual cancellation before redirection
//   const handleCancel = () => {
//     setCheckoutUrl('');
//     setPaymentStatus('');
    
//     if (onCancel && typeof onCancel === 'function') {
//       onCancel({ status: 'canceled_by_user' });
//     }
//   };

//   // Retrieve order reference from localStorage on component mount
//   useEffect(() => {
//     const storedOrderReference = localStorage.getItem('mollieOrderReference');
//     if (storedOrderReference && !orderReference) {
//       setOrderReference(storedOrderReference);
//     }
//   }, [orderReference]);

//   if (!cart.length) {
//     return <div>No items in cart</div>;
//   }

//   return (
//     <div className={styles.mollieContainer}>
//       {error && <div className={styles.errorMessage}>{error}</div>}
//       {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}

//       {!checkoutUrl ? (
//         <button 
//           onClick={createPayment} 
//           disabled={isProcessing}
//           className={styles.payButton}
//         >
//           {isProcessing ? 'Processing...' : 'Pay with Mollie'}
//         </button>
//       ) : (
//         <div className={styles.redirectContainer}>
//           <p>You will be redirected to Mollie&apos;s secure payment page.</p>
//           <div className={styles.buttonContainer}>
//             <a 
//               href={checkoutUrl} 
//               className={styles.redirectButton}
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               Continue to Payment
//             </a>
//             <button 
//               onClick={handleCancel}
//               className={styles.cancelButton}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MolliePayment;


// import { useState, useEffect } from 'react';
// import { useMeasurements } from './MeasureForm';
// import styles from './MolliePayment.module.css';

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function MolliePayment({ cart = [], onSuccess, onCancel }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [checkoutUrl, setCheckoutUrl] = useState('');
//   const [orderReference, setOrderReference] = useState('');
//   const { measurements } = useMeasurements();

//   // Check the payment status on component mount or when URL parameters change
//   useEffect(() => {
//     const checkPaymentStatus = async () => {
//       // Get URL parameters
//       const urlParams = new URLSearchParams(window.location.search);
//       const paymentId = urlParams.get('id');
//       const status = urlParams.get('status');
      
//       // If we have both payment ID and status in URL and a stored order reference
//       if ((paymentId || orderReference) && status) {
//         // Use the provided paymentId or the orderReference as a fallback
//         const idToUse = paymentId || orderReference;
//         setIsProcessing(true);
//         setPaymentStatus('Verifying payment status...');
        
//         try {
//           // Get payment status and details from the backend
//           const res = await fetch(`${getApiUrl()}/api/payments/${idToUse}/status`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               orderReference,
//               paymentMethod: 'mollie',
//               includeItems: true // Request detailed order information
//             }),
//           });
          
//           if (!res.ok) {
//             const errorData = await res.json();
//             throw new Error(errorData.message || "Failed to verify payment");
//           }
          
//           const data = await res.json();
          
//           if (data.status === 'paid') {
//             setPaymentStatus('Payment successful!');
            
//             // Format the response to match the same structure used by PayPal and Stripe
//             // Create a properly formatted object that matches what PayPal/Stripe return
//             // This ensures the order confirmation display works correctly
//             const formattedData = {
//               id: data.id || data.orderReference || orderReference || idToUse,
//               status: 'COMPLETED', // Use the same status format as PayPal for consistency
//               order_details: data.details || {},
//               // Include cart items for the order confirmation if not returned by the backend
//               items: data.items || cart,
//               payment_method: 'mollie',
//               create_time: data.createdAt || new Date().toISOString(),
//               update_time: data.paidAt || new Date().toISOString()
//             };
            
//             if (onSuccess && typeof onSuccess === 'function') {
//               onSuccess(formattedData);
//             }
//           } else if (data.status === 'canceled' || data.status === 'failed' || data.status === 'expired') {
//             setPaymentStatus(`Payment ${data.status}`);
            
//             // Format cancellation data to match other payment methods
//             const cancellationData = {
//               id: data.id || paymentId,
//               status: data.status.toUpperCase(),
//               reason: data.failureReason || 'Payment was not completed'
//             };
            
//             if (onCancel && typeof onCancel === 'function') {
//               onCancel(cancellationData);
//             }
//           } else {
//             setPaymentStatus(`Payment status: ${data.status}`);
//           }
//         } catch (error) {
//           console.error('Error checking payment status:', error);
//           setError(error.message || 'Failed to verify payment');
          
//           if (onCancel && typeof onCancel === 'function') {
//             onCancel({ error: error.message });
//           }
//         } finally {
//           setIsProcessing(false);
          
//           // Clear URL parameters after processing to prevent reprocessing on refresh
//           // But wait until the success callback has been properly triggered
//           if (data.status === 'paid' || status === 'paid') {
//             setTimeout(() => {
//               window.history.replaceState({}, document.title, window.location.pathname);
//             }, 500); // Short delay to ensure the success callback completes
//           } else {
//             window.history.replaceState({}, document.title, window.location.pathname);
//           }
//         }
//       }
//     };
    
//     checkPaymentStatus();
//   }, [orderReference, onSuccess, onCancel]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`
//     }));
//   };

//   const createPayment = async () => {
//     setIsProcessing(true);
//     setError(null);
//     setPaymentStatus('Creating payment...');

//     try {
//       const formattedCart = formatCartItems(cart);
      
//       // Construct redirect URLs for success and cancelation
//       // IMPORTANT: We'll redirect back to this same page with status parameters
//       const currentUrl = window.location.href.split('?')[0]; // Remove any existing query params
//       const redirectUrl = `${currentUrl}?status=paid`;
//       const cancelUrl = `${currentUrl}?status=canceled`;
      
//       const res = await fetch(`${getApiUrl()}/api/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           cart: formattedCart,
//           measurements,
//           paymentMethod: 'mollie',
//           redirectUrl,
//           cancelUrl,
//           preventRedirect: true // Tell backend not to redirect to order-complete
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create payment");
//       }

//       const data = await res.json();
      
//       if (!data.checkoutUrl) {
//         throw new Error('No checkout URL returned from backend');
//       }

//       // Store the order reference for use on redirect
//       if (data.orderReference) {
//         setOrderReference(data.orderReference);
//         // Also save to localStorage as a fallback
//         localStorage.setItem('mollieOrderReference', data.orderReference);
//       }

//       setCheckoutUrl(data.checkoutUrl);
//       setPaymentStatus("Payment created successfully");
//     } catch (error) {
//       console.error('Error creating payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Handle manual cancellation before redirection
//   const handleCancel = () => {
//     setCheckoutUrl('');
//     setPaymentStatus('');
    
//     if (onCancel && typeof onCancel === 'function') {
//       onCancel({ 
//         id: orderReference || 'user-canceled',
//         status: 'CANCELED',
//         reason: 'User canceled before completing payment'
//       });
//     }
//   };

//   // Retrieve order reference from localStorage on component mount
//   useEffect(() => {
//     const storedOrderReference = localStorage.getItem('mollieOrderReference');
//     if (storedOrderReference && !orderReference) {
//       setOrderReference(storedOrderReference);
//     }
    
//     // Check if we need to clear localStorage after successful payment
//     const urlParams = new URLSearchParams(window.location.search);
//     const status = urlParams.get('status');
//     if (status === 'paid' || status === 'completed') {
//       // Clear localStorage after successful processing to prevent duplicate processing
//       setTimeout(() => {
//         localStorage.removeItem('mollieOrderReference');
//       }, 2000);
//     }
//   }, [orderReference]);

//   if (!cart.length) {
//     return <div>No items in cart</div>;
//   }

//   return (
//     <div className={styles.mollieContainer}>
//       {error && <div className={styles.errorMessage}>{error}</div>}
//       {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}

//       {!checkoutUrl ? (
//         <button 
//           onClick={createPayment} 
//           disabled={isProcessing}
//           className={styles.payButton}
//         >
//           {isProcessing ? 'Processing...' : 'Pay with Mollie'}
//         </button>
//       ) : (
//         <div className={styles.redirectContainer}>
//           <p>You will be redirected to Mollie&apos;s secure payment page.</p>
//           <div className={styles.buttonContainer}>
//             <a 
//               href={checkoutUrl} 
//               className={styles.redirectButton}
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               Continue to Payment
//             </a>
//             <button 
//               onClick={handleCancel}
//               className={styles.cancelButton}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MolliePayment;






// import { useState, useEffect } from 'react';
// import { useMeasurements } from './MeasureForm';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import styles from './MolliePayment.module.css';

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function MolliePayment({ cart = [], onSuccess, onCancel }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [checkoutUrl, setCheckoutUrl] = useState('');
//   const [orderReference, setOrderReference] = useState('');
//   const { measurements } = useMeasurements();
  
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
  
//   // Check for redirect from Mollie with payment ID
//   const molliePaymentId = searchParams.get('id');
//   const molliePaymentStatus = searchParams.get('status');

//   useEffect(() => {
//     // If we have a payment ID in URL and we've returned from Mollie
//     if (molliePaymentId && (molliePaymentStatus === 'paid' || molliePaymentStatus === 'authorized')) {
//       verifyPayment(molliePaymentId);
//     }
//   }, [molliePaymentId, molliePaymentStatus]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`
//     }));
//   };

//   const createPayment = async () => {
//     setIsProcessing(true);
//     setError(null);
//     setPaymentStatus('Creating payment...');

//     try {
//       const formattedCart = formatCartItems(cart);
      
//       const res = await fetch(`${getApiUrl()}/api/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           cart: formattedCart,
//           measurements,
//           paymentMethod: 'mollie'
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create payment");
//       }

//       const data = await res.json();
      
//       if (!data.checkoutUrl) {
//         throw new Error('No checkout URL returned from backend');
//       }

//       // Store order reference for capturing later
//       if (data.orderReference) {
//         // Save in localStorage for persistence across redirects
//         localStorage.setItem('mollieOrderReference', data.orderReference);
//         setOrderReference(data.orderReference);
//         console.log('Order reference saved:', data.orderReference);
//       }

//       setCheckoutUrl(data.checkoutUrl);
//       setPaymentStatus("Payment created successfully");
//     } catch (error) {
//       console.error('Error creating payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const verifyPayment = async (paymentId) => {
//     setIsProcessing(true);
//     setPaymentStatus('Verifying payment...');

//     try {
//       // Get the order reference from state or localStorage
//       const storedOrderReference = orderReference || localStorage.getItem('mollieOrderReference');
      
//       if (!storedOrderReference) {
//         throw new Error('Order reference not found');
//       }

//       // Capture the payment on the backend
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${paymentId}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             orderReference: storedOrderReference,
//             paymentMethod: 'mollie'
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       console.log('Payment captured:', orderData);

//       // Clean up localStorage
//       localStorage.removeItem('mollieOrderReference');
      
//       // Clear URL parameters
//       navigate('/checkout', { replace: true });
      
//       setPaymentStatus('Payment successful!');

//       if (onSuccess && typeof onSuccess === 'function') {
//         onSuccess(orderData);
//       }
//     } catch (error) {
//       console.error('Error verifying payment:', error);
//       setError(error.message || 'Payment verification failed');
//       setPaymentStatus('Payment failed');
      
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel();
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // If we're already processing a redirect, show a loading status
//   if (molliePaymentId && isProcessing) {
//     return (
//       <div className={styles.mollieContainer}>
//         <div className={styles.statusMessage}>
//           {paymentStatus || 'Processing your payment...'}
//         </div>
//       </div>
//     );
//   }

//   if (!cart.length) {
//     return <div>No items in cart</div>;
//   }

//   return (
//     <div className={styles.mollieContainer}>
//       {error && <div className={styles.errorMessage}>{error}</div>}
//       {paymentStatus && <div className={styles.statusMessage}>{paymentStatus}</div>}

//       {!checkoutUrl ? (
//         <button 
//           onClick={createPayment} 
//           disabled={isProcessing}
//           className={styles.payButton}
//         >
//           {isProcessing ? 'Processing...' : 'Pay with Mollie'}
//         </button>
//       ) : (
//         <div className={styles.redirectContainer}>
//           <p>You will be redirected to Mollie&apos;s secure payment page.</p>
//           <a 
//             href={checkoutUrl} 
//             className={styles.redirectButton}
//             target="_blank" 
//             rel="noopener noreferrer"
//           >
//             Continue to Payment
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MolliePayment;




import { useState, useEffect } from 'react';
import { useMeasurements } from './MeasureForm';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const [orderReference, setOrderReference] = useState('');
  const { measurements } = useMeasurements();
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check for redirect from Mollie with payment ID
  const molliePaymentId = searchParams.get('id');
  const molliePaymentStatus = searchParams.get('status');

  useEffect(() => {
    // If we have a payment ID in URL and we've returned from Mollie
    if (molliePaymentId && (molliePaymentStatus === 'paid' || molliePaymentStatus === 'authorized')) {
      verifyPayment(molliePaymentId);
    } else if (molliePaymentId && molliePaymentStatus === 'canceled') {
      // Handle canceled payment
      setError('Payment was canceled');
      setPaymentStatus('Payment canceled');
      
      // Clear URL parameters
      navigate('/checkout', { replace: true });
      
      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    } else if (molliePaymentId && molliePaymentStatus === 'failed') {
      // Handle failed payment
      setError('Payment failed');
      setPaymentStatus('Payment failed');
      
      // Clear URL parameters
      navigate('/checkout', { replace: true });
      
      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    }
  }, [molliePaymentId, molliePaymentStatus, navigate, onCancel]);

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

      // Store order reference for capturing later
      if (data.orderReference) {
        // Save in localStorage for persistence across redirects
        localStorage.setItem('mollieOrderReference', data.orderReference);
        setOrderReference(data.orderReference);
        console.log('Order reference saved:', data.orderReference);
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

  const verifyPayment = async (paymentId) => {
    setIsProcessing(true);
    setPaymentStatus('Verifying payment...');

    try {
      // Get the order reference from state or localStorage
      const storedOrderReference = orderReference || localStorage.getItem('mollieOrderReference');
      
      if (!storedOrderReference) {
        throw new Error('Order reference not found');
      }

      // Capture the payment on the backend
      const response = await fetch(
        `${getApiUrl()}/api/payments/${paymentId}/capture`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderReference: storedOrderReference,
            paymentMethod: 'mollie'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to capture payment');
      }

      const orderData = await response.json();
      console.log('Payment captured:', orderData);

      // Clean up localStorage
      localStorage.removeItem('mollieOrderReference');
      
      // Clear URL parameters
      navigate('/checkout', { replace: true });
      
      setPaymentStatus('Payment successful!');

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(orderData);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError(error.message || 'Payment verification failed');
      setPaymentStatus('Payment failed');
      
      if (onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // If we're already processing a redirect, show a loading status
  if (molliePaymentId && isProcessing) {
    return (
      <div className={styles.mollieContainer}>
        <div className={styles.statusMessage}>
          {paymentStatus || 'Processing your payment...'}
        </div>
      </div>
    );
  }

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