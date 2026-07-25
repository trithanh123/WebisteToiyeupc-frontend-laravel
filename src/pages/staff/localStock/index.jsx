import React, { useState, useEffect, useCallback } from "react";
import StaffMasterLayout from "../theme/masterLayout";
import axios from "axios";
const API = "http://127.0.0.1:8000/api";
const staffApi = axios.create({ baseURL: API });
staffApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem("staff_access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);
const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const StockBadge = ({ qty, threshold }) => {
  if (qty === 0) return (
    <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      Hết hàng
    </span>
  );
  if (qty <= threshold) return (
    <span style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      Sắp hết
    </span>
  );
  return (
    <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      Còn hàng
    </span>
  );
};
const EditModal = ({ item, onSave, onClose, saving }) => {
  const [qty, setQty] = useState(item.soluongtonkho);
  const [threshold, setThreshold] = useState(item.soluongkhothap ?? 5);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 16, padding: "32px 28px",
        width: "100%", maxWidth: 420, boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        animation: "slideUp 0.2s ease-out"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Cập nhật tồn kho</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{item.san_pham?.tensp}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 20, border: "1px solid #e2e8f0" }}>
          {item.san_pham?.thumbail && (
            <img src={item.san_pham.thumbail} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.san_pham?.tensp}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Tồn hiện tại: <b style={{ color: "#2563eb" }}>{item.soluongtonkho} sản phẩm</b></div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Số lượng tồn kho thực tế (sau kiểm kê) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="number" min={0} value={qty}
              onChange={e => setQty(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#d1d5db"}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Ngưỡng cảnh báo sắp hết (tùy chọn)
            </label>
            <input
              type="number" min={0} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#d1d5db"}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
            Hủy
          </button>
          <button
            onClick={() => onSave(item.id_khoton, qty, threshold)}
            disabled={saving}
            style={{ flex: 2, padding: "10px", border: "none", borderRadius: 8, background: saving ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <SaveIcon /> {saving ? "Đang lưu..." : "Cập nhật tồn kho"}
          </button>
        </div>
      </div>
    </div>
  );
};
const LocalStockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);


  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStock = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await staffApi.get(`/staff/local-stock?page=${p}`);
      const d = res.data;
      setStocks(d.data?.data || d.data || []);
      setBranch(d.branch || "");
      setMeta(d.data || null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Bạn chưa được phân công vào chi nhánh nào. Vui lòng liên hệ quản lý.");
      } else {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(page); }, [page]);

  const handleSave = async (id_khoton, qty, threshold) => {
    setSaving(true);
    try {
      await staffApi.put(`/staff/local-stock/${id_khoton}`, {
        soluongtonkho: qty,
        soluongkhothap: threshold
      });
      showToast("Cập nhật tồn kho thành công!", "success");
      setEditItem(null);
      fetchStock(page);
    } catch (err) {
      showToast(err.response?.data?.message || "Cập nhật thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = stocks.filter(s =>
    (s.san_pham?.tensp || "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = stocks.filter(s => s.soluongtonkho > 0 && s.soluongtonkho <= (s.soluongkhothap ?? 5)).length;
  const outCount = stocks.filter(s => s.soluongtonkho === 0).length;

  return (
    <StaffMasterLayout title="Kiểm kê Tồn kho – ToiYeuPC Staff">
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        .stock-row:hover { background: #f8fafc !important; }
        .stock-row { transition: background 0.15s; }
        .btn-edit:hover { background: #dbeafe !important; color: #1d4ed8 !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          color: toast.type === "success" ? "#16a34a" : "#dc2626",
          padding: "14px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s ease",
        }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {editItem && (
        <EditModal item={editItem} onSave={handleSave} onClose={() => setEditItem(null)} saving={saving} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              📦 Kiểm kê Cập nhật Tồn kho
            </h2>
            {branch && (
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
                Chi nhánh: <span style={{ fontWeight: 700, color: "#2563eb" }}>{branch}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => fetchStock(page)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569" }}
          >
            <RefreshIcon /> Tải lại
          </button>
        </div>

        {/* Summary Cards */}
        {!loading && !error && (
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>{stocks.length}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Tổng loại sản phẩm</div>
            </div>
            <div style={{ flex: "1 1 140px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706" }}>{lowStockCount}</div>
              <div style={{ fontSize: 13, color: "#92400e", marginTop: 2 }}>Sắp hết hàng</div>
            </div>
            <div style={{ flex: "1 1 140px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#dc2626" }}>{outCount}</div>
              <div style={{ fontSize: 13, color: "#7f1d1d", marginTop: 2 }}>Hết hàng</div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 400 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
          <SearchIcon />
        </span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}
          onFocus={e => e.target.style.borderColor = "#2563eb"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px", color: "#dc2626", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <WarningIcon /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontSize: 14 }}>Đang tải dữ liệu kho...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "13px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                <th style={{ padding: "13px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sản phẩm</th>
                <th style={{ padding: "13px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tồn kho</th>
                <th style={{ padding: "13px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ngưỡng cảnh báo</th>
                <th style={{ padding: "13px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trạng thái</th>
                <th style={{ padding: "13px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "50px", color: "#94a3b8", fontSize: 14 }}>
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id_khoton} className="stock-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8" }}>{idx + 1}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.san_pham?.thumbail ? (
                          <img src={item.san_pham.thumbail} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f1f5f9", flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.san_pham?.tensp || "—"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            ID kho: #{item.id_khoton}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: item.soluongtonkho === 0 ? "#dc2626" : item.soluongtonkho <= (item.soluongkhothap ?? 5) ? "#d97706" : "#0f172a" }}>
                        {item.soluongtonkho}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: "#64748b" }}>
                      {item.soluongkhothap ?? 5}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <StockBadge qty={item.soluongtonkho} threshold={item.soluongkhothap ?? 5} />
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => setEditItem(item)}
                        className="btn-edit"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid #bfdbfe", borderRadius: 8, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                      >
                        <EditIcon /> Cập nhật
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px", borderTop: "1px solid #f1f5f9" }}>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, border: "1px solid", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    borderColor: page === p ? "#2563eb" : "#e2e8f0",
                    background: page === p ? "#2563eb" : "#fff",
                    color: page === p ? "#fff" : "#475569"
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </StaffMasterLayout>
  );
};

export default LocalStockPage;
