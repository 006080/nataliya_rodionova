// import { useState } from 'react'
// import { useCart } from '../../components/CartContext'
// import MeasureForm from '../../components/MeasureForm'
// import DeliveryForm from '../../components/DeliveryForm'
// import styles from './Checkout.module.css'
// import PayPalPayment from '../../components/PayPalPayment'
// import { getCountryName } from '../utils/countries'


// const Checkout = () => {
//   const { cartItems, removeFromCart } = useCart()
//   const [orderComplete, setOrderComplete] = useState(false)
//   const [orderData, setOrderData] = useState(null)
//   const [paymentCancelled, setPaymentCancelled] = useState(false)

//   // Form state
//   const [measurements, setMeasurements] = useState(null)
//   const [deliveryDetails, setDeliveryDetails] = useState(null)
//   const [formStep, setFormStep] = useState(1)

//   const totalPrice =
//     cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) ||
//     0

//   const handleMeasureFormSubmit = (measureData) => {
//     setMeasurements(measureData)
//     setFormStep(2) // Move to delivery form
//   }

//   const handleDeliveryFormSubmit = (deliveryData) => {
//     setDeliveryDetails(deliveryData)
//     setFormStep(3) // Move to payment
//   }

//   const handlePaymentSuccess = (data) => {
//     setOrderComplete(true)
//     setOrderData(data)
//     removeFromCart()
//   }

//   const handlePaymentCancel = () => {
//     setPaymentCancelled(true)

//     setTimeout(() => {
//       setPaymentCancelled(false)
//     }, 10000)
//   }

//   const formattedCartItems = cartItems.map((item) => ({
//     id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//     name: item.name,
//     price: Number(item.price),
//     quantity: Number(item.quantity),
//     description: item.description || `${item.name} product`,
//     image: item.image,
//   }))

//   // Order confirmation screen
//   if (orderComplete) {
//     return (
//       <div className={styles.cartContainer}>
//         <h1>Order Confirmed!</h1>
//         <p>Thank you for your purchase.</p>
//         <div className={styles.orderDetails}>
//           <h2>Order Details</h2>
//           <p>Order ID: {orderData.id}</p>
//           <p>Status: {orderData.status}</p>
//           <h3>Items:</h3>
//           <ul>
//             {cartItems.map((item) => (
//               <li key={item.id}>
//                 {item.name} x {item.quantity} - €
//                 {(item.price * item.quantity).toFixed(2)}
//               </li>
//             ))}
//           </ul>
//           <p className={styles.total}>
//             <strong>Total: €{totalPrice.toFixed(2)}</strong>
//           </p>
//         </div>
//         <button onClick={() => (window.location.href = '/shop')}>
//           Continue Shopping
//         </button>
//       </div>
//     )
//   }

//   // Cart is empty
//   if (!cartItems?.length) {
//     return (
//       <div className={styles.checkoutContainer}>
//         <h2>Checkout</h2>
//         <p>Your cart is empty</p>
//         <button onClick={() => (window.location.href = '/shop')}>
//           Go to Shop
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className={styles.checkoutContainer}>
//       <h2>Checkout</h2>

//       <div className={styles.orderSummary}>
//         {cartItems.map((item) => (
//           <div key={item.id || item.name} className={styles.cartItem}>
//             <img
//               src={item.image}
//               alt={item.name}
//               className={styles.productImage}
//             />
//             <div style={{ width: '150px' }}>
//               <p>
//                 <strong>{item.name}</strong>
//               </p>
//               <div
//                 style={{
//                   lineHeight: '1',
//                   fontSize: 'medium',
//                   fontStyle: 'italic',
//                 }}
//               >
//                 <p>Quantity: {item.quantity}</p>
//                 <p>Price: €{item.price.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//         <h3 className={styles.sum}>Total Price: €{totalPrice.toFixed(2)}</h3>
//       </div>

//       {/* Step 1: Measurements Form */}
//       {formStep === 1 && <MeasureForm onSubmit={handleMeasureFormSubmit} />}

