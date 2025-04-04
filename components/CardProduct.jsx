import { useState } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick"; // Import react-slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "./Button";
import styles from "./CardProduct.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronLeft, faChevronRight, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "./CartContext";

// Custom Arrow Components (Centered on Image)
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

const CardProduct = ({ id, name, images, price, description, material, color }) => {
  const [count, setCount] = useState(0);
  const { addToCart } = useCart();
  const [selectedStars, setSelectedStars] = useState(0);
  const [isHeartSelected, setIsHeartSelected] = useState(false); // Manage heart selection state

  const increment = () => setCount(count + 1);
  const decrement = () => count > 0 && setCount(count - 1);

  const itemAdd = () => {
    if (count > 0) {
      const product = { id, name, image: images[0], price, quantity: count, material, color }; // Store first image as default
      addToCart(product);
      setCount(0); // Reset the count after adding to cart
    }
  };

  const handleStarClick = (starIndex) => setSelectedStars(starIndex + 1);

  // Toggle Heart Click
  const handleHeartClick = () => {
    setIsHeartSelected((prev) => !prev);
  };

  // Slick Carousel settings
  const settings = {
    dots: true, // Enables dot navigation
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
      <div className={styles.imageControl}>
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageContainer}>
              <img src={img} alt={`${name} ${index + 1}`} className={styles.carouselImage} />
            </div>
          ))}
        </Slider>
      </div>

      <div className={styles.info}>
        <div className={styles.titleLine}>
          <h3 style={{ textAlign: 'left' }}>{name}</h3>

          {/* Heart Icon - Toggle Between Red & Grey */}
          <FontAwesomeIcon 
            icon={faHeart}
            className={styles.heart}
            style={{ color: isHeartSelected ? "" : "black", cursor: "pointer" }}
            onClick={handleHeartClick} // Toggle heart selection
          />
        </div>

        <div className={styles.notes}>
          <p style={{ fontSize: '14px' }}>{description}</p>
          <p style={{ fontSize: '14px' }}>Material:{material}</p>
          <p style={{ fontSize: '14px' }}>Color:{color}</p>
        </div>

        <div className={styles.starPrice}>
          <p style={{ fontSize: "20px", fontStyle: "italic" }}>${price}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                style={{ color: index < selectedStars ? "black" : "grey", cursor: "pointer" }}
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

CardProduct.propTypes = {
  name: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired, // Now accepts an array of images
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
};

export default CardProduct;
