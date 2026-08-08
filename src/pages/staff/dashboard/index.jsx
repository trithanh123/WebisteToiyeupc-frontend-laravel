import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StaffMasterLayout from "../theme/masterLayout";
import { ROUTERS } from "../../../utils/route";
import axios from "axios";

// ─── Staff API ──────────────────────────────────────────────────────────────
const staffApi = axios.create({ baseURL: "https://webistetoiyeupc-backend-laravel.onrender.com/api" });
staffApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("staff_access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const SkeletonBlock = ({ className = "" }) => (
  <div className={`skeleton-block ${className}`} style={{ background: "#e2e8f0", animation: "pulse 1.5s infinite" }} />
);

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await staffApi.get("/staff/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || { pendingOrders: 0, lowStock: 0, warrantyRequests: 0, pendingTransfers: 0 };
  const latestOrders = data?.latestOrders || [];
  const recentTransfers = data?.recentActivities?.transfers || [];
  const recentWarranties = data?.recentActivities?.warranties || [];

  return (
    <StaffMasterLayout title="Nhân Viên – ToiYeuPC">
      <style>{`
        .staff-dash-title { margin: 0 0 20px 0; font-size: 24px; font-weight: 800; color: #0f172a; }
        .dash-stats-row { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
        .dash-stat-card { flex: 1; min-width: 200px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; position: relative; overflow: hidden; border: 1px solid #f1f5f9; }
        .dash-stat-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--theme-color); }
        .dash-stat-value { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .dash-stat-label { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .dash-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        @media (max-width: 992px) { .dash-main-grid { grid-template-columns: 1fr; } }
        
        .dash-panel { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #f1f5f9; }
        .dash-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .dash-panel-title { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
        .dash-panel-link { font-size: 13px; color: #3b82f6; text-decoration: none; font-weight: 600; }
        .dash-panel-link:hover { text-decoration: underline; }
        
        .dash-table { width: 100%; border-collapse: collapse; }
        .dash-table th { text-align: left; padding: 12px 10px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .dash-table td { padding: 12px 10px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .dash-table tr:last-child td { border-bottom: none; }
        .dash-table tr:hover { background: #f8fafc; }
        
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .timeline-item { position: relative; padding-left: 20px; margin-bottom: 16px; }
        .timeline-item::before { content: ""; position: absolute; left: 0; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
        .timeline-item:not(:last-child)::after { content: ""; position: absolute; left: 3px; top: 18px; bottom: -12px; width: 2px; background: #e2e8f0; }
        .timeline-time { font-size: 11px; color: #94a3b8; margin-bottom: 2px; }
        .timeline-content { font-size: 13px; color: #334155; line-height: 1.5; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: .5; } 100% { opacity: 1; } }
      `}</style>
      
      <h1 className="staff-dash-title">Bảng Điều Khiển Chi Nhánh</h1>
      
      <div className="dash-stats-row">
        {loading ? (
          <>
            <SkeletonBlock className="dash-stat-card" style={{ height: 100 }} />
            <SkeletonBlock className="dash-stat-card" style={{ height: 100 }} />
            <SkeletonBlock className="dash-stat-card" style={{ height: 100 }} />
            <SkeletonBlock className="dash-stat-card" style={{ height: 100 }} />
          </>
        ) : (
          <>
            <div className="dash-stat-card" style={{ "--theme-color": "#f59e0b" }}>
              <div className="dash-stat-value">{stats.pendingOrders}</div>
              <div className="dash-stat-label">Đơn chờ xử lý</div>
            </div>
            <div className="dash-stat-card" style={{ "--theme-color": "#ef4444" }}>
              <div className="dash-stat-value">{stats.lowStock}</div>
              <div className="dash-stat-label">Sản phẩm sắp hết</div>
            </div>
            <div className="dash-stat-card" style={{ "--theme-color": "#3b82f6" }}>
              <div className="dash-stat-value">{stats.warrantyRequests}</div>
              <div className="dash-stat-label">Yêu cầu bảo hành mới</div>
            </div>
            <div className="dash-stat-card" style={{ "--theme-color": "#8b5cf6" }}>
              <div className="dash-stat-value">{stats.pendingTransfers}</div>
              <div className="dash-stat-label">Phiếu điều chuyển chờ</div>
            </div>
          </>
        )}
      </div>

      <div className="dash-main-grid">
        <div className="dash-main-grid__left">
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3 className="dash-panel-title">Đơn hàng cần xử lý gấp</h3>
              <Link to={ROUTERS.STAFF.ORDERS} className="dash-panel-link">Xem tất cả &rarr;</Link>
            </div>
            {loading ? (
              <SkeletonBlock style={{ height: 200, borderRadius: 8 }} />
            ) : latestOrders.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Mã ĐH</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map(order => (
                      <tr key={order.id_donhang}>
                        <td style={{ fontWeight: 600 }}>#{order.id_donhang}</td>
                        <td>
                          <div>{order.nguoi_dung?.hovaten || "Khách vô danh"}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(order.thoigiandathang).toLocaleString("vi-VN")}</div>
                        </td>
                        <td style={{ color: "#ef4444", fontWeight: 600 }}>{order.tongtien.toLocaleString("vi-VN")}đ</td>
                        <td>
                          <span className="status-badge" style={{ background: "#fef3c7", color: "#d97706" }}>
                            {order.trang_thai_dh}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Link to={`${ROUTERS.STAFF.ORDERS}/${order.id_donhang}`} style={{ color: "#3b82f6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
                <div>Tuyệt vời! Không có đơn hàng nào tồn đọng.</div>
              </div>
            )}
          </div>
        </div>

        <div className="dash-main-grid__right">
          <div className="dash-panel" style={{ height: "100%" }}>
            <div className="dash-panel-header">
              <h3 className="dash-panel-title">Hoạt động gần đây</h3>
            </div>
            {loading ? (
              <SkeletonBlock style={{ height: "100%", minHeight: 200, borderRadius: 8 }} />
            ) : (
              <div className="dash-timeline">
                {recentWarranties.map(w => (
                  <div key={`w-${w.id}`} className="timeline-item">
                    <div className="timeline-time">{new Date(w.created_at).toLocaleString("vi-VN")}</div>
                    <div className="timeline-content">
                      Khách hàng <strong>{w.nguoi_dung?.hovaten}</strong> vừa tạo yêu cầu bảo hành <strong>{w.loai_yeu_cau}</strong>.
                    </div>
                  </div>
                ))}
                {recentTransfers.map(t => (
                  <div key={`t-${t.id_phieu}`} className="timeline-item">
                    <div className="timeline-time">{new Date(t.created_at).toLocaleString("vi-VN")}</div>
                    <div className="timeline-content">
                      Phiếu điều chuyển <strong>#{t.id_phieu}</strong> vừa được tạo bởi {t.nguoi_tao?.hovaten}. 
                      <span style={{ color: "#64748b", display: "block", fontSize: 11, marginTop: 2 }}>
                        Từ {t.kho_xuat?.ten_chinhanh} &rarr; {t.kho_nhap?.ten_chinhanh}
                      </span>
                    </div>
                  </div>
                ))}
                {recentWarranties.length === 0 && recentTransfers.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 13 }}>
                    Chưa có hoạt động nào gần đây.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffMasterLayout>
  );
};

export default StaffDashboard;
