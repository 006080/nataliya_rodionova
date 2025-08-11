// import { useState, useEffect } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = () => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>Loading payment options...</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [isClientLoaded, setIsClientLoaded] = useState(false);
//   const [orderId, setOrderId] = useState(existingOrderId);
//   const [consentRequired, setConsentRequired] = useState(!hasThirdPartyConsent());

//   // Listen for consent changes - ALWAYS at the top level
//   useEffect(() => {
//     const handleConsentChange = (event) => {
//       if (event.detail && event.detail.consent === 'all') {
//         // Update consent status immediately when accepted
//         setConsentRequired(false);
        
//         // Force a refresh of the client loading state
//         setIsClientLoaded(false);
        
//         // Manually trigger script loading
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
          
//           // Set a timeout to ensure the PayPal script has time to load
//           setTimeout(() => {
//             setIsClientLoaded(true);
//           }, 1500);
//         });
//       } else if (event.detail && event.detail.consent === 'essential') {
//         // Update to show consent required message immediately
//         setConsentRequired(true);
//         setIsClientLoaded(false);
//       }
//     };
    
//     window.addEventListener('consentChanged', handleConsentChange);
    
//     // Initial check on mount
//     if (hasThirdPartyConsent()) {
//       setConsentRequired(false);
//     } else {
//       setConsentRequired(true);
//     }
    
//     return () => {
//       window.removeEventListener('consentChanged', handleConsentChange);
//     };
//   }, []);

//   // Listen for PayPal script loading events - ALWAYS at the top level
//   useEffect(() => {
//     // Only add event listeners if consent is given
//     if (!consentRequired) {
//       const handlePayPalLoaded = () => {
//         console.log("PayPal script load event detected");
//         setIsClientLoaded(true);
//       };
      
//       window.addEventListener('paypalLoaded', handlePayPalLoaded);
      
//       // Add some extra time to make sure script is properly initialized
//       const timer = setTimeout(() => {
//         setIsClientLoaded(true);
//       }, 2000);
      
//       return () => {
//         window.removeEventListener('paypalLoaded', handlePayPalLoaded);
//         clearTimeout(timer);
//       };
//     }
//   }, [consentRequired]); // Depend on consentRequired to re-run when consent changes

//   // Check for pending order on component mount - ALWAYS at the top level
//   useEffect(() => {
//     const checkForPendingOrder = async () => {
//       // If existingOrderId is already provided, use it
//       if (existingOrderId) {
//         setOrderId(existingOrderId);
//         return;
//       }
//     };

//     checkForPendingOrder();
//   }, [existingOrderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       // If we already have an order ID (either from props or state), use it
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       // Store the new order ID
//       setOrderId(data.id);
      
//       // Notify parent component about the created order ID
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data, actions) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         // Clear the pending order ID using the provided callback
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setPaymentStatus("Payment cancelled");
    
//     try {
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, false);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

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
//       </div>
//     );
//   }

//   // Render the consent message if needed
//   if (consentRequired) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
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
//   );
// }

// export default PayPalPayment;





















































// import { useState, useEffect, useCallback, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = () => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>Loading payment options...</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
  
//   // Simplified state management - only track what we need
//   const [paymentState, setPaymentState] = useState({
//     hasConsent: hasThirdPartyConsent(),
//     isReady: false,
//     isLoading: true
//   });

//   // Use ref to prevent multiple simultaneous updates
//   const stateUpdateRef = useRef(false);
//   const consentCheckTimeoutRef = useRef(null);

//   // Centralized consent and readiness checker
//   const checkPaymentReadiness = useCallback(() => {
//     if (stateUpdateRef.current) return; // Prevent concurrent updates
    
//     stateUpdateRef.current = true;
    
//     // Clear any existing timeout
//     if (consentCheckTimeoutRef.current) {
//       clearTimeout(consentCheckTimeoutRef.current);
//     }

//     const currentConsent = hasThirdPartyConsent();
    
//     setPaymentState(prev => {
//       // Only update if something actually changed
//       if (prev.hasConsent === currentConsent && prev.isReady && !prev.isLoading) {
//         stateUpdateRef.current = false;
//         return prev;
//       }

//       if (!currentConsent) {
//         stateUpdateRef.current = false;
//         return {
//           hasConsent: false,
//           isReady: false,
//           isLoading: false
//         };
//       }

//       // If consent is granted, allow a brief loading period for PayPal script
//       consentCheckTimeoutRef.current = setTimeout(() => {
//         setPaymentState(current => ({
//           ...current,
//           isReady: true,
//           isLoading: false
//         }));
//         stateUpdateRef.current = false;
//       }, 1000); // Give PayPal script time to load

//       return {
//         hasConsent: true,
//         isReady: false,
//         isLoading: true
//       };
//     });

//     if (!currentConsent) {
//       stateUpdateRef.current = false;
//     }
//   }, []);

//   // Single useEffect for consent management
//   useEffect(() => {
//     // Initial check
//     checkPaymentReadiness();

//     // Listen for consent changes
//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent change detected', event.detail);
      
//       // Small delay to ensure consent utils are updated
//       setTimeout(() => {
//         checkPaymentReadiness();
//       }, 100);
//     };

//     // Listen for PayPal script loading
//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded event detected');
//       if (hasThirdPartyConsent()) {
//         setTimeout(() => {
//           setPaymentState(prev => ({
//             ...prev,
//             isReady: true,
//             isLoading: false
//           }));
//           stateUpdateRef.current = false;
//         }, 500);
//       }
//     };

