import React from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import pcImg           from "../../../../assets/images/pc 1.png";
import laptopImg       from "../../../../assets/images/laptop 1.png";
import laptopGamingImg from "../../../../assets/images/laptopgamming 2.png";
import manhinhImg      from "../../../../assets/images/manhinh.png";
import banphimImg      from "../../../../assets/images/banphim 1.png";
import chuotImg        from "../../../../assets/images/chuot 1.png";
const cards = [
  {
    label: "Hãy Bắt Đầu", titlePre: "Chọn", title: "MÁY TÍNH", img: pcImg,
    bg: "bg-[#27272a]", btnBg: "bg-[#ef4444]", textAccent: "text-gray-400", colSpan: "col-span-1",
    imgClass: "right-3 bottom-3 w-[45%] max-h-[80%]" 
  },
  {
    label: "Sảng Khoái", titlePre: "Mua", title: "LAPTOP", img: laptopImg,
    bg: "bg-gradient-to-br from-[#6b7280] to-[#9ca3af]", btnBg: "bg-[#3b82f6]", textAccent: "text-gray-200", colSpan: "col-span-1",
    imgClass: "right-[-10px] top-6 w-[55%] max-h-[60%]" 
  },
  {
    label: "Trải Nghiệm", titlePre: "Mua", title: "LAPTOP GM", img: laptopGamingImg,
    bg: "bg-gradient-to-br from-[#452020] to-[#2d1b1b]", btnBg: "bg-[#ef4444]", textAccent: "text-white/40", colSpan: "col-span-2",
    imgClass: "right-8 top-6 w-[35%] max-h-[75%]" 
  },
  {
    label: "Nâng Cao", titlePre: "Chọn", title: "MÀN HÌNH", img: manhinhImg,
    bg: "bg-gradient-to-r from-[#ec4899] to-[#6b21a8]", btnBg: "bg-[#3b82f6]", textAccent: "text-white/40", colSpan: "col-span-2",
    imgClass: "right-8 bottom-6 w-[35%] max-h-[70%]" 
  },
  {
    label: "Không Lo", titlePre: "Chọn", title: "BÀN PHÍM", img: banphimImg,
    bg: "bg-gradient-to-b from-[#60a5fa] to-[#e2e8f0]", btnBg: "bg-[#ef4444]", textAccent: "text-gray-400", colSpan: "col-span-1",
    imgClass: "right-3 top-8 w-[55%] max-h-[50%]" 
  },
  {
    label: "Muốn thì", titlePre: "Chọn", title: "CHUỘT", img: chuotImg,
    bg: "bg-gradient-to-br from-[#ef4444] to-[#7e22ce]", btnBg: "bg-gradient-to-r from-[#dc2626] to-[#6b21a8]", textAccent: "text-white/50", colSpan: "col-span-1",
    imgClass: "right-4 bottom-4 w-[35%] max-h-[75%]" 
  },
];

const CategoryCards = () => {
  return (
    <section className="bg-white py-6">
      <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-4 gap-5">
        
        {cards.map((card, i) => (
          <Link
            key={i}
            to={ROUTERS.CLIENT.PRODUCTS}
            className={`relative group flex flex-col justify-center px-6 lg:px-8 py-6 rounded-3xl h-[240px] overflow-hidden transition-all duration-300 hover:opacity-95 hover:-translate-y-1 shadow-md ${card.bg} ${card.colSpan}`}
          >
            <div className="relative z-10 flex flex-col items-start gap-0.5 max-w-[55%]">
              <span className="text-[12px] lg:text-[13px] font-medium text-white/90">
                {card.label}
              </span>
              <span className="text-[26px] lg:text-[30px] font-bold text-white leading-none tracking-wide">
                {card.titlePre}
              </span>
              <span className={`text-[28px] lg:text-[34px] font-black uppercase leading-tight tracking-tight break-words ${card.textAccent}`}>
                {card.title}
              </span>
              
              <span className={`inline-block mt-3 text-white text-[12px] lg:text-[13px] font-bold px-5 py-2.5 rounded-full shadow-sm transition-transform group-hover:scale-105 ${card.btnBg}`}>
                Trang Chủ
              </span>
            </div>
            <img
              src={card.img}
              alt={card.title}
              className={`absolute object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 z-0 ${card.imgClass}`}
            />
          </Link>
        ))}
        
      </div>
    </section>
  );
};

export default CategoryCards;
