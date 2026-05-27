import React from "react";
import StaffSidebar from "../sidebar";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const AvatarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#e2e8f0"/>
    <circle cx="16" cy="12" r="5" fill="#94a3b8"/>
    <path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#94a3b8"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const StaffMasterLayout = ({ children, title = "Nhân Viên – ToiYeuPC" }) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="staff-layout">
      <StaffSidebar />
      <div className="staff-layout__main">
        <header className="staff-layout__topbar">
          <div />
          <div className="staff-layout__topbar-right">
            <button className="staff-layout__bell" aria-label="Thông báo">
              <BellIcon />
            </button>
            <span className="staff-layout__username">Nhân viên</span>
            <AvatarIcon />
            <ChevronIcon />
          </div>
        </header>
        <main className="staff-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffMasterLayout;
