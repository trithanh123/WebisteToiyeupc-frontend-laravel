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
  { label: "BẢNG ĐIỀU KHIỂN",    path: ROUTERS.STAFF.HOME },
  { label: "QL Đơn hàng",         path: ROUTERS.STAFF.ORDERS },
  { label: "QL Kho cục bộ",       path: ROUTERS.STAFF.WAREHOUSE },
  { label: "QL Luân Chuyển",      path: ROUTERS.STAFF.TRANSFER },
  { label: "Hỗ trợ Va Bảo hành", path: ROUTERS.STAFF.WARRANTY },
  { label: "Thống Kê Cục Bộ",    path: ROUTERS.STAFF.STATISTICS },
];

const StaffSidebar = () => {
  const location = useLocation();

  return (
    <aside className="staff-sidebar">
      <div className="staff-sidebar__logo">
        <Link to={ROUTERS.CLIENT.HOME} className="staff-sidebar__logo-link">
          <img src={logo} alt="ToiYeuPC" className="staff-sidebar__logo-img" />
        </Link>
      </div>

      <nav className="staff-sidebar__nav">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`staff-sidebar__item${isActive ? " staff-sidebar__item--active" : ""}`}
            >
              <span className={`staff-sidebar__icon-wrap${isActive ? " staff-sidebar__icon-wrap--active" : ""}`}>
                <GridIcon />
              </span>
              <span className="staff-sidebar__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default StaffSidebar;
