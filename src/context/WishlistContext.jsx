import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://127.0.0.1:8000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setWishlist(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const toggleWishlist = async (id_sanpham) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Vui lòng đăng nhập để sử dụng tính năng này!");
        return false;
      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/wishlist/toggle', 
        { id_sanpham },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.status === 'success') {
        if (response.data.action === 'added') {
          fetchWishlist();
          return true;
        } else {
          setWishlist(prev => prev.filter(p => p.id_sanpham !== id_sanpham));
          return false;
        }
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const isInWishlist = (id_sanpham) => {
    return wishlist.some(p => p.id_sanpham === id_sanpham);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, refresh: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
