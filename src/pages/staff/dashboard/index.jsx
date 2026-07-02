import React from "react";
import StaffMasterLayout from "../theme/masterLayout";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`skeleton-block ${className}`} />
);

const StaffDashboard = () => {
  return (
    <StaffMasterLayout title="Nhân Viên – ToiYeuPC">
      {}
      <div className="dash-stats-row">
        <SkeletonBlock className="dash-stat-card" />
        <SkeletonBlock className="dash-stat-card" />
        <SkeletonBlock className="dash-stat-card" />
        <SkeletonBlock className="dash-stat-card" />
      </div>

      {}
      <div className="dash-main-grid">
        <div className="dash-main-grid__left">
          <SkeletonBlock className="dash-chart-large" />
          <SkeletonBlock className="dash-chart-small" />
        </div>
        <div className="dash-main-grid__right">
          <SkeletonBlock className="dash-panel-tall" />
        </div>
      </div>
    </StaffMasterLayout>
  );
};

export default StaffDashboard;