//     // Event listeners
//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     // Cleanup
//     return () => {
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
      
//       if (consentCheckTimeoutRef.current) {
//         clearTimeout(consentCheckTimeoutRef.current);
//       }
      
//       stateUpdateRef.current = false;
//     };
//   }, []); // Empty dependency array - we handle all updates internally

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data, actions) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setPaymentStatus("Payment cancelled");
    
//     try {
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, false);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show consent message if needed
//   if (!paymentState.hasConsent) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while PayPal is initializing
//   if (paymentState.isLoading || !paymentState.isReady) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Render PayPal buttons
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
//   );
// }

// export default PayPalPayment;






















//Version with working OrderStatus page
// import { useState, useEffect } from 'react'
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
// import styles from './PayPalPayment.module.css'


// const LoadingSpinner = () => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>Loading payment options...</p>
//   </div>
// )


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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
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
//   // colorPreference,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId // New prop to clear order ID
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('')
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [error, setError] = useState(null)
//   const [isClientLoaded, setIsClientLoaded] = useState(false)
//   const [orderId, setOrderId] = useState(existingOrderId) 

//   // Check for pending order on component mount
//   useEffect(() => {
//     const checkForPendingOrder = async () => {
//       // If existingOrderId is already provided, use it
//       if (existingOrderId) {
//         setOrderId(existingOrderId);
//         return;
//       }
//     };


//     const timer = setTimeout(() => {
//       setIsClientLoaded(true);
//     }, 1000);


//     checkForPendingOrder();


//     return () => clearTimeout(timer);
//   }, [existingOrderId, cart, deliveryDetails, measurements, onOrderCreated]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,  // ???
//       color: item.color || ''
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
//       // If we already have an order ID (either from props or state), use it
//       if (orderId) {
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
//       // const hasInteraction = await checkUserInteraction(data.orderID);
      
//       // if (!hasInteraction) {
//       //   console.log("Ensuring order exists before capture");
//       // }
      
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
        
//         // Clear the pending order ID using the provided callback
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
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


// // Updated handleCancel function for PayPalPayment.jsx
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
          
//           // if (response.ok) {
//           //   // const result = await response.json();
//           //   // console.log("Order status updated:", result);
//           // } else {
//           //   console.error("Failed to update order status:", await response.text());
//           // }
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



















//Version with redirection Ok, with buttons not ok
// import { useState, useEffect, useCallback, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = ({ message = "Loading payment options..." }) => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>{message}</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
  
//   // Single state object to prevent flickering
//   const [componentState, setComponentState] = useState({
//     hasConsent: hasThirdPartyConsent(),
//     isReady: false,
//     isRedirecting: false,
//     initialized: false
//   });

//   // Refs to prevent race conditions
//   const stateUpdateRef = useRef(false);
//   const initTimeoutRef = useRef(null);
//   const consentCheckRef = useRef(null);

//   // Stable consent checker with debouncing
//   const checkConsentState = useCallback(() => {
//     if (stateUpdateRef.current) return;
    
//     // Clear any pending checks
//     if (consentCheckRef.current) {
//       clearTimeout(consentCheckRef.current);
//     }
    
//     // Debounce consent checks
//     consentCheckRef.current = setTimeout(() => {
//       const currentConsent = hasThirdPartyConsent();
      
//       setComponentState(prev => {
//         // Only update if consent actually changed
//         if (prev.hasConsent === currentConsent && prev.initialized) {
//           return prev;
//         }
        
//         if (!currentConsent) {
//           return {
//             hasConsent: false,
//             isReady: false,
//             isRedirecting: false,
//             initialized: true
//           };
//         }
        
//         // Has consent but not ready - start loading
//         if (currentConsent && !prev.isReady) {
//           // Set loading state first
//           setTimeout(() => {
//             setComponentState(current => ({
//               ...current,
//               isReady: true,
//               initialized: true
//             }));
//           }, 1500); // Stable delay
          
//           return {
//             hasConsent: true,
//             isReady: false,
//             isRedirecting: false,
//             initialized: true
//           };
//         }
        
//         return prev;
//       });
//     }, 100); // Small debounce delay
//   }, []);

//   // Single useEffect for all consent management
//   useEffect(() => {
//     // Initial check
//     if (initTimeoutRef.current) {
//       clearTimeout(initTimeoutRef.current);
//     }
    
//     initTimeoutRef.current = setTimeout(() => {
//       checkConsentState();
//     }, 100);

//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent changed', event.detail);
      
//       if (event.detail && event.detail.consent === 'all') {
//         // Load PayPal script
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         });
//       }
      
//       // Debounced consent check
//       setTimeout(() => {
//         checkConsentState();
//       }, 200);
//     };

//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded');
//       // Additional delay after script loads
//       setTimeout(() => {
//         checkConsentState();
//       }, 300);
//     };

//     // Event listeners
//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     // Cleanup
//     return () => {
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
      
//       if (initTimeoutRef.current) {
//         clearTimeout(initTimeoutRef.current);
//       }
//       if (consentCheckRef.current) {
//         clearTimeout(consentCheckRef.current);
//       }
      
