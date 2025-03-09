import { useState } from 'react'
import { useCart } from '../../components/CartContext'
import MeasureForm from '../../components/MeasureForm'
import DeliveryForm from '../../components/DeliveryForm'
import styles from './Checkout.module.css'
import PayPalPayment from '../../components/PayPalPayment'

const Checkout = () => {
  const { cartItems, removeFromCart } = useCart()
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [paymentCancelled, setPaymentCancelled] = useState(false)

  // Form state
  const [measurements, setMeasurements] = useState(null)
  const [deliveryDetails, setDeliveryDetails] = useState(null)
  const [formStep, setFormStep] = useState(1)

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

      {/* Step 1: Measurements Form */}
      {formStep === 1 && <MeasureForm onSubmit={handleMeasureFormSubmit} />}

      {/* Step 2: Delivery Form */}
      {formStep === 2 && (
        <DeliveryForm onFormSubmit={handleDeliveryFormSubmit} />
      )}

      {/* Step 3: Payment */}
      {formStep === 3 && (
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
          />
        </div>
      )}
    </div>
  )
}

export default Checkout
