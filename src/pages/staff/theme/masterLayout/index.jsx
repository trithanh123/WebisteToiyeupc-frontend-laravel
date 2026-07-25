import React, { useState, useEffect } from "react";
import StaffSidebar from "../sidebar";
import axios from "../../../../utils/axiosConfig"; // Dùng axios đã cấu hình CSRF

const API = "http://127.0.0.1:8000/api";
const BACKEND_URL = "http://127.0.0.1:8000";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const StaffLoginForm = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      // 1. Gọi CSRF Cookie Endpoint để thiết lập bảo vệ CSRF
      await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`);

      // 2. Đăng nhập lấy token
      const res = await axios.post(`${API}/login`, {
        email: form.email,
        password: form.password
      });

      if (res.data.status !== "success") {
        setError(res.data.message || "Email/SĐT hoặc mật khẩu không chính xác!");
        setLoading(false);
        return;
      }

      const token = res.data.token;

      // 3. Lấy thông tin user
      const meRes = await axios.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (meRes.data.status !== "success") {
        setError("Không thể xác thực tài khoản. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      const user = meRes.data.user;

      // Kiểm tra quyền Nhân viên (phanquyen = 2)
      if (Number(user.phanquyen) !== 2) {
        setError(
          `Tài khoản "${user.ten}" không phải là Nhân viên. Vui lòng dùng tài khoản cấp phát cho Nhân viên!`
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("staff_access_token", token);
      localStorage.setItem("staff_user", JSON.stringify(user));
      onLoginSuccess(user);

    } catch (err) {
      if (err.response?.status === 419) {
        setError("Lỗi xác thực CSRF Token. Vui lòng tải lại trang.");
      } else {
        setError(err.response?.data?.message || "Không thể kết nối đến server hoặc sai thông tin.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    }}>
      <div style={{
        position: "relative", zIndex: 1, background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 420,
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 16, background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", 
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <LockIcon />
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>
            Đăng nhập Nhân viên
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "6px 0 0" }}>
            Hệ thống quản lý dành riêng cho <span style={{ color: "#60a5fa", fontWeight: 600 }}>Staff</span>
          </p>
        </div>

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
          <div>
            <label style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Email hoặc Số điện thoại
            </label>
            <input
              type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="staff@toiyeupc.com" autoComplete="username"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, outline: "none",
                boxSizing: "border-box", transition: "border .2s",
              }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />
          </div>

          <div>
            <label style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" autoComplete="current-password"
                style={{
                  width: "100%", padding: "11px 42px 11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, outline: "none",
                  boxSizing: "border-box", transition: "border .2s",
                }}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
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

          <button type="submit" disabled={loading} style={{
            marginTop: 8, padding: "13px", borderRadius: 10, border: "none",
            background: loading ? "rgba(37,99,235,0.4)" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity .2s", boxShadow: "0 4px 15px rgba(37,99,235,0.4)",
          }}>
            {loading ? "Đang xác thực..." : "🔐 Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

const StaffMasterLayout = ({ children, title = "Nhân Viên – ToiYeuPC" }) => {
  const [authState, setAuthState] = useState("checking");
  const [staffUser, setStaffUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const token = localStorage.getItem("staff_access_token");
    if (!token) { setAuthState("login"); return; }

    axios.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data.status === "success" && Number(res.data.user.phanquyen) === 2) {
          setStaffUser(res.data.user);
          localStorage.setItem("staff_user", JSON.stringify(res.data.user));
          setAuthState("ok");
        } else {
          localStorage.removeItem("staff_access_token");
          setAuthState("login");
        }
      })
      .catch(() => {
        setAuthState("login");
      });
  }, []);

  const handleLoginSuccess = (user) => {
    setStaffUser(user);
    setAuthState("ok");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("staff_access_token");
    if (token) {
      try {
        await axios.post(`${API}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Lỗi đăng xuất:", err);
      }
    }
    localStorage.removeItem("staff_access_token");
    localStorage.removeItem("staff_user");
    window.location.href = "/staff";
  };

  if (authState === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <p style={{ color: "#64748b" }}>Đang xác thực...</p>
      </div>
    );
  }

  if (authState === "login") {
    return <StaffLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const initial = staffUser?.ten ? staffUser.ten.trim().split(" ").pop().charAt(0).toUpperCase() : "NV";

  return (
    <div className="admin-layout"> {/* Using admin-layout class for styles */}
      <StaffSidebar />
      <div className="admin-layout__main">
        <header className="admin-layout__topbar">
          <div />
          <div className="admin-layout__topbar-right" style={{ position: "relative" }}>
            <button className="admin-layout__bell" aria-label="Thông báo">
              <BellIcon />
            </button>

            <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              {staffUser?.avatar ? (
                <img src={staffUser.avatar} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #2563eb" }} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, border: "2px solid rgba(37,99,235,0.3)" }}>
                  {initial}
                </div>
              )}
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Nhân viên</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {staffUser?.ten || "Staff"}
                </div>
              </div>
              <ChevronIcon />
            </div>

            {dropdownOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", width: 240, zIndex: 100, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #f1f5f9" }}>
                  <button onClick={handleLogout} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            )}
            {dropdownOpen && <div onClick={() => setDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
          </div>
        </header>

        <main className="admin-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffMasterLayout;
