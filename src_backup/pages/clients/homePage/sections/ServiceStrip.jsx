import React from "react";
import iconDelivery from "../../../../assets/icons/2.png";
import iconPayment from "../../../../assets/icons/4.png";
import iconSupport from "../../../../assets/icons/1.png";
import iconGuarantee from "../../../../assets/icons/3.png";
const services = [
  {
    icon: <img src={iconDelivery} alt="Giao Hàng Thần Tốc" className="w-8 h-8 object-contain" />,
    title: "Giao Hàng Thần Tốc",
    title: "Giao Hàng Thần Tốc",
    sub: "Giao hàng nhanh Tận Tay",
  },
  {
    icon: <img src={iconPayment} alt="Thanh Toán Tiện Lợi" className="w-8 h-8 object-contain" />,
    title: "Thanh Toán Tiện Lợi",
    sub: "Thanh Toán Bằng VNPAY",
  },
  {
    icon: <img src={iconSupport} alt="Hỗ Trợ Khách Hàng 24/7" className="w-8 h-8 object-contain" />,
    title: "Hỗ Trợ Khách Hàng 24/7",
    sub: "Hotline: 1800 6304",
  },
  {
    icon: <img src={iconGuarantee} alt="Bảo Hành Nhanh Chóng" className="w-8 h-8 object-contain" />,
    title: "Bảo Hành Nhanh Chóng",
    sub: "Bảo hành chính hãng",
  },
];

const ServiceStrip = () => {
  return (
  /* Lớp nền trắng phủ full màn hình để che 2 bên mép */
    <div className="w-full bg-gray-100">
      <section className="max-w-[1280px] mx-auto bg-[#1a202c] border-y border-[#2d3748] py-[18px]">
        {/* Lưới chia 4 cột bên trong */}
        <div className="px-4 grid grid-cols-4">
          {services.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-5.5 px-8 ${i < services.length - 1 ? "border-r border-[#2d3748]" : ""}`}
            >
              <div className="shrink-0 text-red-500">{s.icon}</div>
              <div>
                <p className="text-[13px] font-bold text-white mb-0.5">{s.title}</p>
                <p className="text-[12px] text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
};
export default ServiceStrip;
