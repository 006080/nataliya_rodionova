import { useState } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "./Button";
import styles from "./CardProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronLeft, faChevronRight, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoriteContext";

// Custom Arrow Components for the slider
const PrevArrow = ({ onClick }) => (
  <div className={styles.arrow} style={{ left: "10px" }} onClick={onClick}>
    <FontAwesomeIcon icon={faChevronLeft} />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div className={styles.arrow} style={{ right: "10px" }} onClick={onClick}>
    <FontAwesomeIcon icon={faChevronRight} />
  </div>
);

const CardProduct = ({
  id, name, images, price, description, material = "Not specified", color = "Not specified", onImageClick
}) => {
  const [count, setCount] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <div className={styles.fashionItem}>
      {/* Image Slider */}
      <div className={styles.imageControl}>
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageContainer}>
              <img
                src={img}
                alt={`${name} ${index + 1}`}
                className={styles.carouselImage}
                onClick={() => onImageClick && onImageClick(images, index)}
                style={{ cursor: "zoom-in" }}
              />
            </div>
          ))}
        </Slider>
      </div>

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
              cursor: "pointer"
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
                  color: index < selectedStars ? "grey" : "black",
                  cursor: "pointer"
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
  onImageClick: PropTypes.func,
};

export default CardProduct;
