import { useState, useEffect } from "react";
import { useFavorites } from "../../components/FavoriteContext";
import { useCart } from "../../components/CartContext";
import CartSummary from "../../components/CartSummary";
import WishedProduct from "../../components/WishedProduct";
import styles from "./FavoritesPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrashAlt, 
  faShoppingBag, 
  faSpinner,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const FavoritesPage = () => {
  const { favorites, clearFavorites } = useFavorites();
  const { cartItems } = useCart();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    const handleFavoritesUpdated = () => {
      setLoading(false);
    };
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
      clearTimeout(timer);
    };
  }, []);

  const handleCloseCart = () => {
    setCartIsOpen(false);
  };
  
  const handleClearFavoritesClick = () => {
    setShowClearConfirmation(true);
  };
  
  const handleConfirmClear = () => {
    clearFavorites();
    setShowClearConfirmation(false);
  };
  
  const handleCancelClear = () => {
    setShowClearConfirmation(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        <p>Loading your wishlist...</p>
      </div>
    );
  }

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
      {showClearConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <div className={styles.confirmationIcon}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3>Clear Wishlist?</h3>
            <p>Are you sure you want to remove all items from your wishlist? This action cannot be undone.</p>
            <div className={styles.confirmationButtons}>
              <button 
                onClick={handleCancelClear}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmClear}
                className={styles.confirmButton}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.header}>
        <div style={{display:'flex', flexDirection:'row', alignItems:'center', width: '100%', justifyContent:'space-between'}}>
  <div className={styles.titleSection}>
    <div style={{display: 'flex', flexDirection: 'column'}}>
    <h1 className={styles.title}>My Wishlist</h1>
    <p className={styles.subtitle}>{favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved</p>
  </div>
  </div>
  
  <div className={styles.headerActions}>
    <button 
      onClick={handleClearFavoritesClick} 
      className={styles.clearButton}
      aria-label="Clear all favorites"
    >
      <FontAwesomeIcon icon={faTrashAlt} />
      <span>Clear All</span>
    </button>
  </div>
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