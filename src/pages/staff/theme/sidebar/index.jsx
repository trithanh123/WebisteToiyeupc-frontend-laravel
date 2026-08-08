import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import logo from "../../../../assets/images/toiyeupc2.png";

import iconHome from "../../../../assets/icons/icons8-dashboard-48.png";
import iconMonitor from "../../../../assets/icons/icons8-mobile-order-50.png";
import iconWarehouse from "../../../../assets/icons/icons8-warehouse-50.png";
import iconTransfer from "../../../../assets/icons/icons8-transfer-50.png";
import iconWarranty from "../../../../assets/icons/icons8-warranty-50.png";
import iconStats from "../../../../assets/icons/icons8-circle-chart-50.png";
import iconStaff from "../../../../assets/icons/icons8-employee-50.png";

const navItems = [
  { label: "Bảng Điều Khiển",                  path: ROUTERS.STAFF.HOME, icon: iconHome },
  { label: "Xử Lý Đơn Hàng",                  path: ROUTERS.STAFF.ORDERS, icon: iconMonitor },
  { label: "Kiểm kê Cập nhật Tồn kho",        path: ROUTERS.STAFF.WAREHOUSE, icon: iconWarehouse },
  { label: "Tạo xử lý Phiếu Điều Chuyển",    path: ROUTERS.STAFF.TRANSFER, icon: iconTransfer },
  { label: "Hỗ Trợ Và Bảo Hành",             path: ROUTERS.STAFF.WARRANTY, icon: iconWarranty },
  { label: "Xem tồn kho hệ thống",            path: ROUTERS.STAFF.STATISTICS, icon: iconStats },
];

const StaffSidebar = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem("staff_user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  
  const currentNavItems = [...navItems];
  if (user && user.chucvu === "Quản lý Cửa hàng") {
      currentNavItems.push({ label: "QL Nhân Sự", path: "/staff/nhan-su", icon: iconStaff });
  }

  return (
    <aside className="staff-sidebar">
      <div className="staff-sidebar__logo">
        <Link to={ROUTERS.CLIENT.HOME} className="staff-sidebar__logo-link">
          <img src={logo} alt="ToiYeuPC" className="staff-sidebar__logo-img" />
        </Link>
      </div>

      <nav className="staff-sidebar__nav">
        {currentNavItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`staff-sidebar__item${isActive ? " staff-sidebar__item--active" : ""}`}
            >
              <span className={`staff-sidebar__icon-wrap${isActive ? " staff-sidebar__icon-wrap--active" : ""}`}>
                <img src={item.icon} alt={item.label} style={{ width: 22, height: 22, filter: isActive ? "brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(3062%) hue-rotate(217deg) brightness(97%) contrast(93%)" : "grayscale(100%) opacity(60%)" }} />
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
