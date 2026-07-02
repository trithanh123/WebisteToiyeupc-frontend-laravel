import React, { useState } from 'react';
import logo from '../../assets/images/toiyeupc2.png';
import pcHero from '../../assets/images/pc.png';
import laptopHero from '../../assets/images/laptop.png';
import laptopGaming from '../../assets/images/laptopgamming.png';
import manhinh from '../../assets/images/manhinh.png';
import banphim from '../../assets/images/banphim.png';
import chuot from '../../assets/images/chuot.png';
import rx5060 from '../../assets/images/RX5060.png';
import pc1 from '../../assets/images/pc1.jpg';
import pc2 from '../../assets/images/pc2.png';
import pc3 from '../../assets/images/pc3.png';
import pc4 from '../../assets/images/pc4.png';
import pc6 from '../../assets/images/pc6.png';
import pc7 from '../../assets/images/pc7.png';
import pc8 from '../../assets/images/pc8.png';
import pc9 from '../../assets/images/pc9.png';
import news1 from '../../assets/images/tintuccongnghe1.png';
import news2 from '../../assets/images/tintuccongnghe2.png';
import news3 from '../../assets/images/tintuccongnghe3.png';
import iconDelivery from '../../assets/icons/Fast Delivery Icon.svg';
import iconPayment from '../../assets/icons/Payment Icon.svg';
import iconSupport from '../../assets/icons/Online Support Icon.svg';
import iconWarranty from '../../assets/icons/Guarantee Icon.svg';
import dellLogo from '../../assets/images/dell-logo-inkythuatso-4-01-30-10-18-11.png';
import asusLogo from '../../assets/images/asus.png';
import acerLogo from '../../assets/images/acer-1.jpg';
import lenovoLogo from '../../assets/images/lenovo.png';
import hpLogo from '../../assets/images/hp.png';
import lgLogo from '../../assets/images/lg.png';
import bocongthuong from '../../assets/images/dathongbaobocongthuon.png';
import iconPC from '../../assets/icons/icons8-pc-64.png';
import iconScreen from '../../assets/icons/icons8-screen-50.png';
import iconMainboard from '../../assets/icons/icons8-mainboard-32.png';
import iconCPU from '../../assets/icons/icons8-cpu-50.png';
import iconVGA from '../../assets/icons/icons8-vga-50.png';
import iconRAM from '../../assets/icons/icons8-ram-64.png';
import iconMouse from '../../assets/icons/icons8-mouse-50.png';
import iconPSU from '../../assets/icons/icons8-power-supply-64.png';
import iconKeyboard from '../../assets/icons/icons8-keyboard-32.png';
import iconCase from '../../assets/icons/icons8-case-64.png';
import iconHDD from '../../assets/icons/icons8-hdd-50.png';
import iconLaptop from '../../assets/icons/icons8-laptop-50.png';

const products = [
  { id: 1, img: pc1, name: 'PC LENOVO THINKCENTRE NEO 50S GEN 4 I5-13400', price: '20.490.000 đ' },
  { id: 2, img: pc2, name: 'PC DELL OPTIPLEX 3000 SFF CORE I5-12500T', price: '18.990.000 đ' },
  { id: 3, img: pc3, name: 'PC ASUS EXPERTCENTER D500SD I5-12400', price: '17.490.000 đ' },
  { id: 4, img: pc4, name: 'PC HP PRODESK 400 G9 SFF I5-12500', price: '19.290.000 đ' },
  { id: 5, img: pc6, name: 'PC LENOVO THINKCENTRE M70S GEN 3 I7-12700', price: '24.990.000 đ' },
  { id: 6, img: pc7, name: 'PC DELL OPTIPLEX 7010 SFF I7-13700', price: '26.490.000 đ' },
  { id: 7, img: pc8, name: 'PC ASUS EXPERTCENTER D700SD I7-12700K', price: '28.990.000 đ' },
  { id: 8, img: pc9, name: 'PC HP ELITEDESK 800 G9 SFF I7-12700', price: '30.490.000 đ' },
];

