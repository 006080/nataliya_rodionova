import { useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import styles from "./WishedProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faShoppingCart,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoriteContext";

const WishedProduct = ({
  id,
  name,
  images,
  price,
  description = "No description available",
  material = "Not specified",
  colors = [],
}) => {
  const [count, setCount] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colors[0] || "Not specified");
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toggleFavorite } = useFavorites();

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => (prev > 1 ? prev - 1 : prev));

  const itemAdd = () => {
    if (count > 0) {
      const product = {
        id,
        name,
        image: images[0],
        price,
        quantity: count,
        material,
        colors: selectedColor,
        description,
      };

      addToCart(product);
      setCount(1);
    }
  };

  const removeFromWishlist = () => {
    toggleFavorite({ id, name, image: images[0], price });
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
    <div className={styles.wishedItem}>
      <div className={styles.imageContainer}>
        {images.length > 0 && (
          <img
            src={images[0]}
            alt={name}
            className={styles.productImage}
            onClick={() => openImageModal(0)}
          />
        )}
        <button className={styles.removeButton} onClick={removeFromWishlist} aria-label="Remove from wishlist">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.headerSection}>
          <h3 className={styles.productName}>{name}</h3>
          <p className={styles.productPrice}>${price}</p>
        </div>

        <p className={styles.productDescription}>{description}</p>

        <div className={styles.detailsSection}>
          <div className={styles.materialInfo}>
            <span className={styles.detailLabel}>Material:</span>
            <span className={styles.detailValue}>{material}</span>
          </div>

          {colors.length > 0 && (
            <div className={styles.colorSelector}>
              <span style={{ fontSize: "14px" }}>Available Colors:</span>
              <div className={styles.colorSwatchList}>
                {colors.map((colorOption) => (
                  <div
                    key={colorOption}
                    className={`${styles.colorCircle} ${
                      selectedColor === colorOption ? styles.selectedCircle : ""
                    }`}
                    style={{ backgroundColor: colorOption }}
                    onClick={() => setSelectedColor(colorOption)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actionArea}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className={styles.quantityControl}>
              <button onClick={decrement} className={styles.quantityButton}>-</button>
              <span className={styles.quantity}>{count}</span>
              <button onClick={increment} className={styles.quantityButton}>+</button>
            </div>

            <Button onClick={itemAdd} className={styles.addButton}>
              <FontAwesomeIcon icon={faShoppingCart} className={styles.cartIcon} />
              <span>Add to Cart</span>
            </Button>
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <div className={styles.fullscreenModal} onClick={() => setFullscreenImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenImage} alt="Fullscreen view" className={styles.fullscreenImage} />
            {images.length > 1 && (
              <div className={styles.modalControls}>
                <button className={styles.modalArrow} onClick={showPrevImage}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className={styles.modalArrow} onClick={showNextImage}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

WishedProduct.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string,
  material: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
};

export default WishedProduct;
