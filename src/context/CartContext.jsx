import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import StockAlertModal from '../components/StockAlertModal';
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
  
  const [stockAlertData, setStockAlertData] = useState(null);

  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (item?.quantity || 1), 0)
    : 0;

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems || []));
  }, [cartItems]);

  const addToCart = async (product, quantity = 1, selectedVoucher = null) => {
    const id = product.id || product.id_sanpham;
    try {
      const branchId = (() => { try { return JSON.parse(localStorage.getItem('activeBranch'))?.id_chinhanh; } catch { return null; } })();
      const res = await axios.get(`https://webistetoiyeupc-backend-laravel.onrender.com/api/products/${id}/check-stock${branchId ? `?branch_id=${branchId}` : ''}`);
      const { is_available, stock, other_branches } = res.data;
      if (!is_available || stock < quantity) {
        setStockAlertData({ stock, otherBranches: other_branches });
        return;
      }
      setCartItems(prev => {
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
    } catch (error) {
      console.error("Lỗi kiểm tra tồn kho", error);
      alert('Lỗi hệ thống, không thể thêm vào giỏ lúc này!');
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setCurrentProduct(null), 300);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => (item.id || item.id_sanpham) !== productId));
  };

  const updateQuantity = async (productId, delta) => {
    if (delta > 0) {
      try {
        const branchId = (() => { try { return JSON.parse(localStorage.getItem('activeBranch'))?.id_chinhanh; } catch { return null; } })();
        const res = await axios.get(`https://webistetoiyeupc-backend-laravel.onrender.com/api/products/${productId}/check-stock${branchId ? `?branch_id=${branchId}` : ''}`);
        const { stock, other_branches } = res.data;
        setCartItems(prev => prev.map(item => {
          if ((item.id || item.id_sanpham) === productId) {
            if (item.quantity >= stock) {
              setStockAlertData({ stock, otherBranches: other_branches });
              return item;
            }
            return { ...item, quantity: Math.min(item.quantity + delta, stock) };
          }
          return item;
        }));
      } catch (error) {
        console.error("Lỗi kiểm tra tồn kho", error);
      }
    } else {
      setCartItems(prev => prev.map(item => {
        if ((item.id || item.id_sanpham) === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      }));
    }
  };

  const setQuantity = async (productId, quantity) => {
    try {
      const branchId = (() => { try { return JSON.parse(localStorage.getItem('activeBranch'))?.id_chinhanh; } catch { return null; } })();
      const res = await axios.get(`https://webistetoiyeupc-backend-laravel.onrender.com/api/products/${productId}/check-stock${branchId ? `?branch_id=${branchId}` : ''}`);
      const { stock, other_branches } = res.data;
      
      const newQuantity = Math.min(Math.max(1, quantity), stock);
      if (quantity > stock) {
         setStockAlertData({ stock, otherBranches: other_branches });
      }
      
      setCartItems(prev => prev.map(item => {
        if ((item.id || item.id_sanpham) === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      }));
    } catch (error) {
      console.error("Lỗi kiểm tra tồn kho", error);
      setCartItems(prev => prev.map(item => {
        if ((item.id || item.id_sanpham) === productId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      }));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, setQuantity, clearCart, isModalOpen, currentProduct, closeModal }}>
      {children}
      <StockAlertModal 
        isOpen={!!stockAlertData} 
        data={stockAlertData} 
        onClose={() => setStockAlertData(null)} 
      />
    </CartContext.Provider>
  );
};