//       stateUpdateRef.current = false;
//     };
//   }, []); // Empty deps array

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const checkUserInteraction = async (orderId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (!response.ok) {
//         console.error(`Failed to check interaction: ${response.status}`);
//         return false;
//       }
      
//       const data = await response.json();
//       return data.exists || data.created || data.hasEmail || false;
//     } catch (error) {
//       console.error('Error checking user interaction:', error);
//       return false;
//     }
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         await checkUserInteraction(orderId);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data) => { // Removed unused 'actions' parameter
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Enhanced handleCancel with loading state
//   const handleCancel = async (data) => {
//     // Show redirecting state immediately
//     setComponentState(prev => ({ ...prev, isRedirecting: true }));
//     setPaymentStatus("Processing cancellation...");
    
//     try {
//       // Check for user interaction when cancel is triggered
//       const checkResponse = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (checkResponse.ok) {
//         const checkData = await checkResponse.json();
        
//         if (checkData.hasEmail || checkData.exists) {
//           // Update order status to PAYER_ACTION_REQUIRED
//           try {
//             await fetch(
//               `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//               {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//               }
//             );
//           } catch (updateError) {
//             console.error("Error updating order status:", updateError);
//           }
//         }
        
//         // Call onCancel with redirect flag
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         // Redirect with slight delay for UX
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
        
//       } else {
//         console.error("Failed to check interaction:", await checkResponse.text());
        
//         // Still redirect even on error
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
      
//       // Fallback: still try to redirect
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, true);
//       }
      
//       // Try to redirect even if there's an error
//       if (data && data.orderID) {
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       } else {
//         // If no order ID, show cancel message instead
//         setComponentState(prev => ({ ...prev, isRedirecting: false }));
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, false);
//         }
//       }
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show redirecting spinner
//   if (componentState.isRedirecting) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner message="Redirecting to complete payment..." />
//       </div>
//     );
//   }

//   // Show consent message if needed
//   if (!componentState.hasConsent) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while PayPal is initializing
//   if (!componentState.isReady || !componentState.initialized) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Render PayPal buttons
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
//   );
// }

// export default PayPalPayment;















//Works fine exept afte changing cookie consent
// import { useState, useEffect, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = ({ message = "Loading payment options..." }) => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>{message}</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
//   const [isRedirecting, setIsRedirecting] = useState(false);
  
//   // Much simpler state management
//   const [showPayPal, setShowPayPal] = useState(false);
//   const [hasConsent, setHasConsent] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const initRef = useRef(false);

//   useEffect(() => {
//     if (initRef.current) return;
//     initRef.current = true;

//     const checkAndSetup = () => {
//       const currentConsent = hasThirdPartyConsent();
      
//       if (currentConsent) {
//         console.log('PayPal: Has consent, setting up...');
//         setHasConsent(true);
//         setIsLoading(true);
        
//         // Load PayPal script
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         });
        
//         // Simple timeout to show buttons
//         setTimeout(() => {
//           console.log('PayPal: Showing buttons');
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 1500);
//       } else {
//         console.log('PayPal: No consent');
//         setHasConsent(false);
//         setShowPayPal(false);
//         setIsLoading(false);
//       }
//     };

//     // Initial check
//     checkAndSetup();

//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent changed', event.detail);
      
//       if (event.detail && event.detail.consent === 'all') {
//         setHasConsent(true);
//         setIsLoading(true);
//         setShowPayPal(false);
        
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         });
        
//         setTimeout(() => {
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 1500);
        
//       } else if (event.detail && (event.detail.consent === 'essential' || event.detail.consent === 'none')) {
//         setHasConsent(false);
//         setShowPayPal(false);
//         setIsLoading(false);
//       }
//     };

//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded event');
//       if (hasThirdPartyConsent()) {
//         setTimeout(() => {
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 300);
//       }
//     };

//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     return () => {
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
//     };
//   }, []);

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const checkUserInteraction = async (orderId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (!response.ok) {
//         console.error(`Failed to check interaction: ${response.status}`);
//         return false;
//       }
      
//       const data = await response.json();
//       return data.exists || data.created || data.hasEmail || false;
//     } catch (error) {
//       console.error('Error checking user interaction:', error);
//       return false;
//     }
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         await checkUserInteraction(orderId);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setIsRedirecting(true);
//     setPaymentStatus("Processing cancellation...");
    
//     try {
//       const checkResponse = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (checkResponse.ok) {
//         const checkData = await checkResponse.json();
        
//         if (checkData.hasEmail || checkData.exists) {
//           try {
//             await fetch(
//               `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//               {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//               }
//             );
//           } catch (updateError) {
//             console.error("Error updating order status:", updateError);
//           }
//         }
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
        
//       } else {
//         console.error("Failed to check interaction:", await checkResponse.text());
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
      
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, true);
//       }
      
//       if (data && data.orderID) {
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       } else {
//         setIsRedirecting(false);
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, false);
//         }
//       }
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show redirecting spinner
//   if (isRedirecting) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner message="Redirecting to complete payment..." />
//       </div>
//     );
//   }

//   // Show consent message if no consent
//   if (!hasConsent && !isLoading) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while setting up
//   if (isLoading) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Show PayPal buttons when ready
//   if (hasConsent && showPayPal) {
//     return (
//       <PayPalScriptProvider
//         options={{
//           'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
//           currency: 'EUR',
//         }}
//       >
//         <div className={styles.payPalContainer}>
//           {error && <div className={styles.errorMessage}>{error}</div>}

//           <div className={styles.paypalButtonContainer}>
//             <PayPalButtonsWrapper
//               createOrder={createOrder}
//               onApprove={onApprove}
//               onCancel={handleCancel}
//               onError={onError}
//               disabled={isProcessing}
//             />
//           </div>
//         </div>
//       </PayPalScriptProvider>
//     );
//   }

