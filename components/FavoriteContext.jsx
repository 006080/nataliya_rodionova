import React, { createContext, useContext, useState } from "react";

// Create a context for favorites
const FavoriteContext = createContext();

// Hook to use the FavoriteContext
export const useFavorites = () => {
  return useContext(FavoriteContext);
};

// Provider to wrap the app and provide the favorite context
export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);  // Store product ids as favorites

  // Toggle favorite status for a product
  const toggleFavorite = (product) => {
    // Check if the product is already in favorites
    const isAlreadyFavorite = favorites.some(fav => fav.id === product.id);

    if (isAlreadyFavorite) {
      // If product is already favorited, remove it from the list
      setFavorites(favorites.filter(fav => fav.id !== product.id));
    } else {
      // If product is not in favorites, add it
      setFavorites([...favorites, product]);
    }
  };

  // Check if a product is in favorites
  const isFavorite = (id) => {
    return favorites.some(fav => fav.id === id);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
