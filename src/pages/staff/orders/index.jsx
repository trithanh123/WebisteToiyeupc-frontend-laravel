import React, { useState, useEffect, useCallback } from "react";
import StaffMasterLayout from "../theme/masterLayout";
import axios from "axios";

// ─── Staff API ─────────────────────────────────────────────────────────────────
const staffApi = axios.create({ baseURL: "https://webistetoiyeupc-backend-laravel.onrender.com/api" });
staffApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem("staff_access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_LIST = ["all", "Chờ duyệt", "Đang chuẩn bị", "Đang giao hàng", "Đang giao", "Đã giao", "Đã hủy", "Giao thất bại"];

const STATUS_STYLE = {
  "Chờ duyệt":      { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "Đang chuẩn bị":  { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  "Đang giao hàng": { bg: "#f0f9ff", color: "#0891b2", border: "#bae6fd" },
  "Đang giao":      { bg: "#f0f9ff", color: "#0891b2", border: "#bae6fd" },
  "Đã giao":        { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "Đã hủy":         { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "Giao thất bại":  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

// Transitions allowed by staff
const NEXT_STATUS = {
  "Chờ duyệt":      "Đang chuẩn bị",
  "Đang chuẩn bị":  "Đang giao hàng",
  "Đang giao hàng": "Đã giao",
  "Đang giao":      "Đã giao",
};

const fmt = (n) => Number(n).toLocaleString("vi-VN") + "₫";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

// ─── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ orderId, onClose, onStatusUpdated }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast]     = useState(null);
  const [selectedSerials, setSelectedSerials] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    staffApi.get(`/staff/orders/${orderId}`)
      .then(res => setData(res.data.data))
      .catch(() => showToast("Không thể tải chi tiết đơn hàng.", "error"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSerialChange = (chitietId, index, serialId) => {
    setSelectedSerials(prev => {
      const arr = [...(prev[chitietId] || [])];
      arr[index] = serialId;
      return { ...prev, [chitietId]: arr };
    });
  };

  const handleUpdateStatus = async (statusArg) => {
    const next = typeof statusArg === 'string' ? statusArg : NEXT_STATUS[data?.order?.trang_thai_dh];
    if (!next) return;

    let payload = { trang_thai_dh: next };
    if (next === 'Đang giao hàng' || next === 'Đang giao') {
        const serialsPayload = [];
        for (const item of (data?.items || [])) {
           const selected = selectedSerials[item.id_chitietdh] || [];
           const validSelections = selected.filter(Boolean);
           if (validSelections.length < item.soluong) {
               showToast(`Vui lòng chọn đủ ${item.soluong} Serial cho SP: ${item.tensp}`, "error");
               return;
           }
           validSelections.forEach(sid => {
               serialsPayload.push({ id_chitietdh: item.id_chitietdh, id_serial: parseInt(sid) });
           });
        }
        payload.serials = serialsPayload;
    }

    if (!window.confirm(`Xác nhận chuyển đơn hàng #${orderId} sang "${next}"?`)) return;
    setUpdating(true);
    try {
      await staffApi.put(`/staff/orders/${orderId}/status`, payload);
      showToast(`Đã cập nhật thành "${next}"!`, "success");
      setData(prev => ({ ...prev, order: { ...prev.order, trang_thai_dh: next } }));
      onStatusUpdated();
    } catch (err) {
      showToast(err.response?.data?.message || "Cập nhật thất bại!", "error");
    } finally {
      setUpdating(false);
    }
  };

  const order = data?.order;
  const items = data?.items || [];
  const nextStatus = order ? NEXT_STATUS[order.trang_thai_dh] : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 18, width: "100%", maxWidth: 660,
        maxHeight: "88vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        animation: "slideUp 0.2s ease"
      }}>
        {/* Toast inside modal */}
        {toast && (
          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: toast.type === "success" ? "#16a34a" : "#dc2626",
            padding: "12px 20px", fontSize: 13, fontWeight: 600,
            borderBottom: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`
          }}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              Chi tiết đơn hàng #{orderId}
            </h3>
            {order && <div style={{ marginTop: 6 }}><StatusBadge status={order.trang_thai_dh} /></div>}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>Đang tải...</div>
        ) : order ? (
          <div style={{ padding: "20px 24px" }}>
            {/* Customer info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Khách hàng",   value: order.tenkhachhang },
                { label: "SĐT khách",    value: order.sdt_khach },
                { label: "Người nhận",   value: order.ten_nguoinhan || order.tenkhachhang },
                { label: "SĐT nhận",     value: order.sdt_nguoinhan || order.sdt_khach },
                { label: "Địa chỉ",      value: order.diachi_chitiet, span: true },
                { label: "Thanh toán",   value: `${order.phuong_thuc_tt} · ${order.trangthaithanhtoan || "—"}` },
                { label: "Ngày đặt",     value: fmtDate(order.thoigiandathang) },
                { label: "Ghi chú",      value: order.ghichu || "Không có", span: true },
              ].map(f => (
                <div key={f.label} style={{ gridColumn: f.span ? "1/-1" : undefined, background: "#f8fafc", borderRadius: 8, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginTop: 3 }}>{f.value || "—"}</div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sản phẩm trong đơn</div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", padding: "12px 16px", borderTop: idx > 0 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {item.thumbail ? (
                        <img src={item.thumbail} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f1f5f9", flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.tensp}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>x{item.soluong} · Đơn giá: {fmt(item.don_gia)}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#2563eb", flexShrink: 0 }}>{fmt(item.thanh_tien)}</div>
                    </div>
                    {nextStatus === 'Đang giao hàng' && (
                      <div style={{ marginTop: 12, padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>Vui lòng chọn Serial để xuất kho:</div>
                        {Array.from({ length: item.soluong }).map((_, i) => (
                          <div key={i} style={{ marginBottom: 6 }}>
                            <select
                              value={(selectedSerials[item.id_chitietdh] || [])[i] || ""}
                              onChange={e => handleSerialChange(item.id_chitietdh, i, e.target.value)}
                              style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                            >
                              <option value="">-- Chọn Serial {i + 1} --</option>
                              {(item.available_serials || []).map(ser => {
                                // Prevent selecting the same serial twice
                                const isSelectedByOther = (selectedSerials[item.id_chitietdh] || []).some((sid, idx) => idx !== i && sid == ser.id_serial);
                                return (
                                  <option key={ser.id_serial} value={ser.id_serial} disabled={isSelectedByOther}>
                                    {ser.serial_code}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        ))}
                        {(!item.available_serials || item.available_serials.length < item.soluong) && (
                           <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>Kho hiện tại không đủ Serial để giao!</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: 10, marginBottom: 20 }}>
              <span style={{ fontWeight: 600, color: "#475569" }}>Tổng tiền đơn hàng</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#2563eb" }}>{fmt(order.tongtien)}</span>
            </div>

            {/* Action */}
            {order.trang_thai_dh === 'Đang giao hàng' || order.trang_thai_dh === 'Đang giao' ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleUpdateStatus('Giao thất bại')}
                  disabled={updating}
                  style={{
                    flex: 1, padding: "13px", border: "none", borderRadius: 10,
                    background: updating ? "#fca5a5" : "#ef4444",
                    color: "#fff", fontWeight: 700, fontSize: 14, cursor: updating ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(239,68,68,0.35)"
                  }}
                >
                  {updating ? "Đang xử lý..." : `❌ Bơm hàng (Thất bại)`}
                </button>
                <button
                  onClick={() => handleUpdateStatus('Đã giao')}
                  disabled={updating}
                  style={{
                    flex: 1, padding: "13px", border: "none", borderRadius: 10,
                    background: updating ? "#86efac" : "#22c55e",
                    color: "#fff", fontWeight: 700, fontSize: 14, cursor: updating ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(34,197,94,0.35)"
                  }}
                >
                  {updating ? "Đang xử lý..." : `✅ Đã giao xong`}
                </button>
              </div>
            ) : nextStatus && order.trang_thai_dh !== 'Đang giao hàng' && order.trang_thai_dh !== 'Đang giao' && (
              <button
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updating}
                style={{
                  width: "100%", padding: "13px", border: "none", borderRadius: 10,
                  background: updating ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  color: "#fff", fontWeight: 700, fontSize: 14, cursor: updating ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(37,99,235,0.35)"
                }}
              >
                {updating ? "Đang cập nhật..." : `✅ Chuyển sang "${nextStatus}"`}
              </button>
            )}
            {!nextStatus && !["Đã giao", "Đã hủy", "Giao thất bại"].includes(order.trang_thai_dh) && order.trang_thai_dh !== 'Đang giao hàng' && order.trang_thai_dh !== 'Đang giao' && (
              <div style={{ textAlign: "center", padding: "12px", color: "#94a3b8", fontSize: 13 }}>
                Đơn hàng đã ở trạng thái cuối.
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px", color: "#dc2626" }}>Không tải được đơn hàng.</div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StaffOrders = () => {
  const [orders, setOrders]     = useState([]);
  const [meta, setMeta]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("all");
  const [page, setPage]         = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page });
      if (status !== "all") params.append("status", status);
      if (search)           params.append("search", search);
      const res = await staffApi.get(`/staff/orders?${params}`);
      const d = res.data.data;
      setOrders(d.data || []);
      setMeta(d);
    } catch (err) {
      if (err.response?.status === 403) setError("Bạn chưa được phân công vào chi nhánh nào.");
      else setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const statusCounts = { all: meta?.total || 0 };

  return (
    <StaffMasterLayout title="Xử Lý Đơn Hàng – ToiYeuPC Staff">
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .order-row:hover { background: #f8fafc !important; cursor: pointer; }
        .order-row { transition: background 0.15s; }
      `}</style>

      {selectedId && (
        <DetailModal
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusUpdated={fetchOrders}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
          📋 Xử Lý Đơn Hàng
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
          Quản lý các đơn hàng được giao đến chi nhánh của bạn
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}
            onFocus={e => e.target.style.borderColor = "#2563eb"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#475569", outline: "none", cursor: "pointer", background: "#fff", minWidth: 160 }}
        >
          {STATUS_LIST.map(s => (
            <option key={s} value={s}>
              {s === "all" ? "Tất cả trạng thái" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px", color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ margin: 0, fontSize: 13 }}>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
            Không có đơn hàng nào.
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Mã ĐH", "Ngày đặt", "Khách hàng", "SĐT", "Sản phẩm", "Tổng tiền", "Trạng thái", "Thao tác"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id_donhang} className="order-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#2563eb", fontSize: 13 }}>#{o.id_donhang}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>{fmtDate(o.thoigiandathang)}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{o.tenkhachhang}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{o.sdt_khach}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.phuong_thuc_tt}
                    </td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, fontSize: 13, color: "#2563eb", whiteSpace: "nowrap" }}>{fmt(o.tongtien)}</td>
                    <td style={{ padding: "13px 16px" }}><StatusBadge status={o.trang_thai_dh} /></td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        onClick={() => setSelectedId(o.id_donhang)}
                        style={{ padding: "6px 14px", border: "1px solid #bfdbfe", borderRadius: 8, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "14px", borderTop: "1px solid #f1f5f9" }}>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button
                    key={p} onClick={() => setPage(p)}
                    style={{ width: 34, height: 34, border: "1px solid", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", borderColor: page === p ? "#2563eb" : "#e2e8f0", background: page === p ? "#2563eb" : "#fff", color: page === p ? "#fff" : "#475569" }}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Total count */}
      {!loading && meta && (
        <div style={{ textAlign: "right", fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
          Tổng: {meta.total} đơn hàng
        </div>
      )}
    </StaffMasterLayout>
  );
};

export default StaffOrders;