//   // Fallback
//   return (
//     <div className={styles.payPalContainer}>
//       <LoadingSpinner />
//     </div>
//   );
// }

// export default PayPalPayment;
















//Stable for 95%, but sometimes flickers
// import { useState, useEffect, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = ({ message = "Loading payment options..." }) => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>{message}</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
//   const [isRedirecting, setIsRedirecting] = useState(false);
  
//   // Much simpler state management
//   const [showPayPal, setShowPayPal] = useState(false);
//   const [hasConsent, setHasConsent] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const initRef = useRef(false);

//   // Setup initial state and handle consent changes
//   useEffect(() => {
//     const checkAndSetup = () => {
//       const currentConsent = hasThirdPartyConsent();
      
//       if (currentConsent) {
//         console.log('PayPal: Has consent, setting up...');
//         setHasConsent(true);
//         setIsLoading(true);
//         setShowPayPal(false);
        
//         // Load PayPal script
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         });
        
//         // Simple timeout to show buttons
//         setTimeout(() => {
//           console.log('PayPal: Showing buttons');
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 1500);
//       } else {
//         console.log('PayPal: No consent');
//         setHasConsent(false);
//         setShowPayPal(false);
//         setIsLoading(false);
//       }
//     };

//     // Only run initial check once
//     if (!initRef.current) {
//       initRef.current = true;
//       checkAndSetup();
//     }

//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent changed immediately!', event.detail);
      
//       if (event.detail && event.detail.consent === 'all') {
//         console.log('PayPal: Granting consent - showing loading...');
//         setHasConsent(true);
//         setIsLoading(true);
//         setShowPayPal(false);
        
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         });
        
//         setTimeout(() => {
//           console.log('PayPal: Consent granted - showing buttons');
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 1500);
        
//       } else if (event.detail && (event.detail.consent === 'essential' || event.detail.consent === 'none')) {
//         console.log('PayPal: Revoking consent - hiding buttons immediately');
//         setHasConsent(false);
//         setShowPayPal(false);
//         setIsLoading(false);
//       }
//     };

//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded event');
//       // Check current consent state when script loads
//       const currentConsent = hasThirdPartyConsent();
//       if (currentConsent) {
//         setTimeout(() => {
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 300);
//       }
//     };

//     // Always register event listeners (not just on first mount)
//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     return () => {
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
//     };
//   }, []); // Empty dependency array to prevent listener re-registration

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const checkUserInteraction = async (orderId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (!response.ok) {
//         console.error(`Failed to check interaction: ${response.status}`);
//         return false;
//       }
      
//       const data = await response.json();
//       return data.exists || data.created || data.hasEmail || false;
//     } catch (error) {
//       console.error('Error checking user interaction:', error);
//       return false;
//     }
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         await checkUserInteraction(orderId);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setIsRedirecting(true);
//     setPaymentStatus("Processing cancellation...");
    
//     try {
//       const checkResponse = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (checkResponse.ok) {
//         const checkData = await checkResponse.json();
        
//         if (checkData.hasEmail || checkData.exists) {
//           try {
//             await fetch(
//               `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//               {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//               }
//             );
//           } catch (updateError) {
//             console.error("Error updating order status:", updateError);
//           }
//         }
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
        
//       } else {
//         console.error("Failed to check interaction:", await checkResponse.text());
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
      
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, true);
//       }
      
//       if (data && data.orderID) {
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       } else {
//         setIsRedirecting(false);
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, false);
//         }
//       }
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show redirecting spinner
//   if (isRedirecting) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner message="Redirecting to complete payment..." />
//       </div>
//     );
//   }

//   // Show consent message if no consent
//   if (!hasConsent && !isLoading) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => {
//                 console.log('PayPal: Opening cookie settings...');
//                 window.dispatchEvent(new CustomEvent('openCookieSettings'));
//               }}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while setting up
//   if (isLoading) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Show PayPal buttons when ready
//   if (hasConsent && showPayPal) {
//     return (
//       <PayPalScriptProvider
//         options={{
//           'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
//           currency: 'EUR',
//         }}
//       >
//         <div className={styles.payPalContainer}>
//           {error && <div className={styles.errorMessage}>{error}</div>}

//           <div className={styles.paypalButtonContainer}>
//             <PayPalButtonsWrapper
//               createOrder={createOrder}
//               onApprove={onApprove}
//               onCancel={handleCancel}
//               onError={onError}
//               disabled={isProcessing}
//             />
//           </div>
//         </div>
//       </PayPalScriptProvider>
//     );
//   }

//   // Fallback
//   return (
//     <div className={styles.payPalContainer}>
//       <LoadingSpinner />
//     </div>
//   );
// }

// export default PayPalPayment;















//Stable 99% !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// import { useState, useEffect, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = ({ message = "Loading payment options..." }) => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>{message}</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
//   const [isRedirecting, setIsRedirecting] = useState(false);
  
//   // Much simpler state management
//   const [showPayPal, setShowPayPal] = useState(false);
//   const [hasConsent, setHasConsent] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const initRef = useRef(false);

//   // Setup initial state and handle consent changes
//   useEffect(() => {
//     const setupPayPal = () => {
//       const currentConsent = hasThirdPartyConsent();
      
//       if (currentConsent) {
//         console.log('PayPal: Has consent, setting up...');
//         setHasConsent(true);
//         setIsLoading(true);
//         setShowPayPal(false);
        
