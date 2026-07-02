import React from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import news1 from "../../../../assets/images/tintuccongnghe1.png";
import news2 from "../../../../assets/images/tintuccongnghe2.png";
import news3 from "../../../../assets/images/tintuccongnghe3.png";

const newsData = [
  {
    id: 1,
    img: news1,
    date: "14/05/2026",
    category: "News Gaming",
    title: "Tổng Hợp Các Mẫu Build PC Chơi Game Đỉnh Cao Năm 2026",
    desc: "LG AT Khai Mạc Giải Khởi Động 'MÀN HÌNH CHƠI GAME XUẤT SẮC' TẠI VIỆT NAM GAME AWARDS 2026. MÀN HÌNH 45 INCH, ĐỘ PHÂN GIẢI 5120x1440 VÀ TỈ LỆ",
  },
  {
    id: 2,
    img: news2,
    date: "10/05/2026",
    category: "Technology",
    title: "Loạt Tính Năng Mới Trên Android 17",
    desc: "ANDROID 17 TRÌNH LÀNG TẠI SỰ KIỆN GOOGLE I/O 2026 - TẠO CÚ HÍCH NĂM TRƯỚC. KIỂM DUYỆT ỨNG DỤNG BẰNG AI TRƯỚC SỰ CỐ ĐÁNH GIÁ MỚI.",
  },
  {
    id: 3,
    img: news3,
    date: "08/05/2026",
    category: "CPU",
    title: "Chip PC Tự Nhà Lê Vươn Trung Quốc Cán Mốc Doanh Số Một Triệu",
    desc: "LOONGSON QUẢNG BÁ TỰ LÀ NHÀ SẢN XUẤT TIẾNG TĂM TẠI TRUNG QUỐC, ĐẠT DOANH SỐ MỘT TRIỆU CHIP NĂM",
  },
];

const TechNews = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="text-center mb-7">
          <h2 className="text-[24px] font-black text-gray-900 mb-1.5">TIN TỨC CÔNG NGHỆ</h2>
          <p className="text-[14px] text-gray-500">Cập nhật tin tức công nghệ mới nhất từ ToiYeuPC</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {newsData.map((n) => (
            <Link
              key={n.id}
              to={ROUTERS.CLIENT.NEWS}
              className="border border-gray-200 rounded-xl overflow-hidden block hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
            >
              <div className="h-[180px] overflow-hidden">
                <img
                  src={n.img}
                  alt={n.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded">
                    {n.category}
                  </span>
                  <span className="text-[11px] text-gray-400">{n.date}</span>
                </div>
                <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
                  {n.title}
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-3">{n.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechNews;
