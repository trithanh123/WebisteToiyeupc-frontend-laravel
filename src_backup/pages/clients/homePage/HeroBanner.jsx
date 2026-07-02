import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../utils/route";
import laptopImg from "../../../assets/images/laptop 1.png";
import pcImg from "../../../assets/images/pc 1.png";
import banner1 from "../../../assets/images/banner-slider3.png";
import banner2 from "../../../assets/images/banner-slider4.png";
import banner3 from "../../../assets/images/banner-silde4.png";
const banners = [banner1, banner2, banner3];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
const totalSlides = 4; // Tổng cộng có 4 slide (1 slide Figma + 3 slide ảnh)
  // Auto-slide mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const next = () => setCurrent((c) => (c + 1) % totalSlides);
  const prev = () => setCurrent((c) => (c - 1 + totalSlides) % totalSlides);
  return (
    <section className="bg-white py-6">
      {/* Khung chính bọc toàn bộ Slider */}
      <div className="max-w-[1280px] mx-auto relative group overflow-hidden rounded-[24px] shadow-sm">
        
        {/* Đường ray trượt (Bắt buộc phải bọc CẢ 4 SLIDE ở trong này) */}
        <div 
          className="flex transition-transform duration-700 ease-in-out h-[560px]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          
          {/* ================= SLIDE 0: GIAO DIỆN FIGMA CHÍNH ================= */}
          <div className="w-full shrink-0 h-full bg-gradient-to-br from-[#e1e3e6] to-[#d1d5db] relative flex px-8 py-10 select-none">
            <span className="absolute top-[68%] -translate-y-1/2 left-0 text-[140px] lg:text-[170px] font-black text-white/70 tracking-tight whitespace-nowrap z-0 pointer-events-none leading-none">
              BUILD PC
            </span>

            {/* Cột Trái */}
            <div className="relative z-10 w-[42%] flex flex-col justify-between h-full">
              <div className="mb-auto">
                <p className="font-extrabold text-[16px] uppercase text-black mb-1.5 tracking-wide">TÔIYEUPC</p>
                <div className="text-[40px] lg:text-[46px] font-black uppercase text-black leading-[1.1] tracking-tight">
                  <p>Cửa Hàng</p><p>Chuyên</p><p>Bán Linh</p><p>Kiện Máy</p><p>Tính.</p>
                </div>
              </div>
              <Link
                to={ROUTERS.CLIENT.PRODUCTS}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-3.5 px-6 rounded-full w-max transition-colors text-[15px] shadow-md mt-auto relative z-20"
              >
                Hãy Ghé Danh Mục
              </Link>
            </div>

            {/* Ở Giữa */}
            <img src={laptopImg} alt="Laptop" className="absolute left-[48%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[480px] -rotate-[15deg] z-20 drop-shadow-2xl object-contain pointer-events-none" />

            {/* Cột Phải */}
            <div className="relative z-10 w-[35%] ml-auto flex flex-col justify-between h-full items-end">
              <img src={pcImg} alt="PC Case" className="h-[220px] lg:h-[270px] object-contain drop-shadow-xl mr-4" />
              <div className="flex flex-col gap-1.5 max-w-[260px] text-left relative z-20">
                <p className="font-black text-[13px] uppercase text-black">Giới thiệu về chúng tôi</p>
                <p className="text-[11px] lg:text-[12px] font-bold text-gray-500 uppercase leading-[1.6]">
                  Chúng tôi có 5 chi nhánh khác nhau trên mỗi thành phố chi nhánh chính gần nhất ở Cao Lỗ Quận 8
                </p>
                {/* Nút mũi tên chuyển Slide */}
                <button
                  onClick={next}
                  className="w-[42px] h-[42px] mt-2 rounded-full bg-white border border-gray-300 flex items-center justify-center text-black hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <polyline points="14 6 20 12 14 18"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* =========== KẾT THÚC SLIDE 0 =========== */}

          {/* ================= SLIDE 1, 2, 3 ================= */}
          <div className="w-full shrink-0 h-full">
            <img src={banner1} alt="Khuyến mãi 1" className="w-full h-full object-cover" />
          </div>
          <div className="w-full shrink-0 h-full">
            <img src={banner2} alt="Khuyến mãi 2" className="w-full h-full object-cover" />
          </div>
          <div className="w-full shrink-0 h-full">
            <img src={banner3} alt="Khuyến mãi 3" className="w-full h-full object-cover" />
          </div>

        </div> 
        {/* === ĐÓNG ĐƯỜNG RAY TRƯỢT Ở ĐÂY === */}

        {/* Nút bấm lướt thủ công qua TRÁI (Hiện khi rê chuột vào) */}
        <button 
          onClick={prev}
          className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-30"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        {/* Dấu chấm điều hướng (Dots) ở dưới đáy */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {[0, 1, 2, 3].map((index) => (
            <button 
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all rounded-full ${
                current === index ? 'bg-red-500 w-8 h-2.5' : 'bg-white/70 hover:bg-white w-2.5 h-2.5'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;