//         // Load PayPal script
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         }).catch(error => {
//           console.error('PayPal: Script import failed:', error);
//           // Still try to show buttons
//           setTimeout(() => {
//             setShowPayPal(true);
//             setIsLoading(false);
//           }, 1000);
//         });
        
//         // Primary timeout to show buttons
//         setTimeout(() => {
//           console.log('PayPal: Showing buttons');
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 1500);
        
//       } else {
//         console.log('PayPal: No consent');
//         setHasConsent(false);
//         setShowPayPal(false);
//         setIsLoading(false);
//       }
//     };

//     // Only run initial check once
//     if (!initRef.current) {
//       initRef.current = true;
//       setupPayPal();
//     }

//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent changed!', event.detail);
      
//       if (event.detail && event.detail.consent === 'all') {
//         console.log('PayPal: Granting consent - setting up...');
//         setHasConsent(true);
//         setIsLoading(true);
//         setShowPayPal(false);
        
//         import('../src/utils/consentUtils').then(module => {
//           module.loadPayPal();
//         }).catch(error => {
//           console.error('PayPal: Script import failed:', error);
//           setTimeout(() => {
//             setShowPayPal(true);
//             setIsLoading(false);
//           }, 1000);
//         });
        
//         setTimeout(() => {
//           console.log('PayPal: Consent granted - showing buttons');
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 1500);
        
//       } else if (event.detail && (event.detail.consent === 'essential' || event.detail.consent === 'none')) {
//         console.log('PayPal: Revoking consent - hiding buttons immediately');
//         setHasConsent(false);
//         setShowPayPal(false);
//         setIsLoading(false);
//       }
//     };

//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded event');
//       // Check current consent state when script loads
//       if (hasThirdPartyConsent()) {
//         setTimeout(() => {
//           console.log('PayPal: Script loaded - showing buttons');
//           setShowPayPal(true);
//           setIsLoading(false);
//         }, 300);
//       }
//     };

//     // Register event listeners
//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     return () => {
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
//     };
//   }, []); // Empty dependency array

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const checkUserInteraction = async (orderId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (!response.ok) {
//         console.error(`Failed to check interaction: ${response.status}`);
//         return false;
//       }
      
//       const data = await response.json();
//       return data.exists || data.created || data.hasEmail || false;
//     } catch (error) {
//       console.error('Error checking user interaction:', error);
//       return false;
//     }
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         await checkUserInteraction(orderId);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setIsRedirecting(true);
//     setPaymentStatus("Processing cancellation...");
    
//     try {
//       const checkResponse = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (checkResponse.ok) {
//         const checkData = await checkResponse.json();
        
//         if (checkData.hasEmail || checkData.exists) {
//           try {
//             await fetch(
//               `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//               {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//               }
//             );
//           } catch (updateError) {
//             console.error("Error updating order status:", updateError);
//           }
//         }
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
        
//       } else {
//         console.error("Failed to check interaction:", await checkResponse.text());
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
      
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, true);
//       }
      
//       if (data && data.orderID) {
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       } else {
//         setIsRedirecting(false);
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, false);
//         }
//       }
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show redirecting spinner
//   if (isRedirecting) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner message="Redirecting to complete payment..." />
//       </div>
//     );
//   }

//   // Show consent message if no consent
//   if (!hasConsent && !isLoading) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => {
//                 console.log('PayPal: Opening cookie settings...');
//                 window.dispatchEvent(new CustomEvent('openCookieSettings'));
//               }}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while setting up
//   if (isLoading) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Show PayPal buttons when ready
//   if (hasConsent && showPayPal) {
//     return (
//       <PayPalScriptProvider
//         options={{
//           'client-id': `${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
//           currency: 'EUR',
//         }}
//       >
//         <div className={styles.payPalContainer}>
//           {error && <div className={styles.errorMessage}>{error}</div>}

//           <div className={styles.paypalButtonContainer}>
//             <PayPalButtonsWrapper
//               createOrder={createOrder}
//               onApprove={onApprove}
//               onCancel={handleCancel}
//               onError={onError}
//               disabled={isProcessing}
//             />
//           </div>
//         </div>
//       </PayPalScriptProvider>
//     );
//   }

//   // Fallback
//   return (
//     <div className={styles.payPalContainer}>
//       <LoadingSpinner />
//     </div>
//   );
// }

// export default PayPalPayment;

















//Opus4.1 stable 95%
// import { useState, useEffect, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = ({ message = "Loading payment options..." }) => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>{message}</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
//   const [isRedirecting, setIsRedirecting] = useState(false);
  
//   // Simplified state management
//   const [hasConsent, setHasConsent] = useState(false);
//   const [isReady, setIsReady] = useState(false);
  
//   // Track if PayPal script is loaded
//   const scriptLoadedRef = useRef(false);
//   const setupTimeoutRef = useRef(null);

//   // Check and setup PayPal based on consent
//   useEffect(() => {
//     // Clear any existing timeout
//     if (setupTimeoutRef.current) {
//       clearTimeout(setupTimeoutRef.current);
//       setupTimeoutRef.current = null;
//     }

//     const checkConsent = () => {
//       const currentConsent = hasThirdPartyConsent();
//       console.log('PayPal: Checking consent:', currentConsent);
      
//       if (currentConsent) {
//         setHasConsent(true);
        
//         // Load PayPal script if needed
//         if (!scriptLoadedRef.current) {
//           console.log('PayPal: Loading script...');
//           import('../src/utils/consentUtils').then(module => {
//             module.loadPayPal();
//             scriptLoadedRef.current = true;
//           }).catch(error => {
//             console.error('PayPal: Script import failed:', error);
//           });
//         }
        
