import React, { useState, useEffect, useCallback } from "react";
import AdminMasterLayout from "../theme/masterLayout";
import axios from "axios";
const adminApi = axios.create({ baseURL: "https://webistetoiyeupc-backend-laravel.onrender.com/api" });
adminApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("admin_access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
const TRANG_THAI_LIST = ["all", "Chờ tiếp nhận", "Đang xử lý", "Hoàn thành", "Từ chối"];
const TRANG_THAI_STYLE = {
  "Chờ tiếp nhận": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "Đang xử lý": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  "Hoàn thành": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "Từ chối": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};
const TRANG_THAI_NEXT = {
  "Chờ tiếp nhận": ["Đang xử lý", "Từ chối"],
  "Đang xử lý": ["Hoàn thành", "Từ chối"],
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const Badge = ({ status }) => {
  const s = TRANG_THAI_STYLE[status] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {status}
    </span>
  );
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const bg = toast.type === "success" ? "#22c55e" : "#ef4444";
  return (
    <div style={{ position: "fixed", top: 24, right: 24, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "fadeIn .3s" }}>
      {toast.msg}
    </div>
  );
};
const StatCard = ({ label, value, color, bg }) => (
  <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 130 }}>
    <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{label}</div>
  </div>
);
const DetailModal = ({ phieuId, onClose, onUpdated, onDeleted }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [ketQua, setKetQua] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  useEffect(() => {
    adminApi.get(`/admin/warranty/${phieuId}`)
      .then(res => { setData(res.data.data); setKetQua(res.data.data?.ket_qua_xu_ly || ""); })
      .catch(() => showToast("Không tải được chi tiết.", "error"))
      .finally(() => setLoading(false));
  }, [phieuId]);

  const handleUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await adminApi.put(`/admin/warranty/${phieuId}/status`, { trang_thai: newStatus, ket_qua_xu_ly: ketQua });
      showToast("Đã cập nhật!");
      setTimeout(() => { onUpdated(); onClose(); }, 900);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi cập nhật.", "error");
    } finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    try {
      await adminApi.delete(`/admin/warranty/${phieuId}`);
      showToast("Đã từ chối phiếu.");
      setTimeout(() => { onDeleted(); onClose(); }, 900);
    } catch { showToast("Lỗi khi từ chối.", "error"); }
  };

  const nextOptions = TRANG_THAI_NEXT[data?.trang_thai] || [];

  return (
    <div style={styles.overlay}>
      <Toast toast={toast} />
      <div style={{ ...styles.modal, maxWidth: 640 }}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}> Chi tiết Phiếu #{phieuId}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmDel(true)} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Từ chối phiếu
            </button>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>
        </div>

        {confirmDel && (
          <div style={{ background: "#fef2f2", padding: "12px 24px", display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #fecaca" }}>
            <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>Xác nhận từ chối và ẩn phiếu này?</span>
            <button onClick={handleDelete} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 7, padding: "5px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Từ chối</button>
            <button onClick={() => setConfirmDel(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 7, padding: "5px 14px", cursor: "pointer", fontSize: 13 }}>Hủy</button>
          </div>
        )}

        <div style={{ padding: "20px 24px" }}>
          {loading ? <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Đang tải…</div> : !data ? <div style={{ color: "#ef4444" }}>Không tìm thấy.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Badge status={data.trang_thai} />
                <span style={{ fontSize: 13, color: "#64748b" }}>Tiếp nhận: {fmt(data.ngay_tiep_nhan)}</span>
                {data.ngay_hoan_thanh && <span style={{ fontSize: 13, color: "#64748b" }}>· Xong: {fmt(data.ngay_hoan_thanh)}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", background: "#f8fafc", borderRadius: 10, padding: 14, fontSize: 13 }}>
                {[
                  ["Loại YC", data.loai_yeu_cau],
                  ["Khách hàng", `${data.ten_khachhang} – ${data.sdt_khach}`],
                  ["Email", data.email_khach],
                  ["Nhân viên", data.ten_nhanvien || "—"],
                  ["Chi nhánh", data.ten_chinhanh || "—"],
                  ["Đơn hàng", data.ma_donhang ? `#${data.ma_donhang}` : "—"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .4 }}>{l}</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              {data.serial_code && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 12, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>🔧 Serial sản phẩm</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {data.anh_sanpham && <img src={data.anh_sanpham} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "1px solid #bfdbfe" }} />}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{data.ten_sanpham}</div>
                      <div style={{ color: "#2563eb", fontFamily: "monospace" }}>Serial: {data.serial_code}</div>
                      <div style={{ color: "#64748b" }}>Tình trạng: {data.tinhtrang_serial}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Mô tả lỗi:</div>
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: 10, fontSize: 13, lineHeight: 1.6 }}>{data.mo_ta_loi}</div>
              </div>

              <div>
                <label style={styles.label}>Kết quả / Ghi chú xử lý</label>
                <textarea style={{ ...styles.input, minHeight: 70, resize: "vertical" }} value={ketQua}
                  onChange={e => setKetQua(e.target.value)} placeholder="Nhập kết quả xử lý…"
                  disabled={nextOptions.length === 0} />
              </div>

              {nextOptions.length > 0 && (
                <>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Chuyển sang:</span>
                    {nextOptions.map(s => (
                      <button key={s} onClick={() => setNewStatus(s)}
                        style={{ ...styles.btnSecondary, background: newStatus === s ? "#1d4ed8" : undefined, color: newStatus === s ? "#fff" : undefined }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={handleUpdate} disabled={!newStatus || updating} style={styles.btnPrimary}>
                      {updating ? "Đang lưu…" : "Lưu cập nhật"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const AdminWarrantyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/warranty", { params: { trang_thai: filter, search, page } });
      setData(res.data.data);
    } catch { showToast("Không thể tải dữ liệu.", "error"); }
    finally { setLoading(false); }
  }, [filter, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rows = data?.data || [];

  const stats = [
    { label: "Tổng phiếu", value: data?.total ?? "–", color: "#2563eb", bg: "#eff6ff" },
    { label: "Chờ tiếp nhận", value: rows.filter(r => r.trang_thai === "Chờ tiếp nhận").length, color: "#d97706", bg: "#fffbeb" },
    { label: "Đang xử lý", value: rows.filter(r => r.trang_thai === "Đang xử lý").length, color: "#2563eb", bg: "#eff6ff" },
    { label: "Hoàn thành", value: rows.filter(r => r.trang_thai === "Hoàn thành").length, color: "#16a34a", bg: "#f0fdf4" },
  ];

  return (
    <AdminMasterLayout>
      <Toast toast={toast} />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        .aw-row:hover { background: #f8fafc !important; }
      `}</style>

      <div style={{ padding: "24px 28px", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}> Hỗ Trợ & Bảo Hành</h1>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
              style={{ appearance: "none", WebkitAppearance: "none", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 40px 8px 14px", fontSize: 14, fontWeight: 600, color: "#1e293b", cursor: "pointer", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", minWidth: 170 }}
            >
              {TRANG_THAI_LIST.map(t => (
                <option key={t} value={t}>{t === "all" ? "Tất cả trạng thái" : t}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b", fontSize: 12 }}>▼</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", gap: 8, flex: 1, maxWidth: 340 }}>
            <span style={{ color: "#94a3b8" }}></span>
            <input style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent" }}
              placeholder="Tìm theo tên KH, SĐT, serial, chi nhánh…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0" }}>
                {["#", "Khách hàng", "Loại YC", "Serial / Sản phẩm", "Nhân viên", "Chi nhánh", "Trạng thái", "Ngày tiếp nhận", ""].map(h => (
                  <th key={h} style={{ padding: "13px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>Đang tải…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>Không có phiếu nào.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="aw-row" style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background .15s" }}
                  onClick={() => setDetailId(r.id)}>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>#{r.id}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{r.ten_khachhang}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>{r.sdt_khach}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{r.loai_yeu_cau}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>
                    {r.serial_code ? (
                      <div>
                        <div style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12 }}>{r.serial_code}</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{r.ten_sanpham}</div>
                      </div>
                    ) : <span style={{ color: "#94a3b8" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{r.ten_nhanvien || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{r.ten_chinhanh || "—"}</td>
                  <td style={{ padding: "12px 14px" }}><Badge status={r.trang_thai} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{fmt(r.ngay_tiep_nhan)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={e => { e.stopPropagation(); setDetailId(r.id); }}
                      style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && data.last_page > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16 }}>
              {Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                    background: p === page ? "#1d4ed8" : "#f1f5f9", color: p === page ? "#fff" : "#64748b"
                  }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {detailId && (
        <DetailModal
          phieuId={detailId}
          onClose={() => setDetailId(null)}
          onUpdated={fetchData}
          onDeleted={fetchData}
        />
      )}
    </AdminMasterLayout>
  );
};


const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#fff", borderRadius: 16, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "fadeIn .25s" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", borderRadius: 8, width: 32, height: 32, fontSize: 16, color: "#64748b" },
  label: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 },
  input: { border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },
  btnPrimary: { background: "linear-gradient(135deg,#1d4ed8,#2563eb)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnSecondary: { background: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" },
};

export default AdminWarrantyPage;
