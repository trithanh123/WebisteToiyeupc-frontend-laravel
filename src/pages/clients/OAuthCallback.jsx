import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Đang xác thực...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("Đăng nhập thất bại. Đang chuyển về trang chủ...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (!code) {
      setStatus("Không tìm thấy mã xác thực.");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    axios
      .post(`${API}/auth/exchange-code`, { code })
      .then((res) => {
        if (res.data.status === "success") {
          localStorage.setItem("access_token", res.data.token);
          setStatus("Đăng nhập thành công! Đang chuyển trang...");

          window.history.replaceState({}, document.title, "/");
          window.location.href = "/";
        } else {
          setStatus("Xác thực thất bại. Đang chuyển về trang chủ...");
          setTimeout(() => navigate("/"), 2000);
        }
      })
      .catch(() => {
        setStatus("Mã xác thực hết hạn hoặc không hợp lệ.");
        setTimeout(() => navigate("/"), 2000);
      });
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "#f7f8fa",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {}
      <svg
        style={{ animation: "spin 1s linear infinite", width: 48, height: 48 }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
        <circle
          style={{ opacity: 0.25 }}
          cx="12" cy="12" r="10"
          stroke="#dc2626" strokeWidth="4"
        />
        <path
          style={{ opacity: 0.85 }}
          fill="#dc2626"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p style={{ fontSize: 16, color: "#374151", fontWeight: 500 }}>{status}</p>
    </div>
  );
}

export default OAuthCallback;
