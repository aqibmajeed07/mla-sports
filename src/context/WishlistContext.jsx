import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/api/wishlist');
      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    try {
      await api.post('/api/wishlist', { product_id: productId });
      await fetchWishlist();
    } catch (error) {
      throw error;
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`/api/wishlist/${itemId}`);
      await fetchWishlist();
    } catch (error) {
      throw error;
    }
  };

  const isInWishlist = (productId) => {
    return items.some((item) => item.product_id === productId);
  };

  const getWishlistItem = (productId) => {
    return items.find((item) => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      getWishlistItem,
      fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
