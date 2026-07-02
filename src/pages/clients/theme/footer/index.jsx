import React from "react";
import { Link } from "react-router-dom";
import bocongthuong from "../../../../assets/images/dathongbaobocongthuon 1.png";
import ghnLogo from "../../../../assets/images/vanchuyen 1.png";
import vnpayLogo from "../../../../assets/images/vnpay.png";
import codLogo from "../../../../assets/images/cod.png";

const Footer = () => {
  return (
    <footer>
      {}
      <div className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-5 gap-8">

          {}
          <div>
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-4">VỀ CHÚNG TÔI</h4>
            <ul className="flex flex-col gap-2">
              {["Giới thiệu", "Tuyển dụng", "Liên hệ"].map((t) => (
                <li key={t}><Link to="#" className="text-[13px] text-gray-500 hover:text-red-600 transition-colors no-underline">{t}</Link></li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-4">CHÍNH SÁCH</h4>
            <ul className="flex flex-col gap-2">
              {["Chính sách bảo hành", "Chính sách giao hàng", "Chính sách bảo mật"].map((t) => (
                <li key={t}><Link to="#" className="text-[13px] text-gray-500 hover:text-red-600 transition-colors no-underline">{t}</Link></li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-4">HƯỚNG DẪN</h4>
            <ul className="flex flex-col gap-2">
              {["Hỗ trợ khách hàng", "Bảo hành (330)", "Hướng dẫn mua hàng", "Hướng dẫn thanh toán", "Hướng dẫn trả góp"].map((t) => (
                <li key={t}><Link to="#" className="text-[13px] text-gray-500 hover:text-red-600 transition-colors no-underline">{t}</Link></li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-4">TỔNG ĐÀI HỖ TRỢ: 8:00 – 21:00</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Mua hàng", tel: "tel:18006304", num: "1800.6304" },
                { label: "Bảo hành", tel: "tel:18006305", num: "1800.6305" },
                { label: "Khiếu nại", tel: "tel:18006306", num: "1800.6306" },
              ].map((h) => (
                <li key={h.num} className="flex items-center gap-4">
                  <span className="text-[12px] text-gray-500 w-[70px]">{h.label}</span>
                  <a href={h.tel} className="text-[13px] font-bold text-red-600 no-underline hover:underline">{h.num}</a>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-3">ĐƠN VỊ VẬN CHUYỂN</h4>
            <div className="flex gap-2 mb-4 items-center">
              <img src={ghnLogo} alt="GHN" className="h-8 object-contain" />
            </div>
            <h4 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide mb-3">CÁCH THỨC THANH TOÁN</h4>
            <div className="flex gap-2 mb-4 items-center">
              <img src={vnpayLogo} alt="VNPAY" className="h-8 object-contain" />
              <img src={codLogo} alt="COD" className="h-8 object-contain" />
            </div>
            <img src={bocongthuong} alt="Đã thông báo Bộ Công Thương" className="h-10 object-contain" />
          </div>

        </div>
      </div>

      {}
      <div className="bg-[#1a202c] py-4">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between">
          <p className="text-[12px] text-gray-400 m-0">
            2026 – SHOP TOIYEUPC LUÔN PHỤC VỤ KHÁCH HÀNG TẬN TÂM VÀ CHUYÊN NGHIỆP. MỌI THÔNG TIN BẢO HÀNH VUI LÒNG LIÊN HỆ HOTLINE 1800.6304-1800.6305.
          </p>
          <div className="flex items-center gap-3">
            {[
              { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", fill: true },
              { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", fill: true },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={s.fill ? "currentColor" : "none"} stroke={s.fill ? "none" : "currentColor"} strokeWidth="2">
                  <path d={s.path}/>
                </svg>
              </a>
            ))}
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
