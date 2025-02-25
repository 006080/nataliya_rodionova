import { useState } from "react";
import { useCart } from "../../components/CartContext"; // Corrected import path
import MeasureForm from "../../components/MeasureForm"; // Ensure correct path and default export
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styles from "./Checkout.module.css"; // Ensure this file exists

const Checkout = () => {
  const { cartItems } = useCart(); // Get cart items from context
  const [formSubmitted, setFormSubmitted] = useState(false);

  const totalPrice = cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  return (
    <div className={styles.checkoutContainer}>
      <h2>Checkout</h2>

      <div className={styles.orderSummary}>
        {cartItems?.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.name} className={styles.cartItem}>
              <img src={item.image} alt={item.name} className={styles.productImage} />
         <div>
                <p><strong>{item.name}</strong></p>
                <p style={{fontStyle:'italic'}}>Quantity: {item.quantity}</p>
                <p style={{fontStyle:'italic'}}>Price: ${item.price}</p>
              </div>
              </div>

          ))
        ) : (
          <p>Your cart is empty</p>
        )}
        <h3 className={styles.sum}>Total Price: ${totalPrice.toFixed(2)}</h3>
      </div>

      {/* Ensure MeasureForm is correctly imported */}
      <MeasureForm />

      <button onClick={handleFormSubmit} className={styles.submitButton}>
        Proceed to Payment
      </button>

      {formSubmitted && (
        <div className={styles.paypalContainer}>
          <PayPalScriptProvider options={{ "client-id": "ATNcfYLojXcMeX9lCiE9khgbRYSjaKptcE9-R-PfsaQMx6ZrqVoyWoYDzMefUKFIFQpp_o82vQ81aCt-" }}>
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
