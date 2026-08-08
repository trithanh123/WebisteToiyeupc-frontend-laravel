import { useState, useEffect } from 'react';
import axios from 'axios';
export const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Hải Phòng', 'Nha Trang'];

export const useAddressBook = () => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await axios.get('https://webistetoiyeupc-backend-laravel.onrender.com/api/addresses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          const mappedAddresses = res.data.data.map(dbAddr => ({
            id: dbAddr.id_diachinguoidung,
            name: dbAddr.ten_nguoinhan,
            phone: dbAddr.sdt_nguoinhan,
            province: dbAddr.ma_thanhpho, // Để lấy tên thay vì ID thì cần JOIN DB, nhưng tạm thời lưu ID
            district: dbAddr.ma_quan,
            ward: dbAddr.ma_phuong,
            detail: dbAddr.diachi_chitiet,
            isDefault: dbAddr.matudien_diachi
          }));
          setAddresses(mappedAddresses);
        }
      } catch (error) {
        console.log("Lỗi tải danh sách địa chỉ:", error);
      }
    };
    fetchAddresses();
  }, []);



  const addAddress = async (form) => {
    try {
      const payload = {
        ten_nguoinhan: form.name,
        sdt_nguoinhan: form.phone,
        ma_thanhpho: form.province,  // Chú ý: Backend đang cần số Integer (ID tỉnh), bạn nhớ xử lý đoạn này nhé
        ma_quan: form.district,      // Cần ID Quận (Integer)
        ma_phuong: form.ward,        // Cần ID Phường (Integer)
        diachi_chitiet: form.detail,
        matudien_diachi: form.isDefault
      };
      // 2. Lấy Token đăng nhập từ LocalStorage (để chứng minh mình đã đăng nhập)
      const token = localStorage.getItem('access_token');
      // 3. Gọi Axios POST xuống Backend
      const response = await axios.post('https://webistetoiyeupc-backend-laravel.onrender.com/api/addresses', payload, {
        headers: {
          'Authorization': `Bearer ${token}` // Gắn token vào thẻ thông hành
        }
      });
      // 4. Nếu API trả về thành công (HTTP 201)
      if (response.data.status === 'success') {
        // Backend trả về tên cột trong DB (ten_nguoinhan, sdt_nguoinhan)
        // Ta phải đổi tên (Map) lại cho khớp với form của Frontend (name, phone)
        const dbAddr = response.data.data;
        const newAddr = {
          id: dbAddr.id_diachinguoidung,
          name: dbAddr.ten_nguoinhan,
          phone: dbAddr.sdt_nguoinhan,
          province: dbAddr.ma_thanhpho,
          district: dbAddr.ma_quan,
          ward: dbAddr.ma_phuong,
          detail: dbAddr.diachi_chitiet,
          isDefault: dbAddr.matudien_diachi
        };
        
        // Cập nhật lên màn hình
        setAddresses([...addresses, newAddr]);
        alert("Thêm địa chỉ thành công!"); 
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (error) {
      // 6. Xử lý Lỗi (Validation rẽ nhánh 1 hoặc Rẽ nhánh 2.1 giới hạn 5 địa chỉ)
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        // Bắt lỗi giới hạn 5 địa chỉ (Rẽ nhánh 2.1)
        if (errors.limit_address) {
          return { success: false, message: errors.limit_address[0] };
        } else {
          // Lấy tin nhắn lỗi đầu tiên
          const firstErrorKey = Object.keys(errors)[0];
          return { success: false, message: errors[firstErrorKey][0] };
        }
      }
      return { success: false, message: "Có lỗi xảy ra khi kết nối Server!" };
    }
  };

  const updateAddress = async (id, form) => {
    try {
      const payload = {
        ten_nguoinhan: form.name,
        sdt_nguoinhan: form.phone,
        ma_thanhpho: form.province,
        ma_quan: form.district,
        ma_phuong: form.ward,
        diachi_chitiet: form.detail,
        matudien_diachi: form.isDefault
      };
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`https://webistetoiyeupc-backend-laravel.onrender.com/api/addresses/${id}`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        const dbAddr = response.data.data;
        const updatedAddr = {
          id: dbAddr.id_diachinguoidung,
          name: dbAddr.ten_nguoinhan,
          phone: dbAddr.sdt_nguoinhan,
          province: dbAddr.ma_thanhpho,
          district: dbAddr.ma_quan,
          ward: dbAddr.ma_phuong,
          detail: dbAddr.diachi_chitiet,
          isDefault: dbAddr.matudien_diachi
        };
        
        let updated = addresses.map(a => a.id === id ? updatedAddr : a);
        if (form.isDefault) {
          updated = updated.map(a => ({ ...a, isDefault: a.id === id }));
        }
        setAddresses(updated);
        alert("Cập nhật địa chỉ thành công!"); 
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (error) {
       if (error.response && error.response.data.errors) {
         const errors = error.response.data.errors;
         const firstErrorKey = Object.keys(errors)[0];
         return { success: false, message: errors[firstErrorKey][0] };
       } else {
         return { success: false, message: "Lỗi cập nhật địa chỉ" };
       }
    }
  };

  const deleteAddress = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`https://webistetoiyeupc-backend-laravel.onrender.com/api/addresses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setAddresses(addresses.filter(a => a.id !== id));
        alert("Xóa địa chỉ thành công!");
      }
    } catch (error) {
       if (error.response && error.response.data.message) {
         alert(error.response.data.message);
       } else {
         alert("Lỗi xóa địa chỉ");
       }
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`https://webistetoiyeupc-backend-laravel.onrender.com/api/addresses/${id}/default`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
      }
    } catch (error) {
       console.log(error);
       alert("Lỗi thiết lập địa chỉ mặc định");
    }
  };

  return {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};
