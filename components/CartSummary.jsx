import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "./CartSummary.module.css";
import { useCart } from "./CartContext";
import useOutsideClick from "../src/hooks/useOutsideClick";

const CartSummary = ({ onClose }) => {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();

  const cartRef = useOutsideClick(() => onClose());

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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
                <img src={item.image} alt={item.name} className={styles.productImage} />
                <div className={styles.itemDetails}>
                  <p>{item.name}</p>
                  <p style={{ color: "#575757" }}>Quantity: {item.quantity}</p>
                  <p style={{ color: "#575757" }}>Price: ${item.price}</p>
                  <button
                    className={styles.removeButton}
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
          <p style={{ fontSize: "12px", color: "#575757" }}>
            Shipping & taxes calculated at checkout
          </p>

          <button
            className={styles.checkoutButton}
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
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
