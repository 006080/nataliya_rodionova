import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./CartSummary.module.css";
import { useCart } from "./CartContext";
import useOutsideClick from "../src/hooks/useOutsideClick";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const CartSummary = ({ onClose }) => {
  const { cartItems, removeFromCart } = useCart();
  const cartRef = useOutsideClick(() => onClose());

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalPrice.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
    });
  };

  return (
    <div className={styles.cartSummary} ref={cartRef}>
      <div className={styles.header}>
        <h3>Order Summary</h3>
        <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={onClose} />
      </div>

      {cartItems.length > 0 ? (
        <>
          <div className={styles.itemList}>
            {cartItems.map((item) => (
              <div key={item.name} className={styles.item}>
                <div className={styles.itemDetails}>
                  <p>{item.name}</p>
                  <p style={{ color: "#575757" }}>Quantity: {item.quantity}</p>
                  <p style={{ color: "#575757" }}>Price: ${item.price}</p>
                  <button
                    style={{ backgroundColor: "black", marginBottom: "10px" }}
                    onClick={() => removeFromCart(item.name)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: "10px" }}>Total Items: {totalItems}</p>
          <p>Total Price: ${totalPrice.toFixed(2)}</p>
          <p style={{ fontSize: "12px", color: "#575757" }}>Shipping & taxes calculated at checkout</p>

          <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
            <PayPalButtons 
              style={{ layout: "vertical" }} 
              createOrder={createOrder} 
              onApprove={onApprove} 
            />
          </PayPalScriptProvider>
        </>
      ) : (
        <p style={{ fontStyle: "italic", color: "gray" }}>Your cart is empty</p>
      )}
    </div>
  );
};

CartSummary.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default CartSummary;
