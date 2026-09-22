import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../api/services';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend when user logs in
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    if (user.role && user.role !== 'customer') {
      setCart([]);
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const payload = res.data?.data || res.data || {};
      const items = payload.items || [];
      setCart(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err?.response?.status !== 403) {
        console.error('Failed to fetch cart:', err);
      }
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Computed values
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((total, item) => {
    const price = item.variant?.price || item.product?.price || item.price || 0;
    return total + (price * (item.quantity || 1));
  }, 0);

  // Add to cart via backend API
  const addToCart = async (productId, variantId, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      await cartService.addToCart({ productId, variantId, quantity });
      await fetchCart();
      setIsCartOpen(true);
    } catch (err) {
      console.error('Add to cart failed:', err);
      const msg = err.response?.data?.message || 'Failed to add to cart';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await cartService.updateCartItem(cartItemId, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Update cart failed:', err);
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      await fetchCart();
    } catch (err) {
      console.error('Remove from cart failed:', err);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
    } catch (err) {
      console.error('Clear cart failed:', err);
    }
  };

  return (
    <CartContext.Provider value={{
      isCartOpen,
      setIsCartOpen,
      cart,
      loading,
      cartCount,
      cartTotal,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
