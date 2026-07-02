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

const allIcons = import.meta.glob(
  '../../../../assets/icons/*.png',
  { eager: true }
);

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState(
    () => JSON.parse(localStorage.getItem('pv_search_history') || '[]')
  );

  const addToHistory = (kw) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const updated = [trimmed, ...prev.filter(k => k !== trimmed)].slice(0, 5);
      localStorage.setItem('pv_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('pv_search_history');
  };


  const [menuOpen, setMenuOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { activeBranch, setBranch } = useContext(BranchContext);
  const [branchesList, setBranchesList] = useState([]);
  const menuRef = useRef(null);
  const branchRef = useRef(null);
  const searchRef = useRef(null);
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
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);

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
          { id_danhmuc: 1, ten_danhmuc: 'Máy Tính', slug: 'may-tinh', danh_muc_con: [] },
          { id_danhmuc: 2, ten_danhmuc: 'Laptop', slug: 'laptop', danh_muc_con: [] },
          { id_danhmuc: 3, ten_danhmuc: 'Màn Hình', slug: 'man-hinh', danh_muc_con: [] },
          { id_danhmuc: 4, ten_danhmuc: 'Linh Kiện', slug: 'linh-kien', danh_muc_con: [] },
        ]);
      });

    const updateHeaderBottom = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom);
      }
    };
    updateHeaderBottom();
    window.addEventListener('scroll', updateHeaderBottom);
    window.addEventListener('resize', updateHeaderBottom);

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
            localStorage.removeItem('access_token'); 
            throw new Error('Token expired');
          }
          return res.json();
        })
        .then(data => {
          if (data && data.ten) setUser(data);
        })
        .catch(err => console.log("Lỗi lấy thông tin tài khoản:", err));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {

        await fetch(`${API}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.reload();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    addToHistory(searchQuery);
    setIsSearchFocused(true);
    setIsSearching(true);
    try {
      const response = await axios.post(`${API}/products/ai-search`, {
        query: searchQuery,
        branch_id: activeBranch?.id_chinhanh || null
      });
      setAiResults(response.data.data || []);
    } catch (error) {
      console.log("Lỗi tìm kiếm AI:", error);
    }
    setIsSearching(false);
  };

  const handleKeywordClick = (kw) => {
    setSearchQuery(kw);
    addToHistory(kw);
    setTimeout(() => {
      const event = { preventDefault: () => {} };
      handleSearch(Object.assign(event, { target: null }));
    }, 80);
  };

  const popularKeywords = ["toiyeupc", "bàn phím cơ", "pc", "asus", "ipad", "ssd", "rtx 4060", "laptop gaming"];

  return (
    <header className="header" ref={headerRef}>
      <div className="header__inner">

        {}
        <Link to={ROUTERS.CLIENT.HOME} className="header__logo">
          <img src={logo} alt="ToiYeuPC" />
        </Link>

        {}
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

          {menuOpen && (
            <div
              className="mgear-mega-wrap"
              style={{ top: headerBottom }}
              onMouseEnter={() => clearTimeout(menuLeaveTimer.current)}
              onMouseLeave={() => {
                menuLeaveTimer.current = setTimeout(() => setMenuOpen(false), 220);
              }}
            >
              <div className="mgear-mega-inner">

                {}
                <div className="mgear-mega-col-left">
                  {categories.map((cat, index) => {
                    const iconSrc = getCatIcon(cat.hinhanh_icon);
                    return (
                      <Link
                        key={cat.id || cat.id_danhmuc || index}
                        to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${cat.slug || cat.id_danhmuc}`}
                        className={`mgear-side-item${hoveredCat?.id_danhmuc === cat.id_danhmuc ? ' active' : ''}`}
                        onMouseEnter={() => setHoveredCat(cat)}
                        onClick={() => setMenuOpen(false)}
                      >
                        {iconSrc
                          ? <img src={iconSrc} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0, opacity: 0.8 }} />
                          : <span style={{ width: 18, height: 18, flexShrink: 0, display: 'inline-block' }} />
                        }
                        {cat.ten_danhmuc}
                        {cat.danh_muc_con?.length > 0 && <span className="mgear-arrow">›</span>}
                      </Link>
                    );
                  })}
                </div>

                {}
                {hoveredCat && (
                  <div className="mgear-mega-col-right">
                    {hoveredCat.danh_muc_con && hoveredCat.danh_muc_con.length > 0 ? (
                      <div className="mgear-mega-grid">
                        {hoveredCat.danh_muc_con.map((l2, index2) => (
                          <div key={l2.id || l2.id_danhmuc || index2}>
                            {}
                            <Link
                              to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${l2.slug || l2.id_danhmuc}`}
                              className="mgear-l2-title"
                              onClick={() => setMenuOpen(false)}
                            >
                              {l2.ten_danhmuc}
                            </Link>

                            {}
                            {l2.danh_muc_con && l2.danh_muc_con.length > 0
                              ? l2.danh_muc_con.map((l3, index3) => (
                                <Link
                                  key={l3.id || l3.id_danhmuc || index3}
                                  to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${l3.slug || l3.id_danhmuc}`}
                                  className="mgear-l3-link"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  {l3.ten_danhmuc}
                                </Link>
                              ))
                              : (
                                <Link
                                  to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${l2.slug || l2.id_danhmuc}`}
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

                      <div style={{ paddingTop: 8 }}>
                        <Link
                          to={`${ROUTERS.CLIENT.PRODUCTS}?danh-muc=${hoveredCat.slug || hoveredCat.id_danhmuc}`}
                          className="mgear-l3-link"
                          onClick={() => setMenuOpen(false)}
                          style={{ fontSize: 14 }}
                        >
                          › Xem tất cả sản phẩm trong "{hoveredCat.ten_danhmuc}"
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="header__branch" ref={branchRef}>
          <button
            className="header__branch-btn"
            onClick={() => { setBranchOpen(!branchOpen); setMenuOpen(false); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {activeBranch ? activeBranch.ten_chinhanh : "Chọn Chi Nhánh"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {branchOpen && (
            <ul className="header__branch-dropdown">
              {branchesList.map((b, i) => (
                <li key={i}>
                  <button
                    className={`header__branch-item${activeBranch?.id_chinhanh === b.id_chinhanh ? " header__branch-item--active" : ""}`}
                    onClick={() => { setBranch(b); setBranchOpen(false); }}
                  >
                    <span className="header__branch-name">{b.ten_chinhanh}</span>
                    <span className="header__branch-addr">{b.diachi_chitiet}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="pv-search" ref={searchRef}>
          <form className="pv-search__form" onSubmit={handleSearch}>
            <svg className="pv-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="pv-search__input"
              type="text"
              placeholder="Bạn muốn mua gì hôm nay..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => { setSearchQuery(e.target.value); setAiResults([]); }}
              autoComplete="off"
            />
            {searchQuery && (
              <button type="button" className="pv-search__clear" onClick={() => { setSearchQuery(''); setAiResults([]); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button type="submit" className="pv-search__btn">
              Tìm kiếm
            </button>
          </form>

          {/* ── DROPDOWN ── */}
          {isSearchFocused && (
            <div className="pv-search__dropdown">

              {/* Kết quả AI */}
              {isSearching && (
                <div className="pv-search__loading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" strokeOpacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                  AI đang phân tích...
                </div>
              )}

              {aiResults.length > 0 && !isSearching && (
                <div className="pv-search__section">
                  <div className="pv-search__section-header">
                    <span className="pv-search__section-title">✨ AI Đề Xuất</span>
                  </div>
                  <div className="pv-search__ai-list">
                    {aiResults.map((product) => (
                      <Link
                        to={`${ROUTERS.CLIENT.PRODUCTS}/${product.slug || product.id_sanpham}`}
                        key={product.id_sanpham}
                        onClick={() => setIsSearchFocused(false)}
                        className="pv-search__ai-item"
                      >
                        <img src={`http://127.0.0.1:8000/storage/${product.thumbail}`} alt={product.tensp} className="pv-search__ai-img" />
                        <div>
                          <div className="pv-search__ai-name">{product.tensp}</div>
                          <div className="pv-search__ai-price">{product.gia?.toLocaleString('vi-VN')} đ</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Lịch sử + Từ khóa phổ biến (khi chưa có kết quả) */}
              {aiResults.length === 0 && !isSearching && (
                <>
                  {/* Lịch sử tìm kiếm */}
                  {searchHistory.length > 0 && (
                    <div className="pv-search__section">
                      <div className="pv-search__section-header">
                        <span className="pv-search__section-title">LỊCH SỬ TÌM KIẾM</span>
                        <button className="pv-search__clear-history" onClick={clearHistory}>Xóa lịch sử</button>
                      </div>
                      <ul className="pv-search__history-list">
                        {searchHistory.map((kw, i) => (
                          <li key={i} className="pv-search__history-item" onClick={() => handleKeywordClick(kw)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {kw}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Từ khóa phổ biến */}
                  <div className="pv-search__section">
                    <div className="pv-search__section-header">
                      <span className="pv-search__section-title">TỪ KHÓA PHỔ BIẾN</span>
                    </div>
                    <div className="pv-search__pills">
                      {popularKeywords.map((kw, i) => (
                        <span key={i} className="pv-search__pill" onClick={() => handleKeywordClick(kw)}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {}
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
                  {user.ten ? user.ten.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden md:block text-sm">
                  <p className="text-gray-500 text-xs m-0">Xin chào,</p>
                  <p className="font-bold text-gray-800 truncate w-24 m-0" title={user.ten}>{user.ten}</p>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-12 right-0 w-64 bg-white border border-gray-200 shadow-xl rounded-md z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-100 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {user.ten ? user.ten.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 truncate m-0">{user.ten}</p>
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
