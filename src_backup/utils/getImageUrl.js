// utils/getImageUrl.js
// Tự động load tất cả hình ảnh từ assets/images để map với tên file từ database.
const allImages = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,svg,webp}', { eager: true });

export const getImageUrl = (url) => {
  if (!url) return null;
  // Nếu là đường dẫn URL tuyệt đối thì trả về luôn
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Trích xuất tên file (vd: "laptopgaming1.png" từ "images/laptopgaming1.png" hoặc "laptopgaming1.png")
  const fileName = url.split('/').pop();
  
  // Tìm kiếm trong danh sách ảnh đã import
  const entry = Object.entries(allImages).find(([path]) => path.endsWith('/' + fileName));
  
  // Nếu tìm thấy, trả về URL đã được Vite xử lý, ngược lại trả về url ban đầu
  return entry ? entry[1].default : url;
};