//       {/* Step 2: Delivery Form */}
//       {formStep === 2 && (
//         <DeliveryForm onFormSubmit={handleDeliveryFormSubmit} />
//       )}

//       {/* Step 3: Payment */}
//       {formStep === 3 && (
//         <div className={styles.paypalContainer}>
//           <div className={styles.checkoutSteps}>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>1</span>
//               <span className={styles.stepLabel}>Measurements</span>
//               <span className={styles.stepStatus}>✓</span>
//             </div>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>2</span>
//               <span className={styles.stepLabel}>Delivery</span>
//               <span className={styles.stepStatus}>✓</span>
//             </div>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>3</span>
//               <span className={styles.stepLabel}>Payment</span>
//               <span className={styles.stepStatus}>In Progress</span>
//             </div>
//           </div>

//           <h3>Complete Your Purchase</h3>
//           <p>Please review your information before proceeding with payment.</p>

//           <div className={styles.reviewSection}>
//             <div className={styles.reviewBlock}>
//               <h4>Measurements</h4>
//               <p>Height: {measurements.height} cm</p>
//               <p>Chest: {measurements.chest} cm</p>
//               <p>Waist: {measurements.waist} cm</p>
//               <p>Hips: {measurements.hips} cm</p>
//               <button
//                 className={styles.editButton}
//                 onClick={() => setFormStep(1)}
//               >
//                 Edit
//               </button>
//             </div>

//             <div className={styles.reviewBlock}>
//               <h4>Delivery Information</h4>
//               <p>{deliveryDetails.fullName}</p>
//               <p>{deliveryDetails.address}</p>
//               <p>
//                 {deliveryDetails.city}, {deliveryDetails.postalCode}
//               </p>
//               <p>{getCountryName[deliveryDetails.country] || deliveryDetails.country}</p>
//               <p>Email: {deliveryDetails.email}</p>
//               <p>Phone: {deliveryDetails.phone}</p>
//               <button
//                 className={styles.editButton}
//                 onClick={() => setFormStep(2)}
//               >
//                 Edit
//               </button>
//             </div>
//           </div>

//             {/* Payment Cancelled Message */}
//             {paymentCancelled && (
//               <div className={styles.cancelMessage}>
//                 <span
//                   className={styles.closeIcon}
//                   onClick={() => setPaymentCancelled(false)}
//                 >
//                   ✕
//                 </span>
//                 <h3>Payment Cancelled</h3>
//                 <p>
//                   Your payment was cancelled. No worries, your items are still
//                   in your cart, and you can try again whenever you&apos;re
//                   ready.
//                 </p>
//                 <button onClick={() => setPaymentCancelled(false)}>
//                   Try Again
//                 </button>
//               </div>
//             )}

//           <PayPalPayment
//             cart={formattedCartItems}
//             measurements={measurements}
//             deliveryDetails={deliveryDetails}
//             onSuccess={handlePaymentSuccess}
//             onCancel={handlePaymentCancel}
//           />
//         </div>
//       )}
//     </div>
//   )
// }

// export default Checkout



// Add this function to the Checkout component to check for existing orders
// It will check if there's a pending order that is now canceled or completed

import { useState, useEffect } from 'react'
import { useCart } from '../../components/CartContext'
import MeasureForm from '../../components/MeasureForm'
import DeliveryForm from '../../components/DeliveryForm'
import styles from './Checkout.module.css'
import PayPalPayment from '../../components/PayPalPayment'
import { getCountryName } from '../utils/countries'

