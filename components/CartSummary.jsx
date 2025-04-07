import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"; 
import styles from "./CartSummary.module.css";
import { useCart } from "./CartContext";
import useOutsideClick from "../src/hooks/useOutsideClick";

const CartSummary = ({ onClose }) => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const cartRef = useOutsideClick(() => onClose());

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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

  return (
    <div className={styles.cartSummary} ref={cartRef}>
      <div className={styles.header}>
        <h3 style={{ fontWeight: "300", fontStyle: "italic" }}>Order Summary</h3>
        <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={onClose} />
      </div>

      {cartItems.length > 0 ? (
        <>
          <div className={styles.itemList}>
            {cartItems.map((item) => (
              <div key={item.id || item.name} className={styles.item}>
                <img src={item.image} alt={item.name} className={styles.productImage} />
                <div className={styles.itemDetails}>
                  <p style={{ fontFamily: "Playfair Display", fontStyle: "italic" }}>
                    {item.name}
                  </p>

                  {/* Display color swatch */}
                  {item.color && (
                    <div className={styles.colorDisplay}>
                      <span style={{ fontSize: "12px", fontStyle: "italic" }}>Color:</span>
                      <div
                        className={styles.colorSwatch}
                        style={{
                          backgroundColor: item.color,
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          marginTop: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                  )}

        
                  {/* Quantity controls */}
                  {/* <div className={styles.quantityControls}>
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
                  </div> */}

                  <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: "200" }}>
                    ${item.price.toFixed(2)}
                  </p>

                  <button className={styles.removeButton} onClick={() => removeFromCart(item)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ lineHeight: "1" }}>
            <p style={{ marginTop: "10px" }}>Total Items: {totalItems}</p>
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
          </div>

          <p style={{ fontSize: "12px", marginBottom: "15px", fontStyle: "italic", fontWeight: "200" }}>
            Shipping & taxes calculated at checkout
          </p>

          <Link to="/checkout" onClick={onClose} className={styles.checkoutButton}>
            Checkout
          </Link>
        </>
      ) : (
        <p style={{ fontStyle: "italic", color: "gray", marginTop: "20px" }}>Your cart is empty</p>
      )}
    </div>
  );
};

CartSummary.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default CartSummary;
