import React, { useState, useEffect } from "react";
import AdminSidebar from "../sidebar";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

// ── Icons ──────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
    stroke="#e30019" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

// ══════════════════════════════════════════════════════════════
// FORM ĐĂNG NHẬP ADMIN
// ══════════════════════════════════════════════════════════════
const AdminLoginForm = ({ onLoginSuccess }) => {
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ email/SĐT và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      // Bước 1: Đăng nhập lấy token
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (data.status !== "success") {
        setError(data.message || "Email/SĐT hoặc mật khẩu không chính xác!");
        setLoading(false);
        return;
      }

      const token = data.token;

      // Bước 2: Lấy thông tin user để kiểm tra phân quyền
      const meRes = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const meData = await meRes.json();

      if (meData.status !== "success") {
        setError("Không thể xác thực tài khoản. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      const user = meData.user;

      // Bước 3: Kiểm tra phân quyền - chỉ Admin (Phanquyen = 1) mới được vào
      if (Number(user.Phanquyen) !== 1) {
        setError(
          `Tài khoản "${user.Ten}" có vai trò ${
            user.Phanquyen === 2 ? "Nhân viên" : "Khách hàng"
          }. Chỉ Admin mới được truy cập trang quản trị!`
        );
        setLoading(false);
        return;
      }

      // Bước 4: Lưu token và thông tin admin
      localStorage.setItem("access_token", token);
      localStorage.setItem("admin_user", JSON.stringify(user));
      onLoginSuccess(user);

    } catch {
      setError("Không thể kết nối đến server. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    }}>
      {/* Hiệu ứng nền */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        {[
          { w:300, h:300, top:"10%", left:"5%",  opacity:0.06 },
          { w:400, h:400, top:"50%", right:"5%", opacity:0.05 },
          { w:200, h:200, bottom:"10%", left:"30%", opacity:0.07 },
        ].map((c, i) => (
          <div key={i} style={{
            position:"absolute", width:c.w, height:c.h, top:c.top,
            left:c.left, right:c.right, bottom:c.bottom,
            borderRadius:"50%", background:"#e30019", opacity:c.opacity,
            filter:"blur(60px)",
          }}/>
        ))}
      </div>

      {/* Card đăng nhập */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "44px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 16,
            background: "rgba(227,0,25,0.15)",
            border: "1px solid rgba(227,0,25,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <LockIcon />
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>
            Đăng nhập Quản trị
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "6px 0 0" }}>
            Chỉ dành cho tài khoản <span style={{ color: "#f87171", fontWeight: 600 }}>Admin</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 10, padding: "12px 14px", marginBottom: 20,
            color: "#fca5a5", fontSize: 13, lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email / SĐT */}
          <div>
            <label style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Email hoặc Số điện thoại
            </label>
            <input
              type="text"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@toiyeupc.com"
              autoComplete="username"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", fontSize: 14, outline: "none",
                boxSizing: "border-box",
                transition: "border .2s",
              }}
              onFocus={e => e.target.style.borderColor = "#e30019"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%", padding: "11px 42px 11px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 14, outline: "none",
                  boxSizing: "border-box", transition: "border .2s",
                }}
                onFocus={e => e.target.style.borderColor = "#e30019"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#64748b",
                display: "flex", padding: 0,
              }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {/* Nút đăng nhập */}
          <button type="submit" disabled={loading} style={{
            marginTop: 8, padding: "13px", borderRadius: 10, border: "none",
            background: loading
              ? "rgba(227,0,25,0.4)"
              : "linear-gradient(135deg, #e30019, #b91c1c)",
            color: "#fff", fontWeight: 700, fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity .2s",
            boxShadow: "0 4px 15px rgba(227,0,25,0.4)",
          }}>
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }}/>
                Đang xác thực...
              </>
            ) : "🔐 Đăng nhập"}
          </button>
        </form>

        <p style={{ color: "#475569", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          Hệ thống quản trị nội bộ ToiYeuPC
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADMIN MASTER LAYOUT (có Auth Guard)
// ══════════════════════════════════════════════════════════════
const AdminMasterLayout = ({ children, title = "Admin – ToiYeuPC" }) => {
  const [authState, setAuthState] = useState("checking"); // checking | login | ok
  const [adminUser, setAdminUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API}/admin/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setNotifications(data.data);
          setUnreadCount(data.unread_count);
        }
      } catch (err) {
        console.error("Lỗi lấy thông báo:", err);
      }
    };
    fetchNotifications();

    // Axios Interceptor: Lắng nghe mọi request POST, PUT, DELETE để làm mới chuông ngay lập tức
    const interceptor = axios.interceptors.response.use(
      (response) => {
        const method = response.config?.method?.toLowerCase();
        if (['post', 'put', 'delete', 'patch'].includes(method)) {
          // Chỉ làm mới nếu đây là API call thành công
          fetchNotifications();
        }
        return response;
      },
      (error) => Promise.reject(error)
    );

    // Tự động làm mới chuông mỗi 30 giây (backup)
    const intervalId = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(intervalId);
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API}/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Cập nhật lại UI sau khi click
      setNotifications(notifications.map(n => n.id_ThongBao === id ? { ...n, da_doc: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (link) window.location.href = link;
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API}/admin/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, da_doc: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  // Kiểm tra token khi vào trang
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setAuthState("login"); return; }

    // Xác thực token với server
    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === "success" && Number(data.user.Phanquyen) === 1) {
          setAdminUser(data.user);
          localStorage.setItem("admin_user", JSON.stringify(data.user));
          setAuthState("ok");
        } else {
          // Token có nhưng không phải admin
          localStorage.removeItem("access_token");
          setAuthState("login");
        }
      })
      .catch(() => {
        setAuthState("login");
      });
  }, []);

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    setAuthState("ok");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/";
  };

  // ── Đang kiểm tra ──────────────────────────────────────────
  if (authState === "checking") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0f172a",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, border: "3px solid rgba(227,0,25,0.3)",
            borderTopColor: "#e30019", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }}/>
          <p style={{ color: "#64748b", fontSize: 14 }}>Đang xác thực...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Chưa đăng nhập → hiện form đăng nhập ───────────────────
  if (authState === "login") {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Đã đăng nhập → hiện layout bình thường ─────────────────
  const initial = adminUser?.Ten
    ? adminUser.Ten.trim().split(" ").pop().charAt(0).toUpperCase()
    : "A";

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout__main">
        <header className="admin-layout__topbar">
          <div />
          <div className="admin-layout__topbar-right" style={{ position: "relative" }}>
            {/* Chuông thông báo */}
            <div style={{ position: "relative" }}>
              <button className="admin-layout__bell" aria-label="Thông báo" onClick={() => { setShowNotif(!showNotif); setUnreadCount(0); setDropdownOpen(false); }}>
                <BellIcon />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "#e30019", color: "#fff", fontSize: 10,
                    width: 16, height: 16, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold"
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Popup thông báo */}
              {showNotif && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.12)", width: 300, zIndex: 100,
                  overflow: "hidden"
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: "bold", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: "#1e293b", fontSize: 14 }}>Thông báo</span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: 11, color: '#e30019', cursor: 'pointer', fontWeight: "normal" }} onClick={handleMarkAllAsRead}>Đánh dấu đã đọc</span>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Không có thông báo mới</div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id_ThongBao} 
                          onClick={() => handleMarkAsRead(n.id_ThongBao, n.link)}
                          style={{ 
                            padding: "12px 16px", 
                            borderBottom: "1px solid #f8fafc",
                            background: n.da_doc ? '#fff' : '#f0f9ff',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseOut={(e) => e.currentTarget.style.background = n.da_doc ? '#fff' : '#f0f9ff'}
                        >
                          <div style={{ color: "#0f172a", fontSize: 13, fontWeight: n.da_doc ? 'normal' : 'bold' }}>{n.tieu_de}</div>
                          <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.4, marginTop: 4 }}>{n.noi_dung}</div>
                          <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 6 }}>🕒 {new Date(n.created_at).toLocaleString('vi-VN')}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + Tên admin — click mở dropdown */}
            <div
              onClick={() => { setDropdownOpen(!dropdownOpen); setShowNotif(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              {/* Avatar vòng tròn với chữ cái đầu */}
              {adminUser?.avatar ? (
                <img src={adminUser.avatar} alt=""
                  style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover",
                    border: "2px solid #e30019" }}
                />
              ) : (
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg,#e30019,#b91c1c)",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 800, fontSize: 14,
                  border: "2px solid rgba(227,0,25,0.3)",
                }}>
                  {initial}
                </div>
              )}

              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Quản trị viên</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", maxWidth: 120,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {adminUser?.Ten || "Admin"}
                </div>
              </div>
              <ChevronIcon />
            </div>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)", width: 240, zIndex: 100,
                overflow: "hidden",
              }}
              onClick={e => e.stopPropagation()}
              >
                {/* Header dropdown */}
                <div style={{
                  padding: "14px 16px", borderBottom: "1px solid #f1f5f9",
                  display: "flex", gap: 12, alignItems: "center",
                  background: "linear-gradient(135deg,#fff5f5,#fff)",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#e30019,#b91c1c)",
                    color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 800, fontSize: 16,
                  }}>
                    {initial}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {adminUser?.Ten}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {adminUser?.email || adminUser?.SDT}
                    </div>
                    <span style={{
                      display: "inline-block", marginTop: 4, padding: "1px 8px",
                      borderRadius: "999px", background: "#fee2e2",
                      color: "#b91c1c", fontSize: 11, fontWeight: 700,
                    }}>
                      🛡️ Admin
                    </span>
                  </div>
                </div>

                {/* Thông tin */}
                <div style={{ padding: "8px 0" }}>
                  {[
                    { icon: "🆔", label: "ID tài khoản", value: `#${adminUser?.id}` },
                    { icon: "📧", label: "Email", value: adminUser?.email || "—" },
                    { icon: "📱", label: "Số điện thoại", value: adminUser?.SDT || "—" },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: "8px 16px", display: "flex", alignItems: "center", gap: 10,
                      fontSize: 13,
                    }}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      <div>
                        <div style={{ color: "#94a3b8", fontSize: 11 }}>{item.label}</div>
                        <div style={{ color: "#1e293b", fontWeight: 500, fontSize: 13,
                          maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap" }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nút đăng xuất */}
                <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #f1f5f9" }}>
                  <button onClick={handleLogout} style={{
                    width: "100%", padding: "9px", borderRadius: 8, border: "none",
                    background: "#fee2e2", color: "#dc2626", fontWeight: 700,
                    fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}
                  onMouseOver={e => { e.currentTarget.style.background="#dc2626"; e.currentTarget.style.color="#fff"; }}
                  onMouseOut={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#dc2626"; }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            )}

            {/* Overlay để đóng dropdown khi click ra ngoài */}
            {dropdownOpen && (
              <div onClick={() => setDropdownOpen(false)} style={{
                position: "fixed", inset: 0, zIndex: 99,
              }}/>
            )}
          </div>
        </header>

        <main className="admin-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminMasterLayout;