const Checkout = () => {
  const { cartItems, removeFromCart } = useCart()
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [paymentCancelled, setPaymentCancelled] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null) // Add this state

  // Form state
  const [measurements, setMeasurements] = useState(null)
  const [deliveryDetails, setDeliveryDetails] = useState(null)
  const [formStep, setFormStep] = useState(1)

  // Get any existing order status from local storage
  useEffect(() => {
    const pendingOrderId = localStorage.getItem('pendingOrderId')
    
    if (pendingOrderId && formStep === 3) {
      // If we have a pending order and we're on the payment step,
      // check the order status to see if it's been canceled or completed
      const checkOrderStatus = async () => {
        try {
          const apiUrl = import.meta.env.VITE_NODE_ENV === 'production'
            ? import.meta.env.VITE_API_BASE_URL_PROD
            : import.meta.env.VITE_API_BASE_URL_LOCAL
            
          const response = await fetch(`${apiUrl}/api/payments/${pendingOrderId}`)
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.status === 'CANCELED' || data.status === 'VOIDED') {
              // Order was canceled - show message and allow them to create a new order
              setOrderStatus({
                type: 'canceled',
                message: 'Your previous order was canceled. Please start a new order.',
                data
              })
            } else if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
              // Order was completed - show success message
              setOrderStatus({
                type: 'completed',
                message: 'Your order has been successfully completed!',
                data
              })
              setOrderComplete(true)
              setOrderData(data)
              removeFromCart()
            }
          }
        } catch (error) {
          console.error('Error checking order status:', error)
        }
      }
      
      checkOrderStatus()
    }
  }, [formStep, removeFromCart])

  const totalPrice =
    cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) ||
    0

  const handleMeasureFormSubmit = (measureData) => {
    setMeasurements(measureData)
    setFormStep(2) // Move to delivery form
  }

  const handleDeliveryFormSubmit = (deliveryData) => {
    setDeliveryDetails(deliveryData)
    setFormStep(3) // Move to payment
  }

  const handlePaymentSuccess = (data) => {
    // Store the successful order ID
    localStorage.removeItem('pendingOrderId')
    
    setOrderComplete(true)
    setOrderData(data)
    removeFromCart()
  }

  const handlePaymentCancel = () => {
    setPaymentCancelled(true)

    setTimeout(() => {
      setPaymentCancelled(false)
    }, 10000)
  }

  // Store order ID when starting payment
  const handleStartPayment = (orderId) => {
    if (orderId) {
      localStorage.setItem('pendingOrderId', orderId)
    }
  }

  const formattedCartItems = cartItems.map((item) => ({
    id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    description: item.description || `${item.name} product`,
    image: item.image,
  }))

  // Order confirmation screen
  if (orderComplete) {
    return (
      <div className={styles.cartContainer}>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase.</p>
        <div className={styles.orderDetails}>
          <h2>Order Details</h2>
          <p>Order ID: {orderData.id}</p>
          <p>Status: {orderData.status}</p>
          <h3>Items:</h3>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity} - €
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className={styles.total}>
            <strong>Total: €{totalPrice.toFixed(2)}</strong>
          </p>
        </div>
        <button onClick={() => (window.location.href = '/shop')}>
          Continue Shopping
        </button>
      </div>
    )
  }

  // Cart is empty
  if (!cartItems?.length) {
    return (
      <div className={styles.checkoutContainer}>
        <h2>Checkout</h2>
        <p>Your cart is empty</p>
        <button onClick={() => (window.location.href = '/shop')}>
          Go to Shop
        </button>
      </div>
    )
  }

  return (
    <div className={styles.checkoutContainer}>
      <h2>Checkout</h2>

      <div className={styles.orderSummary}>
        {cartItems.map((item) => (
          <div key={item.id || item.name} className={styles.cartItem}>
            <img
              src={item.image}
              alt={item.name}
              className={styles.productImage}
            />
            <div style={{ width: '150px' }}>
              <p>
                <strong>{item.name}</strong>
              </p>
              <div
                style={{
                  lineHeight: '1',
                  fontSize: 'medium',
                  fontStyle: 'italic',
                }}
              >
                <p>Quantity: {item.quantity}</p>
                <p>Price: €{item.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
        <h3 className={styles.sum}>Total Price: €{totalPrice.toFixed(2)}</h3>
      </div>

      {/* Order Status Messages */}
      {orderStatus && orderStatus.type === 'canceled' && (
        <div className={styles.cancelMessage || styles.errorMessage}>
          <h3>Order Canceled</h3>
          <p>{orderStatus.message}</p>
          <p>Previous Order ID: {orderStatus.data.id}</p>
          <button 
            onClick={() => {
              localStorage.removeItem('pendingOrderId')
              setOrderStatus(null)
              setFormStep(1) // Start over
            }}
          >
            Start New Order
          </button>
        </div>
      )}

      {/* Step 1: Measurements Form */}
      {formStep === 1 && !orderStatus && <MeasureForm onSubmit={handleMeasureFormSubmit} />}

      {/* Step 2: Delivery Form */}
      {formStep === 2 && !orderStatus && (
        <DeliveryForm onFormSubmit={handleDeliveryFormSubmit} />
      )}

      {/* Step 3: Payment */}
      {formStep === 3 && !orderStatus && (
        <div className={styles.paypalContainer}>
          <div className={styles.checkoutSteps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Measurements</span>
              <span className={styles.stepStatus}>✓</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Delivery</span>
              <span className={styles.stepStatus}>✓</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Payment</span>
              <span className={styles.stepStatus}>In Progress</span>
            </div>
          </div>

          <h3>Complete Your Purchase</h3>
          <p>Please review your information before proceeding with payment.</p>

          <div className={styles.reviewSection}>
            <div className={styles.reviewBlock}>
              <h4>Measurements</h4>
              <p>Height: {measurements.height} cm</p>
              <p>Chest: {measurements.chest} cm</p>
              <p>Waist: {measurements.waist} cm</p>
              <p>Hips: {measurements.hips} cm</p>
              <button
                className={styles.editButton}
                onClick={() => setFormStep(1)}
              >
                Edit
              </button>
            </div>

            <div className={styles.reviewBlock}>
              <h4>Delivery Information</h4>
              <p>{deliveryDetails.fullName}</p>
              <p>{deliveryDetails.address}</p>
              <p>
                {deliveryDetails.city}, {deliveryDetails.postalCode}
              </p>
              <p>{getCountryName[deliveryDetails.country] || deliveryDetails.country}</p>
              <p>Email: {deliveryDetails.email}</p>
              <p>Phone: {deliveryDetails.phone}</p>
              <button
                className={styles.editButton}
                onClick={() => setFormStep(2)}
              >
                Edit
              </button>
            </div>
          </div>

            {/* Payment Cancelled Message */}
            {paymentCancelled && (
              <div className={styles.cancelMessage}>
                <span
                  className={styles.closeIcon}
                  onClick={() => setPaymentCancelled(false)}
                >
                  ✕
                </span>
                <h3>Payment Cancelled</h3>
                <p>
                  Your payment was cancelled. No worries, your items are still
                  in your cart, and you can try again whenever you&apos;re
                  ready.
                </p>
                <button onClick={() => setPaymentCancelled(false)}>
                  Try Again
                </button>
              </div>
            )}

          <PayPalPayment
            cart={formattedCartItems}
            measurements={measurements}
            deliveryDetails={deliveryDetails}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            onOrderCreated={handleStartPayment} // New prop to track order ID
          />
        </div>
      )}
    </div>
  )
}

export default Checkout




// import { useState, useEffect } from 'react'
// import { useCart } from '../../components/CartContext'
// import MeasureForm from '../../components/MeasureForm'
// import DeliveryForm from '../../components/DeliveryForm'
// import styles from './Checkout.module.css'
// import PayPalPayment from '../../components/PayPalPayment'
// import { getCountryName } from '../utils/countries'

// const Checkout = () => {
//   const { 
//     cartItems, 
//     removeFromCart, 
//     pendingOrderId, 
//     setPendingOrder, 
//     clearPendingOrder 
//   } = useCart()
  
//   const [orderComplete, setOrderComplete] = useState(false)
//   const [orderData, setOrderData] = useState(null)
//   const [paymentCancelled, setPaymentCancelled] = useState(false)
//   const [orderStatus, setOrderStatus] = useState(null)

//   // Form state
//   const [measurements, setMeasurements] = useState(() => {
//     // Initialize from localStorage if available
//     try {
//       const savedMeasurements = localStorage.getItem('measurements');
//       return savedMeasurements ? JSON.parse(savedMeasurements) : null;
//     } catch (error) {
//       console.error('Error loading measurements from localStorage:', error);
//       return null;
//     }
//   });
  
//   const [deliveryDetails, setDeliveryDetails] = useState(() => {
//     // Initialize from localStorage if available
//     try {
//       const savedDeliveryDetails = localStorage.getItem('deliveryDetails');
//       return savedDeliveryDetails ? JSON.parse(savedDeliveryDetails) : null;
//     } catch (error) {
//       console.error('Error loading delivery details from localStorage:', error);
//       return null;
//     }
//   });
  
//   const [formStep, setFormStep] = useState(() => {
//     // Determine initial form step based on saved data
//     if (measurements && deliveryDetails) return 3; // Payment step
//     if (measurements) return 2; // Delivery form
//     return 1; // Measurement form
//   });

//   // Get any existing order status
// // Get any existing order status
// useEffect(() => {
//   if (pendingOrderId && formStep === 3) {
//     // If we have a pending order and we're on the payment step,
//     // check the order status to see if it's been canceled or completed
//     const checkOrderStatus = async () => {
//       try {
//         const apiUrl = import.meta.env.VITE_NODE_ENV === 'production'
//           ? import.meta.env.VITE_API_BASE_URL_PROD
//           : import.meta.env.VITE_API_BASE_URL_LOCAL
          
//         const response = await fetch(`${apiUrl}/api/payments/${pendingOrderId}`)
        
//         if (response.ok) {
//           const data = await response.json()
          
//           if (data.status === 'CANCELED' || data.status === 'VOIDED') {
//             // Order was canceled - show message and allow them to create a new order
//             setOrderStatus({
//               type: 'canceled',
//               message: 'Your previous order was canceled. Please start a new order.',
//               data
//             })
//           } else if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
//             // Order was completed - show success message
//             setOrderStatus({
//               type: 'completed',
//               message: 'Your order has been successfully completed!',
//               data
//             })
//             setOrderComplete(true)
//             setOrderData(data)
//             removeFromCart() // Clear cart
//             clearPendingOrder(true) // Clear pending order and cart
//           }
//         }
//       } catch (error) {
//         console.error('Error checking order status:', error)
//       }
//     }
    
//     checkOrderStatus()
//   }
// }, [formStep, pendingOrderId, removeFromCart, clearPendingOrder])

//   // Save measurements to localStorage when they change
//   useEffect(() => {
//     if (measurements) {
//       localStorage.setItem('measurements', JSON.stringify(measurements));
//     }
//   }, [measurements]);

//   // Save deliveryDetails to localStorage when they change
//   useEffect(() => {
//     if (deliveryDetails) {
//       localStorage.setItem('deliveryDetails', JSON.stringify(deliveryDetails));
//     }
//   }, [deliveryDetails]);

//   const totalPrice =
//     cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) ||
//     0

//   const handleMeasureFormSubmit = (measureData) => {
//     setMeasurements(measureData)
//     setFormStep(2) // Move to delivery form
//   }

//   const handleDeliveryFormSubmit = (deliveryData) => {
//     setDeliveryDetails(deliveryData)
//     setFormStep(3) // Move to payment
//   }

//   // const handlePaymentSuccess = (data) => {
//   //   // Clear pending order and set order complete
//   //   clearPendingOrder(true) // Clear pending order and cart
    
//   //   setOrderComplete(true)
//   //   setOrderData(data)
//   // }

//   // const handlePaymentCancel = () => {
//   //   setPaymentCancelled(true)

//   //   setTimeout(() => {
//   //     setPaymentCancelled(false)
//   //   }, 10000)
//   // }

//   // //Store order ID when starting payment
//   // const handleStartPayment = (orderId) => {
//   //   if (orderId) {
//   //     setPendingOrder(orderId)
//   //   }
//   // }

//   const handleStartPayment = (orderId) => {
//     if (orderId) {
//       console.log(`Starting payment process with orderId: ${orderId}`);
      
//       // If there's a different pendingOrderId already, clear it first
//       if (pendingOrderId && pendingOrderId !== orderId) {
//         console.log(`Existing pendingOrderId ${pendingOrderId} will be replaced`);
//       }
      
//       // Set the new pending order - this will replace any existing one
//       setPendingOrder(orderId);
//     }
//   };
  
//   // Handle successful payment completion
//   const handlePaymentSuccess = (data) => {
//     console.log("Payment successful. Order data:", data);
    
//     // Set order complete first (important for state tracking)
//     setOrderComplete(true);
//     setOrderData(data);
    
//     // Then clear pending order and cart
//     // This should clear: pendingOrderId, cartItems, measurements, deliveryDetails
//     clearPendingOrder(true);
//   };
  
//   // Handle payment cancellation
//   const handlePaymentCancel = () => {
//     console.log("Payment cancelled by user");
//     setPaymentCancelled(true);
  
//     // Don't clear the pending order ID yet, as the user might want to try again
//     setTimeout(() => {
//       setPaymentCancelled(false);
//     }, 10000);
//   };
  
//   // Add a new function to completely reset the checkout process
//   const resetCheckout = () => {
//     console.log("Resetting checkout process");
    
//     // Clear all checkout data
//     setMeasurements(null);
//     setDeliveryDetails(null);
//     clearPendingOrder(true);
    
//     // Reset form step
//     setFormStep(1);
    
//     // Clear localStorage
//     localStorage.removeItem('measurements');
//     localStorage.removeItem('deliveryDetails');
//     localStorage.removeItem('pendingOrderId');
//     localStorage.removeItem('cartItems');
//   };






//   const formattedCartItems = cartItems.map((item) => ({
//     id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
//     name: item.name,
//     price: Number(item.price),
//     quantity: Number(item.quantity),
//     description: item.description || `${item.name} product`,
//     image: item.image,
//   }))
//   // Order confirmation screen
//   if (orderComplete) {
//     return (
//       <div className={styles.cartContainer}>
//         <h1>Order Confirmed!</h1>
//         <p>Thank you for your purchase.</p>
//         <div className={styles.orderDetails}>
//           <h2>Order Details</h2>
//           <p>Order ID: {orderData.id}</p>
//           <p>Status: {orderData.status}</p>
//           <h3>Items:</h3>
//           <ul>
//             {cartItems.map((item) => (
//               <li key={item.id}>
//                 {item.name} x {item.quantity} - €
//                 {(item.price * item.quantity).toFixed(2)}
//               </li>
//             ))}
//           </ul>
//           <p className={styles.total}>
//             <strong>Total: €{totalPrice.toFixed(2)}</strong>
//           </p>
//         </div>
//         <button onClick={() => (window.location.href = '/shop')}>
//           Continue Shopping
//         </button>
//       </div>
//     )
//   }

//   // Cart is empty
//   if (!cartItems?.length) {
//     return (
//       <div className={styles.checkoutContainer}>
//         <h2>Checkout</h2>
//         <p>Your cart is empty</p>
//         <button onClick={() => (window.location.href = '/shop')}>
//           Go to Shop
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className={styles.checkoutContainer}>
//       <h2>Checkout</h2>

//       <div className={styles.orderSummary}>
//         {cartItems.map((item) => (
//           <div key={item.id || item.name} className={styles.cartItem}>
//             <img
//               src={item.image}
//               alt={item.name}
//               className={styles.productImage}
//             />
//             <div style={{ width: '150px' }}>
//               <p>
//                 <strong>{item.name}</strong>
//               </p>
//               <div
//                 style={{
//                   lineHeight: '1',
//                   fontSize: 'medium',
//                   fontStyle: 'italic',
//                 }}
//               >
//                 <p>Quantity: {item.quantity}</p>
//                 <p>Price: €{item.price.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//         <h3 className={styles.sum}>Total Price: €{totalPrice.toFixed(2)}</h3>
//       </div>

//       {/* Order Status Messages */}
//      {orderStatus && orderStatus.type === 'canceled' && (
//   <div className={styles.cancelMessage || styles.errorMessage}>
//     <h3>Order Canceled</h3>
//     <p>{orderStatus.message}</p>
//     <p>Previous Order ID: {orderStatus.data.id}</p>
//     <button 
//       onClick={() => {
//         resetCheckout(); // Use the resetCheckout function here
//         setOrderStatus(null); // Also clear the order status message
//       }}
//     >
//       Start New Order
//     </button>
//   </div>
// )}

//       {/* Step 1: Measurements Form */}
//       {formStep === 1 && !orderStatus && <MeasureForm onSubmit={handleMeasureFormSubmit} />}

//       {/* Step 2: Delivery Form */}
//       {formStep === 2 && !orderStatus && (
//         <DeliveryForm onFormSubmit={handleDeliveryFormSubmit} />
//       )}

//       {/* Step 3: Payment */}
//       {formStep === 3 && !orderStatus && (
//         <div className={styles.paypalContainer}>
//           <div className={styles.checkoutSteps}>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>1</span>
//               <span className={styles.stepLabel}>Measurements</span>
//               <span className={styles.stepStatus}>✓</span>
//             </div>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>2</span>
//               <span className={styles.stepLabel}>Delivery</span>
//               <span className={styles.stepStatus}>✓</span>
//             </div>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>3</span>
//               <span className={styles.stepLabel}>Payment</span>
//               <span className={styles.stepStatus}>In Progress</span>
//             </div>
//           </div>

//           <h3>Complete Your Purchase</h3>
//           <p>Please review your information before proceeding with payment.</p>

//           <div className={styles.reviewSection}>
//             <div className={styles.reviewBlock}>
//               <h4>Measurements</h4>
//               <p>Height: {measurements.height} cm</p>
//               <p>Chest: {measurements.chest} cm</p>
//               <p>Waist: {measurements.waist} cm</p>
//               <p>Hips: {measurements.hips} cm</p>
//               <button
//                 className={styles.editButton}
//                 onClick={() => setFormStep(1)}
//               >
//                 Edit
//               </button>
//             </div>

//             <div className={styles.reviewBlock}>
//               <h4>Delivery Information</h4>
//               <p>{deliveryDetails.fullName}</p>
//               <p>{deliveryDetails.address}</p>
//               <p>
//                 {deliveryDetails.city}, {deliveryDetails.postalCode}
//               </p>
//               <p>{getCountryName[deliveryDetails.country] || deliveryDetails.country}</p>
//               <p>Email: {deliveryDetails.email}</p>
//               <p>Phone: {deliveryDetails.phone}</p>
//               <button
//                 className={styles.editButton}
//                 onClick={() => setFormStep(2)}
//               >
//                 Edit
//               </button>
//             </div>
//           </div>

//             {/* Payment Cancelled Message */}
//             {paymentCancelled && (
//               <div className={styles.cancelMessage}>
//                 <span
//                   className={styles.closeIcon}
//                   onClick={() => setPaymentCancelled(false)}
//                 >
//                   ✕
//                 </span>
//                 <h3>Payment Cancelled</h3>
//                 <p>
//                   Your payment was cancelled. No worries, your items are still
//                   in your cart, and you can try again whenever you&apos;re
//                   ready.
//                 </p>
//                 <button onClick={() => setPaymentCancelled(false)}>
//                   Try Again
//                 </button>
//               </div>
//             )}

//           <PayPalPayment
//             cart={formattedCartItems}
//             measurements={measurements}
//             deliveryDetails={deliveryDetails}
//             onSuccess={handlePaymentSuccess}
//             onCancel={handlePaymentCancel}
//             onOrderCreated={handleStartPayment} // New prop to track order ID
//           />
//         </div>
//       )}
//     </div>
//   )
// }

// export default Checkout