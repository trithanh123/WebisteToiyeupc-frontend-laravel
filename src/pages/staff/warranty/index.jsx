import React, { useState, useEffect, useCallback } from "react";
import StaffMasterLayout from "../theme/masterLayout";
import axios from "axios";

// ─── Staff API ──────────────────────────────────────────────────────────────
const staffApi = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
staffApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("staff_access_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Constants ──────────────────────────────────────────────────────────────
const LOAI_YEU_CAU = ["Bảo hành", "Hỗ trợ kỹ thuật", "Đổi trả"];
const TRANG_THAI_LIST = ["all", "Chờ tiếp nhận", "Đang xử lý", "Hoàn thành", "Từ chối"];
const TRANG_THAI_NEXT = {
  "Chờ tiếp nhận": ["Đang xử lý", "Từ chối"],
  "Đang xử lý":   ["Hoàn thành", "Từ chối"],
};
const TRANG_THAI_STYLE = {
  "Chờ tiếp nhận": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "Đang xử lý":   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  "Hoàn thành":   { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "Từ chối":      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

// ─── Badge ──────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const s = TRANG_THAI_STYLE[status] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {status}
    </span>
  );
};

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  const bg = toast.type === "success" ? "#22c55e" : "#ef4444";
  return (
    <div style={{ position: "fixed", top: 24, right: 24, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "fadeIn .3s" }}>
      {toast.msg}
    </div>
  );
};