//         // Set ready state after a delay to ensure script loads
//         setupTimeoutRef.current = setTimeout(() => {
//           console.log('PayPal: Setting ready state');
//           setIsReady(true);
//         }, 1000);
        
//       } else {
//         console.log('PayPal: No consent - hiding buttons');
//         setHasConsent(false);
//         setIsReady(false);
//         scriptLoadedRef.current = false;
//       }
//     };

//     // Initial check
//     checkConsent();

//     // Listen for consent changes
//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent changed event:', event.detail);
      
//       // Small delay to ensure consent is properly saved
//       setTimeout(() => {
//         checkConsent();
//       }, 100);
//     };

//     // Listen for PayPal script loaded
//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded event received');
//       if (hasThirdPartyConsent()) {
//         setIsReady(true);
//       }
//     };

//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     return () => {
//       if (setupTimeoutRef.current) {
//         clearTimeout(setupTimeoutRef.current);
//       }
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
//     };
//   }, []); // Empty dependency array - setup only once

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const checkUserInteraction = async (orderId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (!response.ok) {
//         console.error(`Failed to check interaction: ${response.status}`);
//         return false;
//       }
      
//       const data = await response.json();
//       return data.exists || data.created || data.hasEmail || false;
//     } catch (error) {
//       console.error('Error checking user interaction:', error);
//       return false;
//     }
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         await checkUserInteraction(orderId);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setIsRedirecting(true);
//     setPaymentStatus("Processing cancellation...");
    
//     try {
//       const checkResponse = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (checkResponse.ok) {
//         const checkData = await checkResponse.json();
        
//         if (checkData.hasEmail || checkData.exists) {
//           try {
//             await fetch(
//               `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//               {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//               }
//             );
//           } catch (updateError) {
//             console.error("Error updating order status:", updateError);
//           }
//         }
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
        
//       } else {
//         console.error("Failed to check interaction:", await checkResponse.text());
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
      
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, true);
//       }
      
//       if (data && data.orderID) {
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       } else {
//         setIsRedirecting(false);
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, false);
//         }
//       }
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show redirecting spinner
//   if (isRedirecting) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner message="Redirecting to complete payment..." />
//       </div>
//     );
//   }

//   // Show consent message if no consent
//   if (!hasConsent) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => {
//                 console.log('PayPal: Opening cookie settings...');
//                 window.dispatchEvent(new CustomEvent('openCookieSettings'));
//               }}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while waiting for PayPal to be ready
//   if (!isReady) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Show PayPal buttons when ready
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
//   );
// }

// export default PayPalPayment;










//Opus4.1-v2 stable 95%
// import { useState, useEffect, useRef } from 'react';
// import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
// import styles from './PayPalPayment.module.css';
// import { hasThirdPartyConsent } from '../src/utils/consentUtils';

// const LoadingSpinner = ({ message = "Loading payment options..." }) => (
//   <div className={styles.spinnerContainer}>
//     <div className={styles.spinner}></div>
//     <p>{message}</p>
//   </div>
// );

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
//           style={{
//             layout: 'vertical',
//             color: 'gold',
//             shape: 'rect',
//           }}
//         />
//       )}
//     </>
//   );
// };

// const getApiUrl = () => {
//   const baseUrl =
//     import.meta.env.VITE_NODE_ENV === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   return baseUrl;
// };

// function PayPalPayment({ 
//   cart = [], 
//   measurements, 
//   deliveryDetails,
//   onSuccess, 
//   onCancel, 
//   onOrderCreated, 
//   existingOrderId = null,
//   clearOrderId
// }) {
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [orderId, setOrderId] = useState(existingOrderId);
//   const [isRedirecting, setIsRedirecting] = useState(false);
  
//   // Simplified state management
//   const [hasConsent, setHasConsent] = useState(() => hasThirdPartyConsent());
//   const [isReady, setIsReady] = useState(false);
  
//   // Track if PayPal script is loaded
//   const scriptLoadedRef = useRef(false);
//   const setupTimeoutRef = useRef(null);
//   const prevConsentRef = useRef(hasThirdPartyConsent());

//   // Store previous consent state to detect actual changes
//   // const prevConsentRef = useRef(hasThirdPartyConsent());

//   // Check and setup PayPal based on consent
//   useEffect(() => {
//     // Clear any existing timeout
//     if (setupTimeoutRef.current) {
//       clearTimeout(setupTimeoutRef.current);
//       setupTimeoutRef.current = null;
//     }

//     const checkConsent = (isInitial = false) => {
//       const currentConsent = hasThirdPartyConsent();
//       const prevConsent = prevConsentRef.current;
      
//       console.log('PayPal: Checking consent:', { current: currentConsent, previous: prevConsent, isInitial });
      
//       // Only update if consent actually changed or it's the initial check
//       if (currentConsent !== prevConsent || isInitial) {
//         prevConsentRef.current = currentConsent;
        
//         if (currentConsent) {
//           setHasConsent(true);
          
//           // Load PayPal script if needed
//           if (!scriptLoadedRef.current) {
//             console.log('PayPal: Loading script...');
//             import('../src/utils/consentUtils').then(module => {
//               module.loadPayPal();
//               scriptLoadedRef.current = true;
//             }).catch(error => {
//               console.error('PayPal: Script import failed:', error);
//             });
//           }
          
