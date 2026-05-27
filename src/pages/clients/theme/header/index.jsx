import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import logo from "../../../../assets/images/toiyeupc2.png";

const menuItems = [
  { label: "Máy Tính",  path: ROUTERS.CLIENT.PRODUCTS },
  { label: "Laptop",    path: ROUTERS.CLIENT.PRODUCTS },
  { label: "Màn Hình",  path: ROUTERS.CLIENT.PRODUCTS },
  { label: "Bàn Phím",  path: ROUTERS.CLIENT.PRODUCTS },
  { label: "Chuột",     path: ROUTERS.CLIENT.PRODUCTS },
  { label: "Linh Kiện", path: ROUTERS.CLIENT.PRODUCTS },
  { label: "Build PC",  path: ROUTERS.CLIENT.PRODUCTS },
];

const branches = [
  { name: "HCM - Quận 8",    addr: "45 cao lỗ phường 4 Quận 8, TP.HCM" },
  { name: "HCM - Quận 2",addr: "275 Nguyễn Thị Định, Bình Trưng Quận 2, TP.HCM" },
  { name: "HCM - Quận 3",    addr: "330-332 Võ Vắn Tấn, Phường Bàn Cờ Quận 3, TP.HCM" },
  { name: "HCM - Bình Dương",  addr: "882 Lê Hồng Phong, Thủ Dầu Một, TP.HCM" },
  { name: "HCM - Đồng Nai",   addr: "272 Phạm Văn Thuận, Biên Hòa, TP.HCM" },
];

const Header = () => {
  const [searchQuery, setSearchQuery]   = useState("");
  const [menuOpen, setMenuOpen]         = useState(false);
  const [branchOpen, setBranchOpen]     = useState(false);
  const [activeBranch, setActiveBranch] = useState(branches[0]);

  const menuRef   = useRef(null);
  const branchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setMenuOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <header className="header">
      <div className="header__inner">

        {/* Logo */}
        <Link to={ROUTERS.CLIENT.HOME} className="header__logo">
          <img src={logo} alt="ToiYeuPC" />
        </Link>

        {/* Danh Mục */}
        <div className="header__menu" ref={menuRef}>
          <button
            className="header__menu-btn"
            onClick={() => { setMenuOpen(!menuOpen); setBranchOpen(false); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Danh Mục
          </button>
          {menuOpen && (
            <ul className="header__dropdown">
              {menuItems.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chi Nhánh HCM */}
        <div className="header__branch" ref={branchRef}>
          <button
            className="header__branch-btn"
            onClick={() => { setBranchOpen(!branchOpen); setMenuOpen(false); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {activeBranch.name}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {branchOpen && (
            <ul className="header__branch-dropdown">
              {branches.map((b, i) => (
                <li key={i}>
                  <button
                    className={`header__branch-item${activeBranch.name === b.name ? " header__branch-item--active" : ""}`}
                    onClick={() => { setActiveBranch(b); setBranchOpen(false); }}
                  >
                    <span className="header__branch-name">{b.name}</span>
                    <span className="header__branch-addr">{b.addr}</span>
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
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>

        {/* Auth */}
        <div className="header__auth">
          <Link to={ROUTERS.CLIENT.CART} className="header__cart" aria-label="Giỏ hàng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="header__cart-label">Giỏ Hàng</span>
            <span className="header__cart-count">0</span>
          </Link>
          <Link to={ROUTERS.CLIENT.LOGIN} className="header__login-btn">
            Đăng nhập
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;
