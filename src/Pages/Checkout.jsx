import { useState, useEffect } from "react";
import { useCart } from "../../components/CartContext";
import MeasureForm from "../../components/MeasureForm";
import DeliveryForm from "../../components/DeliveryForm";
import styles from "./Checkout.module.css";
import PayPalPayment from "../../components/PayPalPayment";
import { getCountryName } from "../utils/countries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const Checkout = () => {
  const { cartItems, removeFromCart, updateQuantity, clearPendingOrder } = useCart();

  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [pendingOrderId, setPendingOrderState] = useState(null);

  const [measurements, setMeasurements] = useState(() => {
    try {
      const savedMeasurements = localStorage.getItem("measurements");
      return savedMeasurements ? JSON.parse(savedMeasurements) : null;
    } catch (error) {
      console.error("Error loading measurements from localStorage:", error);
      return null;
    }
  });

  const [deliveryDetails, setDeliveryDetails] = useState(() => {
    try {
      const savedDeliveryDetails = localStorage.getItem("deliveryDetails");
      return savedDeliveryDetails ? JSON.parse(savedDeliveryDetails) : null;
    } catch (error) {
      console.error("Error loading delivery details from localStorage:", error);
      return null;
    }
  });

  const [formStep, setFormStep] = useState(() => {
    if (measurements && deliveryDetails) return 3;
    if (measurements) return 2;
    return 1;
  });

  const increaseQuantity = (item) => {
    const identifier = item.id || item.name;
    updateQuantity(identifier, item.quantity + 1);
  };

  const decreaseQuantity = (item) => {
    const identifier = item.id || item.name;
    if (item.quantity > 1) {
      updateQuantity(identifier, item.quantity - 1);
    } else {
      removeFromCart(item);
    }
  };

  useEffect(() => {
    const checkPendingOrder = async () => {
      if (pendingOrderId && formStep === 3) {
        try {
          const apiUrl =
            import.meta.env.VITE_NODE_ENV === "production"
              ? import.meta.env.VITE_API_BASE_URL_PROD
              : import.meta.env.VITE_API_BASE_URL_LOCAL;

          const response = await fetch(`${apiUrl}/api/payments/${pendingOrderId}`);

          if (response.ok) {
            const data = await response.json();

            if (data.status === "CANCELED" || data.status === "VOIDED") {
              setOrderStatus({
                type: "canceled",
                message: "Your previous order was canceled. Please start a new order.",
                data,
              });
              setPendingOrderState(null);
            } else if (data.status === "COMPLETED" || data.status === "APPROVED") {
              setOrderStatus({
                type: "completed",
                message: "Your order has been successfully completed!",
                data,
              });
              setOrderComplete(true);
              setOrderData(data);
              removeFromCart();
              clearPendingOrder(true);
            }
          }
        } catch (error) {
          console.error("Error checking order status:", error);
        }
      }
    };

    checkPendingOrder();
  }, [formStep, removeFromCart, clearPendingOrder, pendingOrderId]);

  useEffect(() => {
    if (measurements) {
      localStorage.setItem("measurements", JSON.stringify(measurements));
    }
  }, [measurements]);

  useEffect(() => {
    if (deliveryDetails) {
      localStorage.setItem("deliveryDetails", JSON.stringify(deliveryDetails));
    }
  }, [deliveryDetails]);

  const totalPrice =
    cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const handleMeasureFormSubmit = (measureData) => {
    setMeasurements(measureData);
    setFormStep(2);
  };

  const handleDeliveryFormSubmit = (deliveryData) => {
    setDeliveryDetails(deliveryData);
    setFormStep(3);
  };

  const handleStartPayment = (orderId) => {
    if (orderId) {
      setPendingOrderState(orderId);
    }
  };

  const handlePaymentSuccess = (data) => {
    const completedOrderItems = [...cartItems];
    const completedOrderTotal = totalPrice;
    setOrderData({
      ...data,
      items: completedOrderItems,
      total: completedOrderTotal,
    });
    setOrderComplete(true);
    clearPendingOrder(true);
    setPendingOrderState(null);
  };

  const handlePaymentCancel = (data, shouldRedirect = false) => {
    if (shouldRedirect) {
      clearPendingOrder(true);
    } else {
      setPaymentCancelled(true);
      setTimeout(() => {
        setPaymentCancelled(false);
      }, 10000);
    }
  };

  const resetCheckout = () => {
    setMeasurements(null);
    setDeliveryDetails(null);
    clearPendingOrder(true);
    setPendingOrderState(null);
    setFormStep(1);
    localStorage.removeItem("measurements");
    localStorage.removeItem("deliveryDetails");
    localStorage.removeItem("cartItems");
  };

  const formattedCartItems = cartItems.map((item) => ({
    id: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    description: item.description || `${item.name} product`,
    image: item.image,
    color: item.color,
  }));

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
                {item.color && (
                  <span
                    className={styles.colorSwatch}
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: item.color,
                      borderRadius: "50%",
                      marginLeft: "5px",
                      border: "1px solid #ddd",
                    }}
                  ></span>
                )}
              </li>
            ))}
          </ul>
          <p className={styles.total}>
            <strong>Total: €{orderData.total.toFixed(2)}</strong>
          </p>
        </div>
        <button onClick={() => (window.location.href = "/shop")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (!cartItems?.length) {
    return (
      <div className={styles.checkoutContainer}>
        <h2>Checkout</h2>
        <p>Your cart is empty</p>
        <button onClick={() => (window.location.href = "/shop")}>
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.orderSummary}>
        {cartItems.map((item) => (
          <div key={item.id || item.name} className={styles.cartItem}>
            <img
              src={item.image}
              alt={item.name}
              className={styles.productImage}
            />
            <div style={{ width: "250px" }}>
              <p>
                <strong
                  style={{
                    fontStyle: "italic",
                    fontWeight: "400",
                    fontFamily: "Playfair Display",
                    fontSize: "20px",
                  }}
                >
                  {item.name}
                </strong>
              </p>

              {/* Quantity controls */}
              <div className={styles.quantityControls}>
                <button
                  className={styles.qbutton}
                  onClick={() => decreaseQuantity(item)}
                  aria-label="Decrease quantity"
                >
                  <FontAwesomeIcon icon={faMinus} size="xs" />
                </button>
                <span className={styles.quantityValue}>{item.quantity}</span>
                <button
                  className={styles.qbutton}
                  onClick={() => increaseQuantity(item)}
                  aria-label="Increase quantity"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" />
                </button>
              </div>

              {/* Color */}
              {item.color && (
                <p style={{ display: "flex", alignItems: "center", marginTop: "20px", fontStyle: 'italic', fontSize:'14px' }}>
                  Color:
                  <span
                    style={{
                      display: "inline-block",
                      width: "15px",
                      height: "15px",
                      backgroundColor: item.color,
                      borderRadius: "50%",
                      marginLeft: "10px",
                      border: "1px solid #ddd",
                    }}
                  ></span>
                </p>
              )}

              {/* Price block */}
              <div className={styles.texts}>
                <p style={{ fontSize: "14px", margin:'0', padding: '0', fontStyle:'italic' }}>
                  Price: ${item.price.toFixed(2)}
                </p>
                <p style={{ fontSize: "14px", margin:'0', padding:'0', fontStyle:'italic'}}>
                  Total: ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <h3 className={styles.sum}>Total Price: €{totalPrice.toFixed(2)}</h3>
      </div>

      {orderStatus && orderStatus.type === "canceled" && (
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

      {formStep === 1 && !orderStatus && (
        <MeasureForm onSubmit={handleMeasureFormSubmit} />
      )}

      {formStep === 2 && !orderStatus && (
        <DeliveryForm onFormSubmit={handleDeliveryFormSubmit} />
      )}

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
                Your payment was cancelled. No worries, your items are still in
                your cart, and you can try again whenever you&apos;re ready.
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
            onOrderCreated={handleStartPayment}
            existingOrderId={pendingOrderId}
            clearOrderId={() => setPendingOrderState(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout




