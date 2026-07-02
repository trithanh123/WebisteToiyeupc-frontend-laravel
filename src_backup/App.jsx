import React, { useEffect } from "react";
import RouterCustom from "./router.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BranchProvider } from "./context/BranchContext.jsx";

function App() {
  // "Bẫy" Token bắt dữ liệu từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // 1. Cất thẻ Token vào "ví" localStorage của trình duyệt
      localStorage.setItem('access_token', token);
      
      // 2. Xóa chữ token dài ngoằng trên URL đi cho đẹp
      window.history.replaceState({}, document.title, "/");
      
      // 3. Tải lại trang nhẹ một cái để Header cập nhật tên khách hàng
      window.location.reload();
    }
  }, []);

  return (
    <CartProvider>
      <BranchProvider>
        <RouterCustom />
      </BranchProvider>
    </CartProvider>
  );
}

export default App;
