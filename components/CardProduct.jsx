import { useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import styles from "./CardProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronLeft, faChevronRight, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoriteContext";

const CardProduct = ({
  id, name, images, price, description, material = "Not specified", color = "Not specified"
}) => {
  const [count, setCount] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const increment = () => setCount(count + 1);
  const decrement = () => count > 0 && setCount(count - 1);

  const itemAdd = () => {
    if (count > 0) {
      const product = { id, name, image: images[0], price, quantity: count, material, color };
      addToCart(product);
      setCount(0); // Reset the count after adding to cart
    }
  };

  const handleStarClick = (starIndex) => setSelectedStars(starIndex + 1);

  const handleHeartClick = () => {
    const product = { id, name, image: images[0], price };
    toggleFavorite(product); // Toggle the favorite status for the product
  };

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setFullscreenImage(images[index]);
  };

  const showNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    setFullscreenImage(images[nextIndex]);
  };

  const showPrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(prevIndex);
    setFullscreenImage(images[prevIndex]);
  };

  return (
    <div className={styles.fashionItem}>
      {/* Product Info */}

        {/* Render main image, click to open fullscreen modal */}
        <img
          src={images[0]}
          alt={`${name}`}
          className={styles.mainImage}
          onClick={() => openImageModal(0)}
        />


      {/* Product Info */}
      <div className={styles.info}>
        <div className={styles.titleLine}>
          <h3 style={{ textAlign: "left" }}>{name}</h3>

          {/* Heart Icon for adding/removing from favorites */}
          <FontAwesomeIcon
            icon={faHeart}
            className={styles.heart}
            style={{
              color: isFavorite(id) ? "black" : "",
              cursor: "pointer",
            }}
            onClick={handleHeartClick}
          />
        </div>

        {/* Product details like description, material, and color */}
        <div className={styles.notes}>
          <p style={{ fontSize: "14px" }}>{description}</p>
          <p style={{ fontSize: "14px" }}>Material: {material}</p>
          <p style={{ fontSize: "14px" }}>Color: {color}</p>
        </div>

        {/* Star Rating */}
        <div className={styles.starPrice}>
          <p style={{ fontSize: "20px", fontStyle: "italic" }}>${price}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                style={{
                  color: index < selectedStars ? "black" : "grey",
                  cursor: "pointer",
                }}
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Quantity Controls and Add to Cart Button */}
        <div className={styles.quantity}>
          <div className={styles.increment}>
            <p className={styles.incr} onClick={decrement}>-</p>
            <p className={styles.incr}>{count}</p>
            <p className={styles.incr} onClick={increment}>+</p>
          </div>
          <Button onClick={itemAdd}>Add to Cart</Button>
        </div>
      </div>

      {/* Fullscreen Modal for Image Viewing */}
      {fullscreenImage && (
        <div className={styles.fullscreenModal} onClick={() => setFullscreenImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenImage} alt="Fullscreen" className={styles.fullscreenImage}  style={{width:"450px", height: "100%"}} />
            <div className={styles.modalArrows}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                className={styles.arrow}
                onClick={showPrevImage}
              />
              <FontAwesomeIcon
                icon={faChevronRight}
                className={styles.arrow}
                onClick={showNextImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CardProduct.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  material: PropTypes.string,
  color: PropTypes.string,
};

export default CardProduct;
