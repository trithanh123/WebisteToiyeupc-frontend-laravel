import React from "react";
import AdminMasterLayout from "../theme/masterLayout";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`skeleton-block ${className}`} />
);

const AdminDashboard = () => {
  return (
    <AdminMasterLayout title="Admin – ToiYeuPC">
      {/* Stats row */}
      <div className="dash-stats-row">
        <SkeletonBlock className="dash-stat-card" />
        <SkeletonBlock className="dash-stat-card" />
        <SkeletonBlock className="dash-stat-card" />
        <SkeletonBlock className="dash-stat-card" />
      </div>

      {/* Main content grid */}
      <div className="dash-main-grid">
        <div className="dash-main-grid__left">
          <SkeletonBlock className="dash-chart-large" />
          <SkeletonBlock className="dash-chart-small" />
        </div>
        <div className="dash-main-grid__right">
          <SkeletonBlock className="dash-panel-tall" />
        </div>
      </div>
    </AdminMasterLayout>
  );
};

export default AdminDashboard;
