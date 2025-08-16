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
    cloudName: "dwenvtwyx",
  },
});

// Define Cloudinary images
const collarImages = [cld.image("collar_vzz5yo").toURL()];
const scarfImages = [
  cld.image("image_6483441_8_lr6b1a").toURL(),
  cld.image("image_6483441_6_qhuykn").toURL(),
  cld.image("image_6483441_9_txsndd").toURL(),
];
const skirtImages = [
  cld.image("Untitled-1_laensr").toURL(),
  cld.image("Burning_Man_imx0zw").toURL(),
];
const trousersImages = [cld.image("trousers_x3ryc0").toURL()];
const gloves = [cld.image("5E6EEA4C-C555-4329-9E4A-7895944041D0_r7vgpm").toURL()];
const dress = [
  cld.image("Dress_xyjue7").toURL(),
  // cld.image("IMG_6612_v48gkj").toURL(),
  // cld.image("7AF52139-EA8E-4317-B8A6-CE9C4380A3CA_fdpwos").toURL(),
];

const mandress = [
  cld.image("0B9C10B5-B616-4D36-AE73-D48E03C60EB2_e3t2x7").toURL(),
  cld.image("IMG_6612_v48gkj").toURL(),
  cld.image("7AF52139-EA8E-4317-B8A6-CE9C4380A3CA_fdpwos").toURL()

]

const Shop = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartColors, setCartColors] = useState([]);
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  // Handle preview carousel
  const handleImageClick = (images) => {
    setPreviewImages(images);
    setPreviewImage(images[0]);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
    setPreviewImages([]);
  };

  const addToCart = (product) => {
    const colorToUse = product.color || product.primaryColor || product.colors?.[0];

    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.color === colorToUse
    );

    if (existingIndex !== -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += product.quantity;
      setCartItems(updatedCart);

      const updatedColors = [...cartColors];
      updatedColors[existingIndex].quantity += product.quantity;
      setCartColors(updatedColors);
    } else {
      setCartItems([...cartItems, { ...product, color: colorToUse }]);
      setCartColors([
        ...cartColors,
        { id: product.id, color: colorToUse, quantity: product.quantity },
      ]);
    }

    setCartIsOpen(true);
  };

  const removeFromCart = (productId, productColor) => {
    setCartItems(
      cartItems.filter(
        (item) => !(item.id === productId && item.color === productColor)
      )
    );
    setCartColors(
      cartColors.filter(
        (item) => !(item.id === productId && item.color === productColor)
      )
    );
  };

  const handleCloseCart = () => setCartIsOpen(false);

  return (
    <div className={styles.shop}>
      <CardProduct
        addToCart={addToCart}
        id="collar-001"
        images={collarImages}
        onImageClick={() => handleImageClick(collarImages)}
        name="Collar"
        price={120}
        description="Crafted from 100% pure cotton, this timeless white collar adds an elegant accent to any look. Soft yet structured, it’s designed for versatility — perfect to pair with dresses, blouses, or knitwear for a refined touch."
        material="100% cotton"
        colors={["black", "#e6ff43b9", "#2d7e16b3", "white"]}
      // primaryColor="black"
      />

      <CardProduct
        addToCart={addToCart}
        id="scarf-002"
        images={scarfImages}
        onImageClick={() => handleImageClick(scarfImages)}
        name="Scarf"
        price={180}
        description="Made from 100% pure wool, this scarf is warm, soft, and naturally breathable — the perfect companion for colder days. Available in several shades of grey, offering subtle variations to match your personal style."
        material="100% Wool"
        colors={["#333333", "#555555", "#999999"]}
      // primaryColor="#333333"
      />

      <CardProduct
        addToCart={addToCart}
        id="trousers-003"
        images={trousersImages}
        onImageClick={() => handleImageClick(trousersImages)}
        name="Trousers"
        price={480}
        description="These handmade trousers, crafted from 100% wool, are designed as a unique two-piece set: classic grey wool trousers paired with a detachable overlay. The overlay features a handmade ornamental insert, adding an artisanal touch and elevating the design with subtle sophistication."
        material="80% wool 20% cashmere"
        // colors={["#333333", "#555555", "#999999"]}
        primaryColor="grey"
      />

      <CardProduct
        addToCart={addToCart}
        id="skirt"
        images={skirtImages}
        onImageClick={() => handleImageClick(skirtImages)}
        name="Skirt"
        price={560}
        description="Patchwork-style fully hand-knitted boucle skirt is crafted from fine yarn and showcases a distinctive checkerboard pattern. Designed with both style and practicality in mind, it features two slit pockets hidden in the side seams, neatly finished with a soft lining for comfort and durability."
        material="50% wool, 50% acrylic"
        colors={["#B611ED", "#CCF045", "#0028F0"]}
        primaryColor="black"
      />

      <CardProduct
        addToCart={addToCart}
        id="gloves-001"
        images={gloves}
        onImageClick={() => handleImageClick(gloves)}
        name="Gloves"
        price={120}
        description="Delicately handmade from 100% pure cotton, these lace gloves embody elegance and timeless charm. Their intricate openwork design highlights the artistry of traditional craftsmanship, making them a refined accessory for both everyday sophistication and special occasions."
        material="100% cotton"
        colors={["black", "beige", "white", "grey"]}
      // primaryColor="black"
      />

      <CardProduct
        addToCart={addToCart}
        id="dress"
        images={dress}
        onImageClick={() => handleImageClick(Dress)}
        name="Nylon Dress"
        price={120}
        description="A statement piece straight from the runway – this nylon dress with a refined gray insert embodies modern minimalism and bold design. Lightweight yet structured, it drapes gracefully while the contrasting detail adds a sophisticated edge."
        material="100% nylon"
        // colors={["black", "beige", "white", "grey"]}
        primaryColor="yellow"
      />

      <CardProduct
        addToCart={addToCart}
        id="mandress"
        images={mandress}
        onImageClick={() => handleImageClick(dress)}
        name="Men's dress"
        price={680}
        description="This unique men’s dress is entirely handcrafted, showcasing a bold chessboard pattern that blends tradition with contemporary style. Thoughtfully designed with welt pockets in the side seams, it offers both refined detail and practical function. The meticulous craftsmanship highlights the brand’s dedication to artistry and individuality, making this garment a statement piece for the modern wardrobe."
        material="100% sheep wool"
        colors={["beige", "brown", "#999999"]}

      />



      {cartIsOpen && (
        <CartSummary
          cartItems={cartItems}
          cartColors={cartColors}
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
                infinite: false,
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