//           // Only reset ready state if consent was previously false or it's initial
//           if (!prevConsent || isInitial) {
//             setupTimeoutRef.current = setTimeout(() => {
//               console.log('PayPal: Setting ready state');
//               setIsReady(true);
//             }, 1000);
//           } else {
//             // Consent was already true, keep ready state
//             setIsReady(true);
//           }
          
//         } else {
//           console.log('PayPal: No consent - hiding buttons');
//           setHasConsent(false);
//           setIsReady(false);
//           scriptLoadedRef.current = false;
//         }
//       } else {
//         console.log('PayPal: Consent unchanged, keeping current state');
//         // If consent hasn't changed and we already have consent, ensure we're ready
//         if (currentConsent && hasConsent) {
//           setIsReady(true);
//         }
//       }
//     };

//     // Initial check
//     checkConsent(true);

//     // Listen for consent changes
//     const handleConsentChange = (event) => {
//       console.log('PayPal: Consent changed event:', event.detail);
      
//       // Small delay to ensure consent is properly saved
//       setTimeout(() => {
//         checkConsent(false);
//       }, 100);
//     };

//     // Listen for PayPal script loaded
//     const handlePayPalLoaded = () => {
//       console.log('PayPal: Script loaded event received');
//       if (hasThirdPartyConsent()) {
//         setIsReady(true);
//       }
//     };

//     window.addEventListener('consentChanged', handleConsentChange);
//     window.addEventListener('paypalLoaded', handlePayPalLoaded);
    
//     return () => {
//       if (setupTimeoutRef.current) {
//         clearTimeout(setupTimeoutRef.current);
//       }
//       window.removeEventListener('consentChanged', handleConsentChange);
//       window.removeEventListener('paypalLoaded', handlePayPalLoaded);
//     };
//   }, []); // Empty dependency array - setup only once

//   // Handle existing order ID
//   useEffect(() => {
//     if (existingOrderId && existingOrderId !== orderId) {
//       setOrderId(existingOrderId);
//     }
//   }, [existingOrderId, orderId]);

//   const formatCartItems = (cartItems) => {
//     return cartItems.map(item => ({
//       id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//       name: item.name,
//       price: Number(item.price),
//       quantity: Number(item.quantity),
//       description: item.description || `${item.name} product`,
//       image: item.image,
//       color: item.color || ''
//     }));
//   };

//   const checkUserInteraction = async (orderId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${orderId}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (!response.ok) {
//         console.error(`Failed to check interaction: ${response.status}`);
//         return false;
//       }
      
//       const data = await response.json();
//       return data.exists || data.created || data.hasEmail || false;
//     } catch (error) {
//       console.error('Error checking user interaction:', error);
//       return false;
//     }
//   };

//   const createOrder = async () => {
//     setIsProcessing(true);
//     setError(null);
    
//     try {
//       if (orderId) {
//         setPaymentStatus(`Using existing order: ${orderId}`);
//         await checkUserInteraction(orderId);
//         return orderId;
//       }

//       setPaymentStatus('Creating order...');

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
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create order");
//       }

//       const data = await res.json();

//       if (!data.id) {
//         throw new Error('No order ID returned from backend');
//       }

//       setOrderId(data.id);
      
//       if (onOrderCreated && typeof onOrderCreated === 'function') {
//         onOrderCreated(data.id);
//       }

//       setPaymentStatus("Order created successfully");
//       return data.id;

//     } catch (error) {
//       console.error('Error creating order:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Error creating order');
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onApprove = async (data) => {
//     setIsProcessing(true);
//     setPaymentStatus('Processing payment...');

//     try {
//       const response = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/capture`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to capture payment');
//       }

//       const orderData = await response.json();
//       const paymentStatus = orderData.status;

//       if (paymentStatus === 'COMPLETED') {
//         setPaymentStatus('Payment successful!');
        
//         if (clearOrderId && typeof clearOrderId === 'function') {
//           clearOrderId();
//         }
        
//         if (onSuccess && typeof onSuccess === 'function') {
//           onSuccess(orderData);
//         }
//       } else {
//         setPaymentStatus(`Payment ${paymentStatus.toLowerCase()}`);
//       }

//       return orderData;

//     } catch (error) {
//       console.error('Error capturing payment:', error);
//       setError(error.message || 'Payment failed');
//       setPaymentStatus('Payment failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCancel = async (data) => {
//     setIsRedirecting(true);
//     setPaymentStatus("Processing cancellation...");
    
//     try {
//       const checkResponse = await fetch(
//         `${getApiUrl()}/api/payments/${data.orderID}/check-interaction`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
      
//       if (checkResponse.ok) {
//         const checkData = await checkResponse.json();
        
//         if (checkData.hasEmail || checkData.exists) {
//           try {
//             await fetch(
//               `${getApiUrl()}/api/payments/${data.orderID}/update-canceled`,
//               {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'PAYER_ACTION_REQUIRED' })
//               }
//             );
//           } catch (updateError) {
//             console.error("Error updating order status:", updateError);
//           }
//         }
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
        
//       } else {
//         console.error("Failed to check interaction:", await checkResponse.text());
        
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, true);
//         }
        
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       }
//     } catch (error) {
//       console.error("Error in handleCancel:", error);
      
//       if (onCancel && typeof onCancel === 'function') {
//         onCancel(data, true);
//       }
      
