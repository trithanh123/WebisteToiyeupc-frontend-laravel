import React from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import rx5060Img from "../../../../assets/images/RX5060 1.png";

const specs = [
  "CPU: INTEL CORE I5 13400",
  "RAM: 16GB DDR4 3200MHz",
  "SSD: 512GB NVMe",
  "VGA: RTX 5060 8GB",
  "CASE: FULL ATX",
  "PSU: 650W 80+ Bronze",
];

const PromoBanner = () => {
  return (
    <section className="bg-[#f0f2f5] py-6">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="bg-red-600 rounded-2xl px-12 py-8 grid grid-cols-[1fr_auto_1fr] items-center gap-8 overflow-hidden">
          <div className="text-white">
            <p className="text-[11px] font-semibold opacity-75 uppercase tracking-[1.5px] mb-1.5">
              CHƯƠNG TRÌNH KHUYẾN MÃI
            </p>
            <h2 className="text-[36px] font-black leading-tight mb-3 text-justify">
              PC ToiYeuPC <br />
              <span className="text-grays-60">Gaming RX 5060</span>
            </h2>
            <p className="text-[12px] opacity-85 max-w-[240px] mb-5 leading-relaxed">
              Chương trình Khuyến Mãi Cho HSSV Kỳ Thi THPT Quốc gia 2026 - Giảm Giá Đặc Biệt Cho Các Cấu Hình PC Gaming Hiệu Năng Cao, Phù Hợp Cho Học Tập Và Giải Trí.
            </p>
            <Link
              to="/san-pham/15"
              className="inline-block bg-white text-red-600 font-bold text-[14px] px-6 py-2.5 rounded-md hover:bg-red-50 transition-colors"
            >
              MUA NGAY →
            </Link>
          </div>

          {}
          <div className="flex justify-center items-end">
            <img
              src={rx5060Img}
              alt="PC I5/5060"
              className="h-[360px] object-contain drop-shadow-2xl"
            />
          </div>

          {}
          <div className="bg-black/15 rounded-xl px-5 py-4 justify-self-end min-w-[200px]">
            <p className="text-white/60 text-[10px] font-bold tracking-[1.5px] uppercase mb-2.5">
              CẤU HÌNH
            </p>
            <ul className="text-white/90 text-[12px] flex flex-col gap-1.5 list-none p-0 m-0">
              {specs.map((s, i) => (
                <li key={i} className={i === 0 ? "font-bold text-[13px]" : ""}>{s}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
