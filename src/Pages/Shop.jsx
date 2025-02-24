import { useState } from "react";
import CardProduct from "../../components/CardProduct";
import CartSummary from "../../components/CartSummary";
import styles from "./Shop.module.css";
import { Cloudinary } from "@cloudinary/url-gen";

// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx", // Replace with your Cloudinary cloud name
  },
});

// Define your Cloudinary images (Multiple images for carousel)
const collarImages = [
  cld.image("collar_vzz5yo").toURL()
];

const scarfImages = [
  cld.image("image_6483441_8_lr6b1a").toURL(),
  cld.image("image_6483441_6_qhuykn").toURL(),
  cld.image("image_6483441_6_qhuykn").toURL(),
  cld.image("image_6483441_6_qhuykn").toURL(),
];

const trousersImages = [
  cld.image("trousers_x3ryc0").toURL(),
];

const Shop = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartIsOpen, setCartIsOpen] = useState(false);

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

  return (
    <div className={styles.shop}>
      <CardProduct
        addToCart={addToCart}
        images={collarImages}
        name="COLLAR"
        price={180}
        description="Made entirely from 100% cotton, this collar ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
      />

      <CardProduct
        addToCart={addToCart}
        images={scarfImages}
        name="SCARF"
        price={180}
        description="Made entirely from 100% cotton, this scarf ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
      />

      <CardProduct
        addToCart={addToCart}
        images={trousersImages}
        name="TROUSERS"
        price={180}
        description="Made entirely from 100% cotton, these trousers ensure comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
      />

      {cartIsOpen && (
        <CartSummary
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          onClose={handleCloseCart}
        />
      )}
    </div>
  );
};

export default Shop;
