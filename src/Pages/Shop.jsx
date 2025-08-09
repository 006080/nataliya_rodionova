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

const skirtImages = [
  cld.image("rock__vorne_jvrult").toURL(),
  cld.image("image_6483441_6_qhuykn").toURL(),
  cld.image("image_6483441_9_txsndd").toURL(),
];

const trousersImages = [
  cld.image("trousers_x3ryc0").toURL(),
];

const gloves = [
  cld.image("5E6EEA4C-C555-4329-9E4A-7895944041D0_r7vgpm").toURL()
]

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
      (item) => item.id === product.id // Use id instead of name
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

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
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
        id="collar-001"  // Unique ID for this product
        images={collarImages}
        onImageClick={() => handleImageClick(collarImages)}
        name="Collar"
        price={120}
        description="Made entirely from 100% cotton, this collar ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
        material={'100% cotton'}
        colors={['black', '#555555', '#white']}
      />

      <CardProduct
        addToCart={addToCart}
        id="scarf-002"  // Unique ID for this product
        images={scarfImages}
        onImageClick={() => handleImageClick(scarfImages)}
        name="Scarf"
        price={180}
        description="Made entirely from 100% cotton, this scarf ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
        material={'100% Wool'}
        colors={['#333333', '#555555', '#999999']}
      />

<CardProduct
        addToCart={addToCart}
        id="skirt"  // Unique ID for this product
        images={skirtImages}
        onImageClick={() => handleImageClick(scarfImages)}
        name="Skirt"
        price={560}
        description="Patchwork-style boucle skirt featuring a bold black and purple checkerboard pattern. Made from a soft yarn blend for both warmth and comfort."
        material={'50% wool, 50% acrilic'}
        colors={['#333333', '#555555', '#999999']}
      />


      <CardProduct
        addToCart={addToCart}
        id="trousers-003"  // Unique ID for this product
        images={trousersImages}
        onImageClick={() => handleImageClick(trousersImages)}
        name="Trousers"
        price={480}
        description="Made entirely from 100% cotton, these trousers ensure comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
        material={'80% wool  20% cashmere'}
        colors={['#333333', '#555555', '#999999']}
      />

      <CardProduct
        addToCart={addToCart}
        id="dress-004"  // Unique ID for this product
        images={dress}
        onImageClick={() => handleImageClick(dress)}
        name="Men's dress"
        price={680}
        description="Designed for both comfort and style, this piece features a cozy wool-blend fabric in a classic checkerboard pattern. The deep V-neck and ribbed hem add a touch of elegance, while the relaxed fit allows for effortless layering. Pair it with combat boots and high socks for a trendy street-style look."
        material={"100% sheep wool"}
        colors={['beige', 'brown', '#999999']}
      />

<CardProduct
        addToCart={addToCart}
        id="gloves-001"  // Unique ID for this product
        images={gloves}
        onImageClick={() => handleImageClick(gloves)}
        name="Gloves"
        price={120}
        description="Elegant handmade gloves crafted from 100% cotton lace. Lightweight, breathable, and detailed with black buttons for a timeless vintage touch."
        material={"100% cotton"}
        colors={['black', 'beige', 'white', 'grey']}
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
