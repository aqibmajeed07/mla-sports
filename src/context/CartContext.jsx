import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/api/cart', { product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/api/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart');
      setItems([]);
    } catch (error) {
      throw error;
    }
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity, 0
  );

  return (
    <CartContext.Provider value={{
      items,
      loading,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
