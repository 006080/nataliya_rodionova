import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"; // ✅ Use Link instead of useNavigate
import styles from "./CartSummary.module.css";
import { useCart } from "./CartContext";
import useOutsideClick from "../src/hooks/useOutsideClick";
import { useNavigate } from "react-router-dom";

const CartSummary = ({ onClose }) => {
  const { cartItems, removeFromCart } = useCart();
  const cartRef = useOutsideClick(() => onClose());

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className={styles.cartSummary} ref={cartRef}>
      <div className={styles.header}>
        <h3 style={{ fontWeight: "300", fontStyle: "italic" }}>
          Order Summary
        </h3>
        <FontAwesomeIcon
          icon={faTimes}
          className={styles.closeIcon}
          onClick={onClose}
        />
      </div>

      {cartItems.length > 0 ? (
        <>
          <div className={styles.itemList}>
            {cartItems.map((item) => (
              <div key={item.name} className={styles.item}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.productImage}
                />
                <div className={styles.itemDetails}>
                  <p
                    style={{
                      fontFamily: "Playfair Display",
                      fontStyle: "italic",
                    }}
                  >
                    {item.name}
                  </p>
                  <div style={{ lineHeight: "1" }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontStyle: "italic",
                        fontWeight: "200",
                      }}
                    >
                      Quantity: {item.quantity}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontStyle: "italic",
                        fontWeight: "200",
                      }}
                    >
                      ${item.price}
                    </p>
                  </div>
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
          <div style={{lineHeight:'1'}}>
            <p style={{ marginTop: "10px" }}>Total Items: {totalItems}</p>
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
          </div>
          <p
            style={{
              fontSize: "12px",
              marginBottom: "10px",
              fontStyle: "italic",
              fontWeight: "200",
            }}
          >
            Shipping & taxes calculated at checkout
          </p>

          {/* ✅ Link instead of useNavigate */}
          <Link to="/checkout" className={styles.checkoutButton}>
            Checkout
          </Link>
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
