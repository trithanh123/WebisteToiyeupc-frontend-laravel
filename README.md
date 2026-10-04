# ToiYeuPC - Frontend Storefront

<div align="center">
  <img src="https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.svg" width="100" alt="Vite Logo"> &nbsp; &nbsp; &nbsp;
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="150" alt="Laravel Logo">
</div>

## 📌 Giới thiệu dự án
Đây là phần giao diện người dùng (Frontend) của hệ thống **ToiYeuPC** - nền tảng thương mại điện tử chuyên biệt về linh kiện máy tính và tư vấn lắp ráp cấu hình PC. 

Giao diện được thiết kế hướng tới tối ưu hóa trải nghiệm người dùng (UX/UI), giúp khách hàng dễ dàng tìm kiếm linh kiện mong muốn thông qua công cụ tìm kiếm ngữ nghĩa thông minh và tự do sáng tạo cấu hình máy tính yêu thích với bộ công cụ kiểm tra tương thích trực quan.

## 🚀 Tính năng nổi bật
* **Giao diện Build PC (PC Builder):** Công cụ tương tác cho phép người dùng chọn từng linh kiện (Mainboard, CPU, VGA,...) và tự động cảnh báo/gợi ý nếu có sự không tương thích.
* **Tìm kiếm thông minh (AI Semantic Search):** Tích hợp thanh tìm kiếm thông minh kết nối với Backend AI, giúp người dùng tìm sản phẩm bằng ngôn ngữ tự nhiên.
* **Danh mục sản phẩm trực quan:** Hiển thị và lọc các linh kiện PC theo hãng, thông số kỹ thuật, tầm giá,...
* **Giỏ hàng & Thanh toán:** Giao diện quản lý giỏ hàng mượt mà, hỗ trợ quy trình đặt hàng nhanh chóng.
* **Trang cá nhân:** Quản lý lịch sử mua hàng, theo dõi đơn hàng và lưu cấu hình PC yêu thích.

## 🛠️ Công nghệ sử dụng
* **Framework/Thư viện chính:** React (với Vite) / Laravel Blade *(tùy thuộc vào cấu trúc view bạn đang sử dụng)*.
* **Giao tiếp API:** Axios (hoặc Fetch API) để gọi dữ liệu từ Backend Laravel và Python FastAPI.
* **Quản lý state:** Redux, Context API hoặc Zustand (nếu áp dụng).
* **Styling:** Tailwind CSS / Bootstrap / CSS3.

## ⚙️ Yêu cầu hệ thống
* Node.js (phiên bản LTS khuyến nghị)
* npm hoặc yarn
* (Tùy chọn) PHP/Composer nếu giao diện được tích hợp trực tiếp trong cấu trúc Laravel.

## 💻 Hướng dẫn cài đặt

1. **Clone repository về máy:**
   ```bash
   git clone [https://github.com/trithanh123/WebisteToiyeupc-frontend-laravel.git](https://github.com/trithanh123/WebisteToiyeupc-frontend-laravel.git)
   cd WebisteToiyeupc-frontend-laravel
