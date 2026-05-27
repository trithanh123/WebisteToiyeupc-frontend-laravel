import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import logo from "../../../../assets/images/toiyeupc2.png";

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="flex-shrink-0">
    <rect x="0"  y="0"  width="7" height="7" rx="1.5" />
    <rect x="11" y="0"  width="7" height="7" rx="1.5" />
    <rect x="0"  y="11" width="7" height="7" rx="1.5" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" />
  </svg>
);

const navItems = [
  { label: "BẢNG ĐIỀU KHIỂN",    path: ROUTERS.ADMIN.HOME },
  { label: "Quản lý Người Dùng",       path: ROUTERS.ADMIN.USERS },
  { label: "Quản lý danh mục&sp",      path: ROUTERS.ADMIN.PRODUCTS },
  { label: "Quản lý Voucher",          path: ROUTERS.ADMIN.VOUCHER },
  { label: "Quản lý chuỗi cửa hàng",   path: ROUTERS.ADMIN.STORES },
  { label: "Quản lý nhân sự",     path: ROUTERS.ADMIN.STAFF },
  { label: "Quản lý kho tổng",    path: ROUTERS.ADMIN.WAREHOUSE },
  { label: "Quản lý thống kê",    path: ROUTERS.ADMIN.STATISTICS },
  { label: "Quản lý giám sát",    path: ROUTERS.ADMIN.MONITOR },
  {label: "Quản lý đơn hàng",    path: ROUTERS.ADMIN.ORDERS },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <Link to={ROUTERS.CLIENT.HOME} className="admin-sidebar__logo-link">
          <img src={logo} alt="ToiYeuPC" className="admin-sidebar__logo-img" />
        </Link>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`admin-sidebar__item${isActive ? " admin-sidebar__item--active" : ""}`}
            >
              <span className={`admin-sidebar__icon-wrap${isActive ? " admin-sidebar__icon-wrap--active" : ""}`}>
                <GridIcon />
              </span>
              <span className="admin-sidebar__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