//       if (data && data.orderID) {
//         setTimeout(() => {
//           window.location.href = `/order-status/${data.orderID}`;
//         }, 500);
//       } else {
//         setIsRedirecting(false);
//         if (onCancel && typeof onCancel === 'function') {
//           onCancel(data, false);
//         }
//       }
//     }
//   };

//   const onError = (error) => {
//     console.error('PayPal error:', error);
//     setError('An error occurred with PayPal');
//     setPaymentStatus('Payment error');
//   };

//   // Data validation
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
//       </div>
//     );
//   }

//   // Show redirecting spinner
//   if (isRedirecting) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner message="Redirecting to complete payment..." />
//       </div>
//     );
//   }

//   // Show consent message if no consent
//   if (!hasConsent) {
//     return (
//       <div className={styles.payPalContainer}>
//         <div className={styles.consentMessage}>
//           <h3>Cookie Consent Required for Payment</h3>
//           <p>
//             To process payments with PayPal, you need to accept cookies. 
//             PayPal requires cookies to function properly and ensure secure transactions.
//           </p>
//           <p>
//             Please accept cookies by clicking &quot;Accept All&quot; in the 
//             <button 
//               onClick={() => {
//                 console.log('PayPal: Opening cookie settings...');
//                 window.dispatchEvent(new CustomEvent('openCookieSettings'));
//               }}
//               className={styles.cookieSettingsLink}
//             >
//               cookie settings
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while waiting for PayPal to be ready
//   if (!isReady) {
//     return (
//       <div className={styles.payPalContainer}>
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Show PayPal buttons when ready
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
//   );
// }

// export default PayPalPayment;













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
  
  // Simplified state management
  const [hasConsent, setHasConsent] = useState(false);
  const [isPayPalReady, setIsPayPalReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Track if PayPal script has been loaded
  const scriptLoadedRef = useRef(false);
  const initTimeoutRef = useRef(null);

  // Initialize and handle consent
  useEffect(() => {
    const initializePayPal = async () => {
      const currentConsent = hasThirdPartyConsent();
      setHasConsent(currentConsent);
      
      if (currentConsent) {
        console.log('PayPal: Has consent, loading script...');
        setIsInitializing(true);
        
        try {
          // Load PayPal script
          const module = await import('../src/utils/consentUtils');
          module.loadPayPal();
          
          // Wait a bit for script to initialize
          initTimeoutRef.current = setTimeout(() => {
            if (hasThirdPartyConsent()) { // Double-check consent is still granted
              setIsPayPalReady(true);
              scriptLoadedRef.current = true;
            }
            setIsInitializing(false);
          }, 1000);
        } catch (error) {
          console.error('PayPal: Failed to load script:', error);
          setIsInitializing(false);
        }
      } else {
        console.log('PayPal: No consent');
        setIsPayPalReady(false);
        setIsInitializing(false);
      }
    };

    initializePayPal();

    // Cleanup
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Handle consent changes
  useEffect(() => {
    const handleConsentChange = async (event) => {
      console.log('PayPal: Consent changed', event.detail);
      
      // Clear any pending timeouts
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      const newConsent = event.detail && 
        (event.detail.consent === 'all' || 
         (event.detail.cookies === 'all'));
      
      setHasConsent(newConsent);
      
      if (newConsent) {
        // User granted consent
        if (!scriptLoadedRef.current) {
          // Script not loaded yet, load it
          setIsInitializing(true);
          
          try {
            const module = await import('../src/utils/consentUtils');
            module.loadPayPal();
            
            // Give PayPal time to load
            initTimeoutRef.current = setTimeout(() => {
              setIsPayPalReady(true);
              scriptLoadedRef.current = true;
              setIsInitializing(false);
            }, 1500);
          } catch (error) {
            console.error('PayPal: Failed to load script:', error);
            setIsInitializing(false);
          }
        } else {
          // Script already loaded, just show buttons
          setIsPayPalReady(true);
        }
      } else {
        // User revoked consent
        setIsPayPalReady(false);
        // Don't reset scriptLoadedRef as the script remains in memory
      }
    };

    const handlePayPalLoaded = () => {
      console.log('PayPal: Script loaded event received');
      if (hasThirdPartyConsent()) {
        scriptLoadedRef.current = true;
        setIsPayPalReady(true);
        setIsInitializing(false);
      }
    };

    // Handle storage consent changes specifically
    const handleStorageConsentChange = (event) => {
      // This handles the case when user changes settings in the modal
      const currentConsent = hasThirdPartyConsent();
      setHasConsent(currentConsent);
      
      if (currentConsent && scriptLoadedRef.current) {
        // If we have consent and script is loaded, show buttons
        setIsPayPalReady(true);
      } else if (!currentConsent) {
        // No consent, hide buttons
        setIsPayPalReady(false);
      }
    };

    window.addEventListener('consentChanged', handleConsentChange);
    window.addEventListener('paypalLoaded', handlePayPalLoaded);
    window.addEventListener('storageConsentChanged', handleStorageConsentChange);
    
    return () => {
      window.removeEventListener('consentChanged', handleConsentChange);
      window.removeEventListener('paypalLoaded', handlePayPalLoaded);
      window.removeEventListener('storageConsentChanged', handleStorageConsentChange);
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

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

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className={styles.payPalContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  // Show consent message if no consent
  if (!hasConsent) {
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

  // Show PayPal buttons when ready
  if (hasConsent && isPayPalReady) {
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

  // Fallback - should not reach here normally
  return (
    <div className={styles.payPalContainer}>
      <LoadingSpinner />
    </div>
  );
}

export default PayPalPayment;
