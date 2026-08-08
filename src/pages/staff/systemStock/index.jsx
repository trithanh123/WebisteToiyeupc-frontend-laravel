import React, { useState, useEffect, useCallback } from "react";
import StaffMasterLayout from "../theme/masterLayout";
import axios from "axios";

const staffApi = axios.create({ baseURL: "https://webistetoiyeupc-backend-laravel.onrender.com/api" });
staffApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem("staff_access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});


const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);
const BranchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const BoxIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const StockBadge = ({ qty, threshold }) => {
  if (qty === 0) return <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Hết hàng</span>;
  if (qty <= threshold) return <span style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>⚠ Sắp hết</span>;
  return <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Còn hàng</span>;
};

const BranchCard = ({ branch, search }) => {
  const [open, setOpen] = useState(false);

  const filtered = branch.san_phams.filter(item =>
    (item.san_pham?.tensp || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  const lowCount = branch.san_phams.filter(s => s.soluongtonkho > 0 && s.soluongtonkho <= (s.soluongkhothap ?? 5)).length;
  const outCount = branch.san_phams.filter(s => s.soluongtonkho === 0).length;

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "16px 20px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <BranchIcon />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{branch.ten_chinhanh}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{branch.diachi || "—"}</div>
          </div>
        </div>


        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#475569", background: "#f1f5f9", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>
            {branch.tong_loai_sp} loại SP
          </span>
          <span style={{ fontSize: 12, color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>
            Tổng: {branch.tong_ton_kho} sp
          </span>
          {lowCount > 0 && (
            <span style={{ fontSize: 12, color: "#d97706", background: "#fffbeb", padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>
              ⚠ {lowCount} sắp hết
            </span>
          )}
          {outCount > 0 && (
            <span style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>
              ✕ {outCount} hết hàng
            </span>
          )}
          <ChevronIcon open={open} />
        </div>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #f1f5f9" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: 13 }}>
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sản phẩm</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tồn kho</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ngưỡng c/b</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trạng thái</th>
                  <th style={{ padding: "10px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Giá bán</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id_khoton} style={{ borderTop: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.san_pham?.thumbail ? (
                          <img src={item.san_pham.thumbail} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f1f5f9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>
                            <BoxIcon />
                          </div>
                        )}
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.san_pham?.tensp || "—"}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: item.soluongtonkho === 0 ? "#dc2626" : item.soluongtonkho <= (item.soluongkhothap ?? 5) ? "#d97706" : "#0f172a" }}>
                        {item.soluongtonkho}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#64748b" }}>
                      {item.soluongkhothap ?? 5}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <StockBadge qty={item.soluongtonkho} threshold={item.soluongkhothap ?? 5} />
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                      {item.san_pham?.gia ? item.san_pham.gia.toLocaleString("vi-VN") + "₫" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
const SystemStockPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const totalBranches = branches.length;
  const totalProducts = branches.reduce((s, b) => s + b.tong_loai_sp, 0);
  const totalStock = branches.reduce((s, b) => s + b.tong_ton_kho, 0);
  const totalLow = branches.reduce((s, b) => s + b.san_phams.filter(p => p.soluongtonkho > 0 && p.soluongtonkho <= (p.soluongkhothap ?? 5)).length, 0);
  const totalOut = branches.reduce((s, b) => s + b.san_phams.filter(p => p.soluongtonkho === 0).length, 0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await staffApi.get("/staff/warehouse-overview");
      setBranches(res.data.data || []);
    } catch (err) {
      setError("Không thể tải dữ liệu tồn kho hệ thống.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  return (
    <StaffMasterLayout title="Xem tồn kho hệ thống – ToiYeuPC Staff">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              Xem tồn kho hệ thống
            </h2>
          </div>
          <button
            onClick={fetchData}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569" }}
          >
            <RefreshIcon /> Tải lại
          </button>
        </div>
        {!loading && !error && (
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", animation: "fadeIn 0.3s ease" }}>
            {[
              { label: "Chi nhánh", value: totalBranches, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Loại SP", value: totalProducts, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
              { label: "Tổng tồn kho", value: totalStock, color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
              { label: "Sắp hết", value: totalLow, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              { label: "Hết hàng", value: totalOut, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
            ].map(c => (
              <div key={c.label} style={{ flex: "1 1 130px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{c.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
          <SearchIcon />
        </span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm ở tất cả chi nhánh..."
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}
          onFocus={e => e.target.style.borderColor = "#2563eb"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px", color: "#dc2626", fontSize: 14 }}>
          ⚠ {error}
        </div>
      )}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: 14 }}>Đang tải dữ liệu hệ thống...</p>
        </div>
      )}
      {!loading && !error && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {branches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: 14 }}>
              Không có dữ liệu tồn kho.
            </div>
          ) : (
            branches.map(branch => (
              <BranchCard key={branch.id_chinhanh} branch={branch} search={search} />
            ))
          )}
        </div>
      )}
    </StaffMasterLayout>
  );
};

export default SystemStockPage;