// ─── Modal Tạo Phiếu ────────────────────────────────────────────────────────
const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ ma_nguoidung: "", loai_yeu_cau: "Bảo hành", mo_ta_loi: "", ma_donhang: "", ma_serial: "" });
  const [serialSearch, setSerialSearch] = useState("");
  const [serialResults, setSerialResults] = useState([]);
  const [serialLoading, setSerialLoading] = useState(false);
  const [serialSearched, setSerialSearched] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const searchSerial = async () => {
    if (!serialSearch.trim()) return;
    setSerialLoading(true);
    setSerialSearched(false);
    setSerialResults([]);
    try {
      const res = await staffApi.get("/staff/warranty/search-serial", { params: { serial_code: serialSearch } });
      const results = res.data.data || [];
      setSerialResults(results);
      setSerialSearched(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi tìm serial.", "error");
    } finally {
      setSerialLoading(false);
    }
  };

  const loadOrders = async (uid) => {
    if (!uid) return setUserOrders([]);
    const res = await staffApi.get("/staff/warranty/orders-by-user", { params: { ma_nguoidung: uid } });
    setUserOrders(res.data.data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_nguoidung || !form.mo_ta_loi) return showToast("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");

    // Nếu là Bảo hành / Đổi trả thì bắt buộc phải có serial
    if (["Bảo hành", "Đổi trả"].includes(form.loai_yeu_cau) && !selectedSerial) {
      return showToast("Vui lòng BẤM CHỌN một Serial từ kết quả tìm kiếm!", "error");
    }

    setLoading(true);
    try {
      await staffApi.post("/staff/warranty", { ...form, ma_serial: selectedSerial?.id_serial || null });
      showToast("Tạo phiếu thành công!");
      setTimeout(() => { onCreated(); onClose(); }, 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi tạo phiếu.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.overlay}>
      <Toast toast={toast} />
      <div style={{ ...styles.modal, maxWidth: 560 }}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>📋 Tạo Phiếu Hỗ Trợ / Bảo Hành</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>ID Khách hàng *</label>
            <input style={styles.input} type="number" placeholder="Nhập ID khách hàng" value={form.ma_nguoidung}
              onChange={e => { setForm(f => ({ ...f, ma_nguoidung: e.target.value })); loadOrders(e.target.value); }} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Loại yêu cầu *</label>
            <select style={styles.input} value={form.loai_yeu_cau} onChange={e => setForm(f => ({ ...f, loai_yeu_cau: e.target.value }))}>
              {LOAI_YEU_CAU.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {userOrders.length > 0 && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Đơn hàng liên quan</label>
              <select style={styles.input} value={form.ma_donhang} onChange={e => setForm(f => ({ ...f, ma_donhang: e.target.value }))}>
                <option value="">-- Không chọn --</option>
                {userOrders.map(o => <option key={o.id_donhang} value={o.id_donhang}>#{o.id_donhang} – {Number(o.tongtien).toLocaleString("vi-VN")}₫ ({fmt(o.thoigiandathang)})</option>)}
              </select>
            </div>
          )}

          {/* Tìm kiếm Serial */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Tìm Serial sản phẩm</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...styles.input, flex: 1 }}
                placeholder="Nhập serial code rồi nhấn Tìm…"
                value={serialSearch}
                onChange={e => { setSerialSearch(e.target.value); setSerialSearched(false); setSerialResults([]); }}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), searchSerial())}
              />
              <button type="button" onClick={searchSerial} disabled={serialLoading} style={{ ...styles.btnSecondary, minWidth: 60 }}>
                {serialLoading ? "⏳" : "🔍 Tìm"}
              </button>
            </div>

            {/* Đang tìm */}
            {serialLoading && (
              <div style={{ fontSize: 13, color: "#2563eb", marginTop: 6, padding: "6px 10px", background: "#eff6ff", borderRadius: 8 }}>
                🔍 Đang tìm serial…
              </div>
            )}

            {/* Không tìm thấy */}
            {serialSearched && !serialLoading && serialResults.length === 0 && (
              <div style={{ fontSize: 13, color: "#dc2626", marginTop: 6, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                ❌ Không tìm thấy serial <strong>"{serialSearch}"</strong>. Kiểm tra lại mã serial.
              </div>
            )}

            {/* Kết quả tìm */}
            {serialResults.length > 0 && (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, marginTop: 6, overflow: "hidden", maxHeight: 200, overflowY: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ padding: "6px 12px", background: "#f8fafc", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                  Tìm thấy {serialResults.length} kết quả — click để chọn
                </div>
                {serialResults.map(s => (
                  <div key={s.id_serial}
                    onClick={() => { setSelectedSerial(s); setSerialResults([]); setSerialSearched(false); setSerialSearch(s.serial_code); }}
                    style={{ padding: "10px 12px", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #f1f5f9",
                      background: selectedSerial?.id_serial === s.id_serial ? "#eff6ff" : "#fff" }}>
                    {s.thumbail
                      ? <img src={`http://127.0.0.1:8000/storage/${s.thumbail}`} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                      : <div style={{ width: 38, height: 38, borderRadius: 6, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📦</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace", color: "#1d4ed8" }}>{s.serial_code}</div>
                      <div style={{ fontSize: 12, color: "#374151", marginTop: 1 }}>{s.tensp}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99,
                        background: s.tinhtrang === "đã bán" ? "#fef3c7" : s.tinhtrang === "nằm trong kho" ? "#f0fdf4" : "#f1f5f9",
                        color: s.tinhtrang === "đã bán" ? "#d97706" : s.tinhtrang === "nằm trong kho" ? "#16a34a" : "#64748b" }}>
                        {s.tinhtrang}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Serial đã chọn */}
            {selectedSerial && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#15803d", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span>✅ Đã chọn: <strong>{selectedSerial.serial_code}</strong> – {selectedSerial.tensp}</span>
                <button type="button" onClick={() => { setSelectedSerial(null); setSerialSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>✕</button>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mô tả lỗi / yêu cầu *</label>
            <textarea style={{ ...styles.input, minHeight: 90, resize: "vertical" }} placeholder="Mô tả chi tiết vấn đề của khách hàng…"
              value={form.mo_ta_loi} onChange={e => setForm(f => ({ ...f, mo_ta_loi: e.target.value }))} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Hủy</button>
            <button type="submit" disabled={loading} style={styles.btnPrimary}>{loading ? "Đang tạo…" : "Tạo phiếu"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Modal Chi Tiết / Cập Nhật ───────────────────────────────────────────────
const DetailModal = ({ phieuId, onClose, onUpdated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [ketQua, setKetQua] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    staffApi.get(`/staff/warranty/${phieuId}`)
      .then(res => { setData(res.data.data); setKetQua(res.data.data?.ket_qua_xu_ly || ""); })
      .catch(() => showToast("Không thể tải chi tiết.", "error"))
      .finally(() => setLoading(false));
  }, [phieuId]);

  const handleUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await staffApi.put(`/staff/warranty/${phieuId}/status`, { trang_thai: newStatus, ket_qua_xu_ly: ketQua });
      showToast("Cập nhật thành công!");
      setTimeout(() => { onUpdated(); onClose(); }, 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi cập nhật.", "error");
    } finally { setUpdating(false); }
  };

  const nextOptions = TRANG_THAI_NEXT[data?.trang_thai] || [];

  return (
    <div style={styles.overlay}>
      <Toast toast={toast} />
      <div style={{ ...styles.modal, maxWidth: 600 }}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Chi tiết Phiếu #{phieuId}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {loading ? <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>Đang tải…</div> : !data ? <div style={{ color: "#ef4444" }}>Không tìm thấy phiếu.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Trạng thái hiện tại */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Badge status={data.trang_thai} />
                <span style={{ fontSize: 13, color: "#64748b" }}>Tiếp nhận: {fmt(data.ngay_tiep_nhan)}</span>
                {data.ngay_hoan_thanh && <span style={{ fontSize: 13, color: "#64748b" }}>· Hoàn thành: {fmt(data.ngay_hoan_thanh)}</span>}
              </div>

              {/* Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", background: "#f8fafc", borderRadius: 10, padding: 14, fontSize: 13 }}>
                <InfoRow label="Loại yêu cầu" value={data.loai_yeu_cau} />
                <InfoRow label="Khách hàng" value={`${data.ten_khachhang} (${data.sdt_khach})`} />
                <InfoRow label="Nhân viên" value={data.ten_nhanvien || "—"} />
                <InfoRow label="Chi nhánh" value={data.ten_chinhanh || "—"} />
                {data.ma_donhang && <InfoRow label="Đơn hàng" value={`#${data.ma_donhang}`} />}
              </div>

              {/* Serial */}
              {data.serial_code && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 12, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>🔧 Thông tin Serial</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {data.anh_sanpham && <img src={data.anh_sanpham} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{data.ten_sanpham}</div>
                      <div style={{ color: "#2563eb" }}>Serial: {data.serial_code}</div>
                      <div style={{ color: "#64748b" }}>Tình trạng: {data.tinhtrang_serial}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mô tả lỗi */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Mô tả lỗi:</div>
                <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: 10, fontSize: 13, lineHeight: 1.6 }}>{data.mo_ta_loi}</div>
              </div>

              {/* Kết quả xử lý */}
              <div>
                <label style={styles.label}>Kết quả / Ghi chú xử lý</label>
                <textarea style={{ ...styles.input, minHeight: 70, resize: "vertical" }} value={ketQua} onChange={e => setKetQua(e.target.value)}
                  placeholder="Nhập kết quả xử lý…" disabled={nextOptions.length === 0} />
              </div>

              {/* Cập nhật trạng thái */}
              {nextOptions.length > 0 && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Chuyển sang:</span>
                  {nextOptions.map(s => (
                    <button key={s} onClick={() => setNewStatus(s)} style={{ ...styles.btnSecondary, background: newStatus === s ? "#1d4ed8" : undefined, color: newStatus === s ? "#fff" : undefined }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {nextOptions.length > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleUpdate} disabled={!newStatus || updating} style={styles.btnPrimary}>
                    {updating ? "Đang lưu…" : "Lưu cập nhật"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
    <div style={{ fontWeight: 600, marginTop: 2 }}>{value}</div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const StaffWarrantyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { trang_thai: filter, search, page };
      const res = await staffApi.get("/staff/warranty", { params });
      setData(res.data.data);
    } catch {
      showToast("Không thể tải danh sách phiếu.", "error");
    } finally { setLoading(false); }
  }, [filter, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rows = data?.data || [];

  return (
    <StaffMasterLayout>
      <Toast toast={toast} />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        .sw-row:hover { background: #f8fafc !important; }
      `}</style>

      <div style={{ padding: "24px 28px", fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>🛠️ Hỗ Trợ & Bảo Hành</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Quản lý phiếu hỗ trợ kỹ thuật và bảo hành sản phẩm</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={styles.btnPrimary}>+ Tạo phiếu mới</button>
        </div>

        {/* Filters */}
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
          <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", gap: 8, flex: 1, maxWidth: 320 }}>
            <span style={{ color: "#94a3b8" }}>🔍</span>
            <input style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent" }}
              placeholder="Tìm theo tên, SĐT, serial…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", color: "#fff" }}>
                {["#", "Khách hàng", "Loại YC", "Serial", "Sản phẩm", "Trạng thái", "Ngày tiếp nhận", ""].map(h => (
                  <th key={h} style={{ padding: "13px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: .4, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>Đang tải…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>Không có phiếu nào.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={r.id} className="sw-row" style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background .15s" }}
                  onClick={() => setDetailId(r.id)}>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>#{r.id}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{r.ten_khachhang}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>{r.sdt_khach}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{r.loai_yeu_cau}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "monospace", color: "#2563eb" }}>{r.serial_code || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>
                    {r.anh_sanpham && <img src={r.anh_sanpham} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4, marginRight: 6, verticalAlign: "middle" }} />}
                    {r.ten_sanpham || "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }}><Badge status={r.trang_thai} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{fmt(r.ngay_tiep_nhan)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={e => { e.stopPropagation(); setDetailId(r.id); }} style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16 }}>
              {Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                    background: p === page ? "#1d4ed8" : "#f1f5f9", color: p === page ? "#fff" : "#64748b" }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchData} />}
      {detailId && <DetailModal phieuId={detailId} onClose={() => setDetailId(null)} onUpdated={fetchData} />}
    </StaffMasterLayout>
  );
};

// ─── Shared Styles ───────────────────────────────────────────────────────────
const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#fff", borderRadius: 16, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "fadeIn .25s" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", borderRadius: 8, width: 32, height: 32, fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" },
  formGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },
  btnPrimary: { background: "linear-gradient(135deg,#1d4ed8,#2563eb)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnSecondary: { background: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" },
};

export default StaffWarrantyPage;