const newsData = [
  {
    id: 1, img: news1, date: '14/05/2024', category: 'PC/DESKTOP',
    title: 'Tổng Hợp Các Mẫu Build PC Chơi Game Đỉnh Cao Năm 2024',
    desc: 'Khám phá những cấu hình PC gaming tốt nhất năm 2024, từ tầm trung đến cao cấp, giúp bạn trải nghiệm game mượt mà nhất.',
  },
  {
    id: 2, img: news2, date: '10/05/2024', category: 'LAPTOP',
    title: 'Laptop Tầm Hồng Mới Nhất Trên Android 15 Cần Mua Ngay',
    desc: 'Những mẫu laptop mới nhất với hiệu năng vượt trội, thiết kế sang trọng và pin trâu đang được người dùng săn đón.',
  },
  {
    id: 3, img: news3, date: '08/05/2024', category: 'PC/DESKTOP',
    title: 'Chip PC Lấy Nhất Lô VGA Tốt Nhất Trong Quý Cần Mua Ngay Dành Cho Doanh Nghiệp Và Nhà Trường',
    desc: 'Các dòng chip mới nhất từ Intel và AMD mang lại hiệu suất xử lý vượt trội cho công việc và giải trí.',
  },
];

const categories = [
  { icon: iconPC, label: 'PC' },
  { icon: iconLaptop, label: 'Laptop' },
  { icon: iconScreen, label: 'Màn Hình' },
  { icon: iconMainboard, label: 'Mainboard' },
  { icon: iconCPU, label: 'CPU' },
  { icon: iconVGA, label: 'VGA' },
  { icon: iconRAM, label: 'RAM' },
  { icon: iconMouse, label: 'Chuột' },
  { icon: iconPSU, label: 'Nguồn' },
  { icon: iconKeyboard, label: 'Bàn Phím' },
  { icon: iconCase, label: 'Case' },
  { icon: iconHDD, label: 'Ổ Cứng' },
];

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ===== HEADER ===== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
          <a href="/" className="flex-shrink-0">
            <img src={logo} alt="ToiYeuPC" className="h-10 object-contain" />
          </a>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
            >
              <span>☰</span> Danh Mục
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded border w-48 z-50">
                {['Máy Tính', 'Laptop', 'Màn Hình', 'Bàn Phím', 'Chuột', 'Linh Kiện'].map(item => (
                  <a key={item} href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">{item}</a>
                ))}
              </div>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-red-600">Tin Tức</a>
          </nav>
          <div className="flex-1 flex items-center border border-gray-300 rounded overflow-hidden">
            <input
              type="text"
              placeholder="Nhập tên sản phẩm cần tìm kiếm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button className="bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700">🔍</button>
          </div>
          <a href="#" className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900 whitespace-nowrap">
            Đăng Nhập
          </a>
        </div>
      </header>
      {/* ===== HERO BANNER ===== */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row items-center px-8 py-8 gap-6 shadow-sm">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium">TOIYEUPC</p>
              <p className="text-gray-600 text-sm">Cửa Hàng Chuyên</p>
              <p className="text-gray-600 text-sm">Bán Linh</p>
              <p className="text-gray-600 text-sm">Kiện Máy</p>
              <p className="text-gray-600 text-sm mb-2">Tính.</p>
              <h1 className="text-6xl font-black text-gray-300 leading-none tracking-tight">BUILD PC</h1>
              <p className="text-gray-500 text-xs mt-3 max-w-xs">
                Giới thiệu về chúng tôi – nơi cung cấp linh kiện máy tính chính hãng, uy tín hàng đầu Việt Nam.
              </p>
              <div className="flex gap-3 mt-4">
                <button className="border border-gray-400 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50">
                  Giới thiệu về chúng tôi
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                  Xem tất cả sản phẩm →
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center gap-4">
              <img src={laptopHero} alt="Laptop" className="h-40 object-contain drop-shadow-lg" />
              <img src={pcHero} alt="PC" className="h-44 object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>
      {/* ===== CATEGORY CARDS ===== */}
      <section className="bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4">
          {/* Card 1 - Máy Tính */}
          <div className="relative rounded-xl overflow-hidden h-36 bg-gray-800 flex items-center justify-between px-5 cursor-pointer hover:opacity-90">
            <div>
              <p className="text-gray-400 text-xs">Tại đây</p>
              <p className="text-white text-xs">Chọn</p>
              <h3 className="text-white text-xl font-black">MÁY TÍNH</h3>
              <span className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded">Trang Chủ</span>
            </div>
            <img src={pcHero} alt="Máy Tính" className="h-28 object-contain" />
          </div>
          {/* Card 2 - Laptop */}
          <div className="relative rounded-xl overflow-hidden h-36 bg-gray-800 flex items-center justify-between px-5 cursor-pointer hover:opacity-90">
            <div>
              <p className="text-gray-400 text-xs">Tại đây</p>
              <p className="text-white text-xs">Mua</p>
              <h3 className="text-white text-xl font-black">LAPTOP</h3>
              <span className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded">Trang Chủ</span>
            </div>
            <img src={laptopHero} alt="Laptop" className="h-28 object-contain" />
          </div>
          {/* Card 3 - Laptop Gaming */}
          <div className="relative rounded-xl overflow-hidden h-36 bg-gray-800 flex items-center justify-between px-5 cursor-pointer hover:opacity-90">
            <div>
              <p className="text-gray-400 text-xs">Tại đây</p>
              <p className="text-white text-xs">Mua</p>
              <h3 className="text-white text-xl font-black">LAPTOP GM</h3>
              <span className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded">Trang Chủ</span>
            </div>
            <img src={laptopGaming} alt="Laptop Gaming" className="h-28 object-contain" />
          </div>
          {/* Card 4 - Màn Hình */}
          <div className="relative rounded-xl overflow-hidden h-36 bg-gradient-to-r from-pink-600 to-purple-700 flex items-center justify-between px-5 cursor-pointer hover:opacity-90">
            <div>
              <p className="text-pink-200 text-xs">Tại đây</p>
              <p className="text-white text-xs">Chọn</p>
              <h3 className="text-white text-xl font-black">MÀN HÌNH</h3>
              <span className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded">Trang Chủ</span>
            </div>
            <img src={manhinh} alt="Màn Hình" className="h-28 object-contain" />
          </div>
          {/* Card 5 - Bàn Phím */}
          <div className="relative rounded-xl overflow-hidden h-36 bg-gray-800 flex items-center justify-between px-5 cursor-pointer hover:opacity-90">
            <div>
              <p className="text-gray-400 text-xs">Tại đây</p>
              <p className="text-white text-xs">Chọn</p>
              <h3 className="text-white text-xl font-black">Bàn Phím</h3>
              <span className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded">Trang Chủ</span>
            </div>
            <img src={banphim} alt="Bàn Phím" className="h-28 object-contain" />
          </div>
          {/* Card 6 - Chuột */}
          <div className="relative rounded-xl overflow-hidden h-36 bg-white flex items-center justify-between px-5 cursor-pointer hover:opacity-90 shadow">
            <div>
              <p className="text-gray-400 text-xs">Tại đây</p>
              <p className="text-gray-700 text-xs">Chọn</p>
              <h3 className="text-gray-900 text-xl font-black">Chuột</h3>
              <span className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded">Trang Chủ</span>
            </div>
            <img src={chuot} alt="Chuột" className="h-28 object-contain" />
          </div>
        </div>
      </section>
      {/* ===== SERVICE BAR ===== */}
      <section className="bg-white border-y border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 divide-x divide-gray-200">
          {[
            { icon: iconDelivery, title: 'Giao Hàng Toàn Quốc', sub: 'Miễn phí đơn từ 500k' },
            { icon: iconPayment, title: 'Thanh Toán Tiện Lợi', sub: 'Nhiều hình thức thanh toán' },
            { icon: iconSupport, title: 'Hỗ Trợ Khách Hàng 24/7', sub: 'Hotline: 1800 xxxx' },
            { icon: iconWarranty, title: 'Bảo Hành Nhanh Chóng', sub: 'Bảo hành chính hãng' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6">
              <img src={item.icon} alt={item.title} className="w-10 h-10 object-contain" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-600 rounded-2xl overflow-hidden flex items-center justify-between px-8 py-6">
            <div className="text-white">
              <p className="text-xs font-medium opacity-80">CHƯƠNG TRÌNH</p>
              <h2 className="text-5xl font-black leading-none">PC I5/5060</h2>
              <p className="text-xs mt-2 opacity-80 max-w-xs">
                CHƯƠNG TRÌNH MÁY TỶ SỬ DỤNG CHÍNH HÃNG, MỚI 100% TỪ NĂM 2026
              </p>
              <button className="mt-4 bg-white text-red-600 font-bold px-5 py-2 rounded text-sm hover:bg-gray-100">
                Xem Ngay
              </button>
            </div>
            <div className="text-white text-xs space-y-1 hidden md:block">
              <p className="font-semibold text-sm">CPU: INTEL CORE I5 13400</p>
              <p>RAM: 16GB DDR4 3200MHz</p>
              <p>SSD: 512GB NVMe</p>
              <p>VGA: RTX 5060 8GB</p>
              <p>CASE: FULL ATX</p>
            </div>
            <img src={rx5060} alt="PC I5/5060" className="h-40 object-contain drop-shadow-2xl" />
          </div>
        </div>
      </section>
      {/* ===== TOP PC BÁN CHẠY ===== */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">TOP PC BÁN CHẠY</h2>
            <p className="text-gray-500 text-sm mt-1">Những sản phẩm máy tính bán chạy nhất tại ToiYeuPC</p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer group">
                <div className="bg-gray-50 rounded-lg flex items-center justify-center h-40 mb-3 overflow-hidden">
                  <img src={p.img} alt={p.name} className="h-36 object-contain group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{p.name}</p>
                <p className="text-red-600 font-bold text-sm mt-2">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY ICONS BAR ===== */}
      <section className="bg-white border-t border-b border-blue-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around flex-wrap gap-2">
            {categories.map((cat, i) => (
              <a key={i} href="#" className="flex flex-col items-center gap-1 hover:text-red-600 group">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={cat.icon} alt={cat.label} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs text-gray-600 group-hover:text-red-600">{cat.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* ===== TIN TỨC CÔNG NGHỆ ===== */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">TIN TỨC CÔNG NGHỆ</h2>
            <p className="text-gray-500 text-sm mt-1">Cập nhật tin tức công nghệ mới nhất từ ToiYeuPC</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {newsData.map(n => (
              <div key={n.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                <div className="overflow-hidden h-44">
                  <img src={n.img} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">{n.category}</span>
                    <span className="text-xs text-gray-400">{n.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-2">{n.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRAND LOGOS ===== */}
      <section className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around flex-wrap gap-6">
            {[
              { src: asusLogo, alt: 'ASUS' },
              { src: lenovoLogo, alt: 'Lenovo' },
              { src: dellLogo, alt: 'DELL' },
              { src: acerLogo, alt: 'acer' },
              { src: hpLogo, alt: 'hp' },
              { src: lgLogo, alt: 'LG' },
            ].map(b => (
              <img key={b.alt} src={b.src} alt={b.alt} className="h-10 object-contain grayscale hover:grayscale-0 transition cursor-pointer" />
            ))}
          </div>
        </div>
      </section>
      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300 pt-10 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-5 gap-6 mb-8">
            <div>
              <h4 className="text-white font-bold text-sm mb-3">VỀ CHÚNG TÔI</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="#" className="hover:text-white">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-white">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white">Tin tức</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">CHÍNH SÁCH</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="#" className="hover:text-white">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-white">Chính sách vận chuyển</a></li>
                <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">CHÍNH SÁCH</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="#" className="hover:text-white">Hướng dẫn mua hàng</a></li>
                <li><a href="#" className="hover:text-white">Hướng dẫn thanh toán</a></li>
                <li><a href="#" className="hover:text-white">Tra cứu đơn hàng</a></li>
                <li><a href="#" className="hover:text-white">Góp ý khiếu nại</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">TỔNG ĐÀI HỖ TRỢ</h4>
              <ul className="space-y-1 text-xs">
                <li className="text-red-400 font-bold text-base">1800 1900</li>
                <li>Thứ 2 - Thứ 7: 8h - 21h</li>
                <li>Chủ nhật: 9h - 18h</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">KÊNH LIÊN KẾT</h4>
              <div className="flex gap-3 text-xl">
                <a href="#" className="hover:text-blue-400">f</a>
                <a href="#" className="hover:text-red-400">▶</a>
                <a href="#" className="hover:text-pink-400">📷</a>
              </div>
              <div className="mt-4">
                <img src={bocongthuong} alt="Bộ Công Thương" className="h-12 object-contain" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
            © 2026 TOIYEUPC. LUÔN PHỤC VỤ VÌ LỢI ÍCH CỦA CÁC BẠN MÀ HOẠT ĐỘNG.
          </div>
        </div>
      </footer>

    </div>
  );
};
export default Homepage;
