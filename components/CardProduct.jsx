import { useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import styles from "./CardProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faChevronLeft,
  faChevronRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoriteContext";
import { hexToColorName } from "../src/utils/colorConvertion";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const CardProduct = ({
  id,
  name,
  images,
  price,
  description,
  material = "Not specified",
  color = "Not specified",
  colors = [], // ✅ new dynamic prop with default empty array
}) => {
  const [count, setCount] = useState(1);
  const [selectedStars, setSelectedStars] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(color || colors[0] || "");


  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const increment = () => setCount(count + 1);
  const decrement = () => count > 1 && setCount(count - 1);

  const itemAdd = () => {
    if (count >= 1) {
      const product = {
        id,
        name,
        image: images[0],
        price,
        quantity: count,
        material,
        color: selectedColor,
      };
      addToCart(product);
      setCount(1);
    }
  };

  const handleStarClick = (starIndex) => setSelectedStars(starIndex + 1);


  const handleHeartClick = () => {
    const product = {
      id,
      name,
      image: images[0],
      price,
      description,
      material,
      color: selectedColor,
      colors, // ✅ ADD THIS
    };
    toggleFavorite(product);
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
      <img
        src={images[0]}
        alt={name}
        className={styles.mainImage}
        onClick={() => openImageModal(0)}
      />

      <div className={styles.info}>
        <div className={styles.titleLine}>
          <h3 style={{ textAlign: "left" }}>{name}</h3>
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

        <div className={styles.notes}>
          <p style={{ fontSize: "14px" }}>{description}</p>
          <p style={{ fontSize: "14px" }}>Material: {material}</p>
          <p style={{ fontSize: "14px" }}>
            Default Color: {hexToColorName(color)}
          </p>
        </div>

        {/* 🎨 Dynamic Color Swatches */}
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

        <div className={styles.starPrice}>
          <p style={{ fontSize: "20px", fontStyle: "italic" }}>${price}</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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

        <div className={styles.quantity}>
          <div className={styles.increment}>
            <p
              className={count > 1 ? styles.incr : styles.deactivatedIncr}
              onClick={count > 1 ? decrement : undefined}
            >
              -
            </p>
            <p className={styles.incr}>{count}</p>
            <p className={styles.incr} onClick={increment}>
              +
            </p>
          </div>

          <Button onClick={itemAdd}>
            <FontAwesomeIcon
              icon={faShoppingCart}
              className={styles.cartIcon}
            />
            Add to Cart
          </Button>
        </div>
      </div>

      {fullscreenImage && (
        <div
          className={styles.fullscreenModal}
          onClick={() => setFullscreenImage(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className={styles.fullscreenImage}
              style={{ width: "450px", height: "100%" }}
            />
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
  colors: PropTypes.arrayOf(PropTypes.string), // ✅ added prop type
};

export default CardProduct;
