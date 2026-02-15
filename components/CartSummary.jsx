import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./CartSummary.module.css";
import { useCart } from "./CartContext";
import useOutsideClick from "../src/hooks/useOutsideClick";
import { useState } from "react";

const CartSummary = ({ onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { cartItems, removeFromCart } = useCart();
  const cartRef = useOutsideClick(() => onClose());

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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
            Price includes taxes and shipping.
          </p>

          <div 
            className={styles.buttonContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: 'relative' }} // Ensures tooltip anchors to the button
          >
            {isHovered && (
              <div className={styles.hoverPopup}>
                Our shop is currently in Demo Mode. Orders cannot be processed at this time.
              </div>
            )}
            <button onClick={onClose} className={styles.checkoutButton}>
              Checkout
            </button>
          </div>
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