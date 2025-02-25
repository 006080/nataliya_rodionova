import { useState } from "react";
import { useCart } from "../../components/CartContext";
import MeasureForm from "../../components/MeasureForm";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const { cartItems } = useCart();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isMeasureFormValid, setIsMeasureFormValid] = useState(false); // Track measurement form validation

  const totalPrice = cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const handleFormSubmit = () => {
    if (isMeasureFormValid) {
      setFormSubmitted(true);
    } else {
      alert("Please submit your measurements before proceeding to payment.");
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <h2>Checkout</h2>

      <div className={styles.orderSummary}>
        <h3>Order Summary</h3>
        {cartItems?.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.name} className={styles.cartItem}>
              <img src={item.image} alt={item.name} className={styles.productImage} />
              <div>
                <p><strong>{item.name}</strong></p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty</p>
        )}
        <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
      </div>

      {/* Measurement Form with validation */}
      <MeasureForm setIsMeasureFormValid={setIsMeasureFormValid} />

      <button
        onClick={handleFormSubmit}
        className={styles.submitButton}
        disabled={!isMeasureFormValid} // Disabled until measurements are submitted
      >
        Proceed to Payment
      </button>

      {formSubmitted && isMeasureFormValid && (
        <div className={styles.paypalContainer}>
          <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{ amount: { value: totalPrice.toFixed(2) } }],
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  alert(`Transaction completed by ${details.payer.name.given_name}`);
                });
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
};

export default Checkout;
