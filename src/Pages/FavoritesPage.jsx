import { useState } from "react";
import { useFavorites } from "../../components/FavoriteContext";
import { useCart } from "../../components/CartContext";
import CartSummary from "../../components/CartSummary";
import WishedProduct from "../../components/WishedProduct";
import styles from "./FavoritesPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faShoppingBag } from "@fortawesome/free-solid-svg-icons";

const FavoritesPage = () => {
  const { favorites, clearFavorites } = useFavorites();
  const { cartItems } = useCart();
  const [cartIsOpen, setCartIsOpen] = useState(false);

  const handleCloseCart = () => {
    setCartIsOpen(false);
  };


  if (favorites.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <FontAwesomeIcon icon={faShoppingBag} />
        </div>
        <h2>Your Wishlist is Empty</h2>
        <p>You haven't added any items to your wishlist yet.</p>
        <p>Click the heart icon on products you love to add them here!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>My Wishlist</h1>
          <p className={styles.subtitle}>{favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        
        <div className={styles.headerActions}> 
          
          <button 
            onClick={clearFavorites} 
            className={styles.clearButton}
            aria-label="Clear all favorites"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className={styles.wishlistContainer}>
        {favorites.map((product) => (
          <WishedProduct
            key={product.id}
            id={product.id}
            name={product.name}
            images={product.image ? [product.image] : []}
            price={product.price}
            description={product.description || "No description available for this product."}
            material={product.material || "Not specified"}
            color={product.color || "Not specified"}
          />
        ))}
      </div>

      {cartIsOpen && (
        <CartSummary
          cartItems={cartItems}
          onClose={handleCloseCart}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
