import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import logo from "../../../../assets/images/toiyeupc2.png";
import AuthModal from "../../../auth/AuthModal";
import iconUser from "../../../../assets/icons/icons8-user-24.png";
import iconOrder from "../../../../assets/icons/icons8-purchase-order-50.png";
import iconFavorite from "../../../../assets/icons/icons8-favorite-50.png";
import iconAddress from "../../../../assets/icons/icons8-address-book-50.png";
import iconNotif from "../../../../assets/icons/icons8-notification.png";
import axios from "axios";
import { CartContext } from "../../../../context/CartContext";
import { BranchContext } from "../../../../context/BranchContext";

// Tự động load tất cả icon từ assets/icons theo tên file
const allIcons = import.meta.glob(
  '../../../../assets/icons/*.png',
  { eager: true }
);
// Hàm lấy src icon theo tên file (vd: "icons8-laptop-50.png")
const getCatIcon = (filename) => {
  if (!filename) return null;
  const entry = Object.entries(allIcons).find(([path]) =>
    path.endsWith('/' + filename)
  );
  return entry ? entry[1].default : null;
};

const API = "http://127.0.0.1:8000/api";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { activeBranch, setBranch } = useContext(BranchContext);
  const [branchesList, setBranchesList] = useState([]);
  const menuRef = useRef(null);
  const branchRef = useRef(null);
  const menuLeaveTimer = useRef(null);
  const headerRef = useRef(null);
  const [headerBottom, setHeaderBottom] = useState(60);

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const { cartCount } = useContext(CartContext);

  // Mega menu state
  const [categories, setCategories] = useState([]);   // tree từ API
  const [hoveredCat, setHoveredCat] = useState(null); // danh mục gốc đang hover

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchOpen(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);

    // Fetch danh mục cây từ API (public endpoint - 3 cấp)
    axios.get(`${API}/categories`)
      .then(res => {
        if (res.data.status === 'success') {
          const activeRoots = (res.data.data || []).filter(c => c.is_active !== false);
          setCategories(activeRoots);
          if (activeRoots.length > 0) setHoveredCat(activeRoots[0]);
        }
      })
      .catch(() => {
        setCategories([
          { ID_DanhMuc: 1, Ten_DanhMuc: 'Máy Tính', slug: 'may-tinh', danh_muc_con: [] },
          { ID_DanhMuc: 2, Ten_DanhMuc: 'Laptop', slug: 'laptop', danh_muc_con: [] },
          { ID_DanhMuc: 3, Ten_DanhMuc: 'Màn Hình', slug: 'man-hinh', danh_muc_con: [] },
          { ID_DanhMuc: 4, Ten_DanhMuc: 'Linh Kiện', slug: 'linh-kien', danh_muc_con: [] },
        ]);
      });

    // Tính vị trí bottom của header để đặt mega menu
    const updateHeaderBottom = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom);
      }
    };
    updateHeaderBottom();
    window.addEventListener('scroll', updateHeaderBottom);
    window.addEventListener('resize', updateHeaderBottom);

    // Fetch branches
    axios.get(`${API}/branches`)
      .then(res => {
        if (res.data.status === 'success') {
          const list = res.data.data;
          setBranchesList(list);
          if (list.length > 0 && !activeBranch) {
            setBranch(list[0]);
          }
        }
      })
      .catch(err => console.log("Lỗi lấy danh sách chi nhánh:", err));

    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener('scroll', updateHeaderBottom);
      window.removeEventListener('resize', updateHeaderBottom);
    };
  }, [activeBranch]);

  // Lấy thông tin user từ token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('access_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('http://127.0.0.1:8000/api/user', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem('access_token'); // Xóa token rác/hết hạn
            throw new Error('Token expired');
          }
          return res.json();
        })
        .then(data => {
          if (data && data.Ten) setUser(data);
        })
        .catch(err => console.log("Lỗi lấy thông tin tài khoản:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.reload();
  };

  const handleSearch = (e) => { e.preventDefault(); };

  return (
    <header className="header" ref={headerRef}>
      <div className="header__inner">

        {/* Logo */}
        <Link to={ROUTERS.CLIENT.HOME} className="header__logo">
          <img src={logo} alt="ToiYeuPC" />
        </Link>

        {/* ── Mega Menu Danh Mục – kiểu GearVN 3 cấp ── */}
        <div
          className="header__menu"
          ref={menuRef}
          onMouseEnter={() => {
            clearTimeout(menuLeaveTimer.current);
            setMenuOpen(true);
            setBranchOpen(false);
          }}
          onMouseLeave={() => {
            menuLeaveTimer.current = setTimeout(() => setMenuOpen(false), 220);
          }}
        >
          <button
            className="header__menu-btn"
            onClick={() => { setMenuOpen(!menuOpen); setBranchOpen(false); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Danh Mục
          </button>

          {/* ── PANEL MEGA MENU 3 CẤP – full-width như GearVN ── */}
          {menuOpen && (
            <div
              style={{
                position: 'fixed',
                top: headerBottom,
                left: 0,
                right: 0,
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
              }}
              onMouseEnter={() => clearTimeout(menuLeaveTimer.current)}
              onMouseLeave={() => {
                menuLeaveTimer.current = setTimeout(() => setMenuOpen(false), 220);
              }}
            >
              <div style={{
                width: '100%',
                maxWidth: 1280,
                display: 'flex',
                background: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                border: '1px solid #e5e7eb',
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                overflow: 'hidden',
              }}>
                <style>{`
                .mgear-mega-wrap {
                  position: fixed;
                  left: 0;
                  right: 0;
                  z-index: 9999;
                  display: flex;
                  justify-content: center;
                }
                .mgear-mega-inner {
                  width: 100%;
                  max-width: 1280px;
                  display: flex;
                  background: #fff;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.16);
                  border: 1px solid #e5e7eb;
                  border-top: none;
                  border-radius: 0 0 10px 10px;
                  overflow: hidden;
                }
                .mgear-side-item {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 9px 14px;
                  font-size: 13.5px;
                  color: #1e293b;
                  font-weight: 500;
                  border-left: 3px solid transparent;
                  cursor: pointer;
                  white-space: nowrap;
                  text-decoration: none;
                  transition: background 0.12s, color 0.12s, border-color 0.12s;
                }
                .mgear-side-item:hover,
                .mgear-side-item.active {
                  background: #fff1f2;
                  color: #dc2626;
                  border-left-color: #dc2626;
                  font-weight: 700;
                }
                .mgear-side-item .mgear-arrow {
                  margin-left: auto;
                  font-size: 14px;
                  color: #9ca3af;
                }
                .mgear-l2-title {
                  font-size: 12.5px;
                  font-weight: 800;
                  color: #dc2626;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                  margin-bottom: 7px;
                  padding-bottom: 5px;
                  border-bottom: 1.5px solid #fee2e2;
                  text-decoration: none;
                  display: block;
                  cursor: pointer;
                }
                .mgear-l2-title:hover { color: #b91c1c; }
                .mgear-l3-link {
                  display: block;
                  font-size: 13px;
                  color: #374151;
                  padding: 3px 0;
                  text-decoration: none;
                  cursor: pointer;
                  line-height: 1.55;
                }
                .mgear-l3-link:hover { color: #dc2626; }
              `}</style>

                {/* CỘT TRÁI: Danh mục gốc (cấp 1) */}
                <div style={{
                  width: 220,
                  background: '#f9fafb',
                  borderRight: '1px solid #e5e7eb',
                  overflowY: 'auto',
                  flexShrink: 0,
                  maxHeight: 480,
                  paddingTop: 6,
                  paddingBottom: 6,
                }}>
                  {categories.map((cat, index) => {
                    const iconSrc = getCatIcon(cat.Hinhanh_icon);
                    return (
                      <Link
                        key={cat.id || cat.ID_DanhMuc || index}
                        to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${cat.slug || cat.ID_DanhMuc}`}
                        className={`mgear-side-item${hoveredCat?.ID_DanhMuc === cat.ID_DanhMuc ? ' active' : ''}`}
                        onMouseEnter={() => setHoveredCat(cat)}
                        onClick={() => setMenuOpen(false)}
                      >
                        {iconSrc
                          ? <img src={iconSrc} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0, opacity: 0.8 }} />
                          : <span style={{ width: 18, height: 18, flexShrink: 0, display: 'inline-block' }} />
                        }
                        {cat.Ten_DanhMuc}
                        {cat.danh_muc_con?.length > 0 && <span className="mgear-arrow">›</span>}
                      </Link>
                    );
                  })}
                </div>

                {/* CỘT PHẢI: Cấp 2 (tiêu đề đỏ) + Cấp 3 (danh sách) – grid ngang */}
                {hoveredCat && (
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    maxHeight: 480,
                    overflowY: 'auto',
                    padding: '18px 28px',
                    background: '#fff',
                  }}>
                    {hoveredCat.danh_muc_con && hoveredCat.danh_muc_con.length > 0 ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '20px 28px',
                        alignItems: 'start',
                      }}>
                        {hoveredCat.danh_muc_con.map((l2, index2) => (
                          <div key={l2.id || l2.ID_DanhMuc || index2}>
                            {/* Tiêu đề cấp 2 – màu đỏ, chữ hoa */}
                            <Link
                              to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${l2.slug || l2.ID_DanhMuc}`}
                              className="mgear-l2-title"
                              onClick={() => setMenuOpen(false)}
                            >
                              {l2.Ten_DanhMuc}
                            </Link>

                            {/* Danh sách cấp 3 */}
                            {l2.danh_muc_con && l2.danh_muc_con.length > 0
                              ? l2.danh_muc_con.map((l3, index3) => (
                                <Link
                                  key={l3.id || l3.ID_DanhMuc || index3}
                                  to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${l3.slug || l3.ID_DanhMuc}`}
                                  className="mgear-l3-link"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  {l3.Ten_DanhMuc}
                                </Link>
                              ))
                              : (
                                <Link
                                  to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${l2.slug || l2.ID_DanhMuc}`}
                                  className="mgear-l3-link"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  Xem tất cả
                                </Link>
                              )
                            }
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Danh mục gốc không có con
                      <div style={{ paddingTop: 8 }}>
                        <Link
                          to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${hoveredCat.slug || hoveredCat.ID_DanhMuc}`}
                          className="mgear-l3-link"
                          onClick={() => setMenuOpen(false)}
                          style={{ fontSize: 14 }}
                        >
                          › Xem tất cả sản phẩm trong "{hoveredCat.Ten_DanhMuc}"
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chi Nhánh HCM */}
        <div className="header__branch" ref={branchRef}>
          <button
            className="header__branch-btn"
            onClick={() => { setBranchOpen(!branchOpen); setMenuOpen(false); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {activeBranch ? activeBranch.Ten_ChiNhanh : "Chọn Chi Nhánh"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {branchOpen && (
            <ul className="header__branch-dropdown">
              {branchesList.map((b, i) => (
                <li key={i}>
                  <button
                    className={`header__branch-item${activeBranch?.iD_ChiNhanh === b.iD_ChiNhanh ? " header__branch-item--active" : ""}`}
                    onClick={() => { setBranch(b); setBranchOpen(false); }}
                  >
                    <span className="header__branch-name">{b.Ten_ChiNhanh}</span>
                    <span className="header__branch-addr">{b.diachi_chitiet}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search */}
        <form className="header__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Hãy nhập số tên bạn muốn build..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Tìm kiếm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Auth & Cart */}
        <div className="header__auth" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

          <Link to={ROUTERS.CLIENT.CART} className="header__cart" aria-label="Giỏ hàng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="header__cart-label">Giỏ Hàng</span>
            <span className="header__cart-count">{cartCount}</span>
          </Link>

          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {user.Ten ? user.Ten.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden md:block text-sm">
                  <p className="text-gray-500 text-xs m-0">Xin chào,</p>
                  <p className="font-bold text-gray-800 truncate w-24 m-0" title={user.Ten}>{user.Ten}</p>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-12 right-0 w-64 bg-white border border-gray-200 shadow-xl rounded-md z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-100 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {user.Ten ? user.Ten.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 truncate m-0">{user.Ten}</p>
                      <p className="text-sm text-gray-500 truncate m-0">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col py-2">
                    <Link to="/tai-khoan" className="px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-sm no-underline">
                      <img src={iconUser} alt="" className="w-5 h-5 object-contain opacity-70" /> Thông tin tài khoản
                    </Link>
                    <Link to="/tai-khoan/don-hang" className="px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-sm no-underline">
                      <img src={iconOrder} alt="" className="w-5 h-5 object-contain opacity-70" /> Quản lý đơn hàng
                    </Link>
                    <Link to="/tai-khoan/yeu-thich" className="px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-sm no-underline">
                      <img src={iconFavorite} alt="" className="w-5 h-5 object-contain opacity-70" /> Sản phẩm yêu thích
                    </Link>
                    <Link to="/tai-khoan/dia-chi" className="px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-sm no-underline">
                      <img src={iconAddress} alt="" className="w-5 h-5 object-contain opacity-70" /> Sổ địa chỉ
                    </Link>
                    <Link to="/tai-khoan/thong-bao" className="px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-sm no-underline">
                      <img src={iconNotif} alt="" className="w-5 h-5 object-contain opacity-70" /> Thông báo
                    </Link>
                  </div>
                  <div className="px-4 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded text-sm transition-colors border-none cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="header__login-btn"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </header>
  );
}

export default Header;
