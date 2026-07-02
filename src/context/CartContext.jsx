import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      const parsed = storedCart ? JSON.parse(storedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error reading cart from localStorage", error);
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const cartCount = Array.isArray(cartItems) 
    ? cartItems.reduce((acc, item) => acc + (item?.quantity || 1), 0)
    : 0;

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems || []));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedVoucher = null) => {
    setCartItems(prev => {
      const id = product.id || product.id_sanpham;
      const existingItem = prev.find(item => (item.id || item.id_sanpham) === id);
      if (existingItem) {
        return prev.map(item => 
          (item.id || item.id_sanpham) === id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedVoucher }];
    });

    setCurrentProduct({ ...product, quantity, selectedVoucher });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setCurrentProduct(null), 300);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => (item.id || item.id_sanpham) !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if ((item.id || item.id_sanpham) === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, isModalOpen, currentProduct, closeModal }}>
      {children}
    </CartContext.Provider>
  );
};
