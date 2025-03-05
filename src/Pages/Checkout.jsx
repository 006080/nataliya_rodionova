import { useState } from "react";
import { useCart } from "../../components/CartContext";
import MeasureForm from "../../components/MeasureForm";
import DeliveryForm from "../../components/DeliveryForm"; // Import DeliveryForm
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const { cartItems } = useCart();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState(null); // Store delivery details

  const totalPrice = cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const handleDeliverySubmit = (details) => {
    setDeliveryDetails(details);
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
              <div style={{ width: '150px' }}>
                <p><strong>{item.name}</strong></p>
                <div style={{ lineHeight: '1', fontSize: 'medium', fontStyle: 'italic' }}>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.price}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty</p>
        )}
        <h3 className={styles.sum}>Total Price: ${totalPrice.toFixed(2)}</h3>
      </div>

      <MeasureForm />
      
      {/* Delivery Form */}
      {!deliveryDetails && <DeliveryForm onFormSubmit={handleDeliverySubmit} />}

      {/* Show PayPal Button only after delivery details are saved */}
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
