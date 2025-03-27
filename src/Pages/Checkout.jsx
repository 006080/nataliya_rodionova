import { useState, useEffect } from 'react'
import { useCart } from '../../components/CartContext'
import MeasureForm from '../../components/MeasureForm'
import DeliveryForm from '../../components/DeliveryForm'
import styles from './Checkout.module.css'
import PayPalPayment from '../../components/PayPalPayment'
import { getCountryName } from '../utils/countries'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"

const Checkout = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity,  
    // setPendingOrder, 
    clearPendingOrder 
  } = useCart()
  
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [paymentCancelled, setPaymentCancelled] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)
  const [pendingOrderId, setPendingOrderState] = useState(null)

  // Form state
  const [measurements, setMeasurements] = useState(() => {
    // Initialize from localStorage if available
    try {
      const savedMeasurements = localStorage.getItem('measurements');
      return savedMeasurements ? JSON.parse(savedMeasurements) : null;
    } catch (error) {
      console.error('Error loading measurements from localStorage:', error);
      return null;
    }
  });
  
  const [deliveryDetails, setDeliveryDetails] = useState(() => {
    // Initialize from localStorage if available
    try {
      const savedDeliveryDetails = localStorage.getItem('deliveryDetails');
      return savedDeliveryDetails ? JSON.parse(savedDeliveryDetails) : null;
    } catch (error) {
      console.error('Error loading delivery details from localStorage:', error);
      return null;
    }
  });
  
  const [formStep, setFormStep] = useState(() => {
    // Determine initial form step based on saved data
    if (measurements && deliveryDetails) return 3; // Payment step
    if (measurements) return 2; // Delivery form
    return 1; // Measurement form
  });

  // Function to increase item quantity
  const increaseQuantity = (item) => {
    // Use ID if available, otherwise use name as identifier
    const identifier = item.id || item.name;
    updateQuantity(identifier, item.quantity + 1);
  };

  // Function to decrease item quantity
  const decreaseQuantity = (item) => {
    // Use ID if available, otherwise use name as identifier
    const identifier = item.id || item.name;
    
    if (item.quantity > 1) {
      updateQuantity(identifier, item.quantity - 1);
    } else {
      // Remove item if quantity would go below 1
      removeFromCart(item);
    }
  };

  // Check for pending order on component mount
  useEffect(() => {
    const checkPendingOrder = async () => {
      // If we have a pending order ID and we're on the payment step
      if (pendingOrderId && formStep === 3) {
        try {
          const apiUrl = import.meta.env.VITE_NODE_ENV === 'production'
            ? import.meta.env.VITE_API_BASE_URL_PROD
            : import.meta.env.VITE_API_BASE_URL_LOCAL;
            
          const response = await fetch(`${apiUrl}/api/payments/${pendingOrderId}`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'CANCELED' || data.status === 'VOIDED') {
              // Order was canceled - show message and allow them to create a new order
              setOrderStatus({
                type: 'canceled',
                message: 'Your previous order was canceled. Please start a new order.',
                data
              });
              
              // Clear the pending order ID since it's no longer valid
              setPendingOrderState(null);
            } else if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
              // Order was completed - show success message
              setOrderStatus({
                type: 'completed',
                message: 'Your order has been successfully completed!',
                data
              });
              setOrderComplete(true);
              setOrderData(data);
              removeFromCart(); // Clear cart
              clearPendingOrder(true); // Clear pending order and cart
            }
          }
        } catch (error) {
          console.error('Error checking order status:', error);
        }
      }
    };
    
    checkPendingOrder();
  }, [formStep, removeFromCart, clearPendingOrder, pendingOrderId]);

  // Save measurements to localStorage when they change
  useEffect(() => {
    if (measurements) {
      localStorage.setItem('measurements', JSON.stringify(measurements));
    }
  }, [measurements]);

  // Save deliveryDetails to localStorage when they change
  useEffect(() => {
    if (deliveryDetails) {
      localStorage.setItem('deliveryDetails', JSON.stringify(deliveryDetails));
    }
  }, [deliveryDetails]);

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

  const handleStartPayment = (orderId) => {
    if (orderId) {
      // setPendingOrder(orderId);
      setPendingOrderState(orderId);
    }
  };
  
const handlePaymentSuccess = (data) => {
  
  const completedOrderItems = [...cartItems]; 
  const completedOrderTotal = totalPrice;
  
  // Then set the saved data alongside the order data
  setOrderData({
    ...data,
    items: completedOrderItems,
    total: completedOrderTotal
  });
  
  // Set order complete first (important for state tracking)
  setOrderComplete(true);
  
  // Clear pending order and cart AFTER saving the data
  clearPendingOrder(true);
  setPendingOrderState(null);
};

// Updated handlePaymentCancel function in Checkout.jsx
const handlePaymentCancel = (data, shouldRedirect = false) => {
  
  if (shouldRedirect) {
    // Clear cart and context when redirecting
    clearPendingOrder(true);
    
  } else {
    // For cases where we don't redirect (e.g., API errors)
    setPaymentCancelled(true);
    
    setTimeout(() => {
      setPaymentCancelled(false);
    }, 10000);
  }
};
  
  // Add a new function to completely reset the checkout process
  const resetCheckout = () => {
    
    // Clear all checkout data
    setMeasurements(null);
    setDeliveryDetails(null);
    clearPendingOrder(true);
    setPendingOrderState(null);
    
    // Reset form step
    setFormStep(1);
    
    // Clear localStorage
    localStorage.removeItem('measurements');
    localStorage.removeItem('deliveryDetails');
    localStorage.removeItem('cartItems');
  };

  const formattedCartItems = cartItems.map((item) => ({
    id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    description: item.description || `${item.name} product`,
    image: item.image,
  }))
  
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
          {orderData.items.map((item) => (
            <li key={item.id || item.name}>
              {item.name} x {item.quantity} - €
              {(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <p className={styles.total}>
          <strong>Total: €{orderData.total.toFixed(2)}</strong>
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

      <div className={styles.orderSummary}>
        {cartItems.map((item) => (
          <div key={item.id || item.name} className={styles.cartItem}>
            <img
            style={{width:'160px', height:'120px'}}
              src={item.image}
              alt={item.name}
              className={styles.productImage}
            />
            <div style={{ width: '250px' }}>
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
                 {/* Quantity controls */}
                 <div className={styles.quantityControls}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => decreaseQuantity(item)}
                    aria-label="Decrease quantity"
                  >
                    <FontAwesomeIcon icon={faMinus} size="xs" />
                  </button>
                  
                  <span className={styles.quantityValue}>{item.quantity}</span>
                  
                  <button 
                    className={styles.quantityButton}
                    onClick={() => increaseQuantity(item)}
                    aria-label="Increase quantity"
                  >
                    <FontAwesomeIcon icon={faPlus} size="xs" />
                  </button>
                </div>

                <p>Price: €{item.price.toFixed(2)}</p>
                <p>Total: €{(item.price * item.quantity).toFixed(2)}</p>
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
              resetCheckout(); 
              setOrderStatus(null); 
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
              <p>{getCountryName(deliveryDetails.country)}</p>
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

          {/* Pass pendingOrderId directly from state */}
          <PayPalPayment
            cart={formattedCartItems}
            measurements={measurements}
            deliveryDetails={deliveryDetails}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            onOrderCreated={handleStartPayment}
            existingOrderId={pendingOrderId}
            clearOrderId={() => setPendingOrderState(null)}
          />
        </div>
      )}
    </div>
  )
}

export default Checkout