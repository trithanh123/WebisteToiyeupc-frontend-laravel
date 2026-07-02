import { useState, useEffect } from 'react';

export const PROVINCES = ['TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Cần Thơ','Bình Dương','Đồng Nai','Hải Phòng','Nha Trang'];

export const useAddressBook = () => {
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('user_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('user_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = (form) => {
    const newAddr = { ...form, id: Date.now() };
    const updated = form.isDefault
      ? addresses.map(a => ({ ...a, isDefault: false }))
      : [...addresses];
    
    // If it's the first address, make it default automatically
    if (updated.length === 0) {
      newAddr.isDefault = true;
    }

    setAddresses([...updated, newAddr]);
  };

  const updateAddress = (id, form) => {
    let updated = addresses.map(a => a.id === id ? { ...a, ...form } : a);
    if (form.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: a.id === id }));
    }
    setAddresses(updated);
  };

  const deleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};
