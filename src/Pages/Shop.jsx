// import { useState } from "react";
// import CardProduct from "../../components/CardProduct";
// import CartSummary from "../../components/CartSummary";
// import styles from "./Shop.module.css";
// import { Cloudinary } from "@cloudinary/url-gen";

// // Initialize Cloudinary
// const cld = new Cloudinary({
//   cloud: {
//     cloudName: "dwenvtwyx", // Replace with your Cloudinary cloud name
//   },
// });

// // Define your Cloudinary images (Multiple images for carousel)
// const collarImages = [
//   cld.image("collar_vzz5yo").toURL()
// ];

// const scarfImages = [
//   cld.image("image_6483441_8_lr6b1a").toURL(),
//   cld.image("image_6483441_6_qhuykn").toURL(),
//   cld.image("image_6483441_9_txsndd").toURL(),
// ];

// const trousersImages = [
//   cld.image("trousers_x3ryc0").toURL(),
// ];

// const Shop = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [cartIsOpen, setCartIsOpen] = useState(false);

//   const addToCart = (product) => {
//     const existingProductIndex = cartItems.findIndex(
//       (item) => item.name === product.name
//     );

//     if (existingProductIndex !== -1) {
//       const updatedCartItems = [...cartItems];
//       updatedCartItems[existingProductIndex].quantity += product.quantity;
//       setCartItems(updatedCartItems);
//     } else {
//       setCartItems([...cartItems, product]);
//     }
//     setCartIsOpen(true);
//   };

//   const removeFromCart = (productName) => {
//     setCartItems(cartItems.filter((item) => item.name !== productName));
//   };

//   const handleCloseCart = () => {
//     setCartIsOpen(false);
//   };

//   return (
//     <div className={styles.shop}>
//       <CardProduct
//         addToCart={addToCart}
//         images={collarImages}
//         name="COLLAR"
//         price={180}
//         description="Made entirely from 100% cotton, this collar ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
//       />

//       <CardProduct
//         addToCart={addToCart}
//         images={scarfImages}
//         name="SCARF"
//         price={180}
//         description="Made entirely from 100% cotton, this scarf ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
//       />

//       <CardProduct
//         addToCart={addToCart}
//         images={trousersImages}
//         name="TROUSERS"
//         price={180}
//         description="Made entirely from 100% cotton, these trousers ensure comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment."
//       />

//       {cartIsOpen && (
//         <CartSummary
//           cartItems={cartItems}
//           removeFromCart={removeFromCart}
//           onClose={handleCloseCart}
//         />
//       )}
//     </div>
//   );
// };

// export default Shop;



// new version ==========================================================================

// import { useState, useEffect } from "react";
// import CardProduct from "../../components/CardProduct";
// import CartSummary from "../../components/CartSummary";
// import styles from "./Shop.module.css";

// const Shop = () => {
//   const [products, setProducts] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [cartIsOpen, setCartIsOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       // Adjust the URL to match your API endpoint
//       const response = await fetch('http://localhost:4000/api/products');
      
//       if (!response.ok) {
//         throw new Error(`HTTP error ${response.status}`);
//       }
      
//       const data = await response.json();
//       setProducts(data.products);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to fetch products:", err);
//       setError(`Failed to fetch products: ${err.message}`);
//       setLoading(false);
//     }
//   };

//   const addToCart = (product) => {
//     const existingProductIndex = cartItems.findIndex(
//       (item) => item.id === product.id
//     );

//     if (existingProductIndex !== -1) {
//       const updatedCartItems = [...cartItems];
//       updatedCartItems[existingProductIndex].quantity += product.quantity;
//       setCartItems(updatedCartItems);
//     } else {
//       setCartItems([...cartItems, product]);
//     }
//     setCartIsOpen(true);
//   };

//   const removeFromCart = (productId) => {
//     setCartItems(cartItems.filter((item) => item.id !== productId));
//   };

//   const handleCloseCart = () => {
//     setCartIsOpen(false);
//   };

//   if (loading) {
//     return <div className={styles.loading}>Loading products...</div>;
//   }

//   if (error) {
//     return <div className={styles.error}>{error}</div>;
//   }

//   return (
//     <div className={styles.shop}>
//       {products.length === 0 ? (
//         <div className={styles.noProducts}>No products available</div>
//       ) : (
//         products.map((product) => (
//           <CardProduct
//             key={product._id}
//             addToCart={addToCart}
//             id={product._id}
//             name={product.name}
//             price={product.price}
//             description={product.description || ""}
//             // If you have multiple images, you'll need to adjust this
//             images={[product.imageUrl]}
//           />
//         ))
//       )}

//       {cartIsOpen && (
//         <CartSummary
//           cartItems={cartItems}
//           removeFromCart={removeFromCart}
//           onClose={handleCloseCart}
//         />
//       )}
//     </div>
//   );
// };

// export default Shop;



import { useState, useEffect } from "react";
import { useCart } from "../../components/CartContext";
import CardProduct from "../../components/CardProduct";
import CartSummary from "../../components/CartSummary";
import styles from "./Shop.module.css";

const Shop = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(`Failed to fetch products: ${err.message}`);
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setCartIsOpen(true);
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  const handleCloseCart = () => {
    setCartIsOpen(false);
  };

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.shop}>
      {products.length === 0 ? (
        <div className={styles.noProducts}>No products available</div>
      ) : (
        products.map((product) => (
          <CardProduct
            key={product._id}
            addToCart={handleAddToCart}
            id={product._id}
            name={product.name}
            price={product.price}
            description={product.description || ""}
            images={product.imageUrls && product.imageUrls.length > 0 
              ? product.imageUrls 
              : product.imageUrl ? [product.imageUrl] : []}
          />
        ))
      )}

      {cartIsOpen && (
        <CartSummary
          cartItems={cartItems}
          removeFromCart={handleRemoveFromCart}
          onClose={handleCloseCart}
        />
      )}
    </div>
  );
};

export default Shop;