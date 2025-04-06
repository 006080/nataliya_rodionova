import { useState } from "react";
import Slider from "react-slick";
import CardProduct from "../../components/CardProduct";
import CartSummary from "../../components/CartSummary";
import styles from "./Shop.module.css";
import { Cloudinary } from "@cloudinary/url-gen";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx", // Replace with your Cloudinary cloud name
  },
});

// Define your Cloudinary images (Multiple images for carousel)
const collarImages = [
  cld.image("collar_vzz5yo").toURL(),
];

const scarfImages = [
  cld.image("image_6483441_8_lr6b1a").toURL(),
  cld.image("image_6483441_6_qhuykn").toURL(),
  cld.image("image_6483441_9_txsndd").toURL(),
];

const trousersImages = [
  cld.image("trousers_x3ryc0").toURL(),
];

const dress = [
  cld.image("0B9C10B5-B616-4D36-AE73-D48E03C60EB2_e3t2x7").toURL(),
  cld.image("IMG_6612_v48gkj").toURL(),
  cld.image("7AF52139-EA8E-4317-B8A6-CE9C4380A3CA_fdpwos").toURL(),
];

const Shop = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]); // To hold multiple images

  const handleClosePreview = () => {
    setPreviewImage(null);
    setPreviewImages([]); // Clear images when closing
  };

  const addToCart = (product) => {
    const existingProductIndex = cartItems.findIndex(
      (item) => item.name === product.name
    );

    if (existingProductIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingProductIndex].quantity += product.quantity;
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, product]);
    }
    setCartIsOpen(true);
  };

  const removeFromCart = (productName) => {
    setCartItems(cartItems.filter((item) => item.name !== productName));
  };

  const handleCloseCart = () => {
    setCartIsOpen(false);
  };

  const handleImageClick = (images) => {
    setPreviewImages(images); // Set the list of images for preview carousel
    setPreviewImage(images[0]); // Set the first image as preview
  };

  return (
    <div className={styles.shop}>
      <CardProduct
        addToCart={addToCart}
        images={collarImages}
        onImageClick={() => handleImageClick(collarImages)}
        name="COLLAR"
        price={120}
        description="Made entirely from 100% cotton, this collar ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
        material={'100% cotton'}
        color={'white'}
      />

      <CardProduct
        addToCart={addToCart}
        images={scarfImages}
        onImageClick={() => handleImageClick(scarfImages)}
        name="SCARF"
        price={180}
        description="Made entirely from 100% cotton, this scarf ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
        material={'100% Wool'}
        color={'grey'}
      />

      <CardProduct
        addToCart={addToCart}
        images={trousersImages}
        onImageClick={() => handleImageClick(trousersImages)}
        name="TROUSERS"
        price={480}
        description="Made entirely from 100% cotton, these trousers ensure comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
        material={'80% wool  20% cashmere'}
        color={'grey'}
      />

      <CardProduct
        addToCart={addToCart}
        images={dress}
        onImageClick={() => handleImageClick(dress)}
        name="MEN'S DRESS"
        price={680}
        description="Designed for both comfort and style, this piece features a cozy wool-blend fabric in a classic checkerboard pattern. The deep V-neck and ribbed hem add a touch of elegance, while the relaxed fit allows for effortless layering. Pair it with combat boots and high socks for a trendy street-style look."
        material={"100% sheep wool"}
        color={""}
      />

      {cartIsOpen && (
        <CartSummary
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          onClose={handleCloseCart}
        />
      )}

      {previewImage && previewImages.length > 0 && (
        <div className={styles.overlay} onClick={handleClosePreview}>
          <div className={styles.previewCarousel}>
            <Slider
              {...{
                dots: true,
                infinite: false,  // Disable infinite scrolling to prevent repetition
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
              }}
            >
              {previewImages.map((img, index) => (
                <div key={index}>
                  <img
                    src={img}
                    alt={`Preview ${index}`}
                    className={styles.previewImage}
                  />
                </div>
              ))}
            </Slider>
            <button
              className={styles.closeButton}
              onClick={handleClosePreview}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
