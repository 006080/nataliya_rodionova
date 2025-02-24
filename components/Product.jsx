import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import styles from "./CardProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useCart } from './CartContext';

const Product = () => {
  const { state } = useLocation();
  const { id } = useParams(); // Get the product ID from the URL
  const product = state?.product; // Retrieve product data

  // Handle direct access to the page without navigation state
  if (!product) {
    return <p>Product not found. Please return to the <a href="/">shop</a>.</p>;
  }

  const [count, setCount] = useState(0);
  const { addToCart } = useCart();

  const increment = () => setCount(count + 1);
  const decrement = () => count > 0 && setCount(count - 1);

  const itemAdd = () => {
    if (count > 0) {
      const newProduct = { name: product.name, price: product.price, quantity: count };
      addToCart(newProduct);
      setCount(0);
    }
  };

  const [selectedStars, setSelectedStars] = useState(0);
  const handleStarClick = (starIndex) => setSelectedStars(starIndex + 1);

  return (
    <div className={styles.fashionItem}>
      <div className={styles.imageControl}>
        {typeof product.image === 'string' ? (
          <img src={product.image} alt={product.name} />
        ) : (
          product.image
        )}
      </div>

      <div className={styles.info}>
        <h3>{product.name}</h3>
        <div className={styles.notes}>
          <p className={styles.description}>Description:</p>
          <p>{product.description}</p>
        </div>

        <div className={styles.starPrice}>
          <p style={{ fontSize: "30px", fontStyle: "italic" }}>${product.price}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                style={{ color: index < selectedStars ? "yellow" : "grey", cursor: "pointer" }}
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>
        </div>

        <div className={styles.quantity}>
          <div className={styles.increment}>
            <p className={styles.incr} onClick={decrement}>-</p>
            <p className={styles.incr}>{count}</p>
            <p className={styles.incr} onClick={increment}>+</p>
          </div>
          <Button onClick={itemAdd}>Add to Cart</Button>
        </div>
      </div>
    </div>
  );
};

Product.propTypes = {
  name: PropTypes.string,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  price: PropTypes.number,
  description: PropTypes.string
};

export default Product;
