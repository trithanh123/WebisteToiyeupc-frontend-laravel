import React, { useState, useRef, useEffect } from 'react';

const API = 'http://127.0.0.1:8000/api';

// ============================================================
// COMPONENT: AuthModal (Đăng nhập / Đăng ký / Quên mật khẩu)
// ============================================================
const AuthModal = ({ isOpen, onClose }) => {
  // Trạng thái Form: 'login' | 'register' | 'forgot-step1' | 'forgot-step2' | 'forgot-step3'
  const [view, setView] = useState('login');

  // Phương thức Đăng nhập: 'email' hoặc 'phone'
  const [loginMethod, setLoginMethod] = useState('email');

  // Trạng thái phương thức Đăng ký: 'phone' hoặc 'email'
  const [regMethod, setRegMethod] = useState('phone');

  // Lưu trữ dữ liệu form đăng nhập / đăng ký
  const [formData, setFormData] = useState({
    ho: '', ten: '', email: '', phone: '', password: ''
  });

  // Quên mật khẩu
  const [fpIdentifier, setFpIdentifier] = useState(''); // email/sdt nhập ở bước 1
  const [fpOtp, setFpOtp] = useState(['', '', '', '', '', '']); // 6 ô OTP
  const [fpPassword, setFpPassword] = useState('');
  const [fpPasswordConfirm, setFpPasswordConfirm] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const [countdown, setCountdown] = useState(0); // Đếm ngược gửi lại OTP

  const otpRefs = useRef([]);

  // Đếm ngược 60 giây để gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const resetForgotState = () => {
    setFpIdentifier('');
    setFpOtp(['', '', '', '', '', '']);
    setFpPassword('');
    setFpPasswordConfirm('');
    setFpError('');
    setFpSuccess('');
    setCountdown(0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── ĐĂNG KÝ / ĐĂNG NHẬP ──────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'login') {
      // Đăng nhập
      fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert('Đăng nhập thành công!');
          localStorage.setItem('access_token', data.token);
          
          const role = data.data ? Number(data.data.Phanquyen) : 3;
          
          if (role === 1) {
            window.location.href = '/admin';
          } else if (role === 2) {
            window.location.href = '/staff';
          } else {
            window.location.reload();
          }
        } else {
          alert(data.message || 'Email hoặc mật khẩu không chính xác!');
        }
      })
      .catch(err => console.log('Lỗi:', err));
    } else {
      // Đăng ký
      const payload = {
        Ho: formData.ho,
        Ten: formData.ten,
        matkhau: formData.password,
        email: regMethod === 'email' ? formData.email : null,
        SDT: regMethod === 'phone' ? formData.phone : null,
      };
      fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert('Đăng ký thành công!');
          localStorage.setItem('access_token', data.token);
          window.location.reload(); // Đăng ký mới mặc định là KH nên chỉ cần reload
        } else {
          alert(data.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại!');
        }
      })
      .catch(err => console.log('Lỗi:', err));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google/redirect`;
  };

  // ── QUÊN MẬT KHẨU - BƯỚC 1: Gửi OTP ─────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!fpIdentifier.trim()) return;
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      const res = await fetch(`${API}/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ identifier: fpIdentifier.trim() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setFpSuccess(data.message);
        setCountdown(60);
        setView('forgot-step2');
      } else {
        setFpError(data.message || 'Có lỗi xảy ra!');
      }
    } catch {
      setFpError('Không thể kết nối đến server!');
    } finally {
      setFpLoading(false);
    }
  };

  // ── QUÊN MẬT KHẨU - BƯỚC 2: Xác thực OTP ────────────────
  const handleOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Chỉ nhận số
    const newOtp = [...fpOtp];
    newOtp[index] = value.slice(-1); // Chỉ lấy 1 ký tự
    setFpOtp(newOtp);
    // Tự động nhảy sang ô tiếp theo
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !fpOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = fpOtp.join('');
    if (otpString.length < 6) {
      setFpError('Vui lòng nhập đủ 6 chữ số!');
      return;
    }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch(`${API}/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ identifier: fpIdentifier, otp: otpString })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setFpSuccess('');
        setView('forgot-step3');
      } else {
        setFpError(data.message || 'Mã OTP không đúng!');
      }
    } catch {
      setFpError('Không thể kết nối đến server!');
    } finally {
      setFpLoading(false);
    }
  };

  // ── QUÊN MẬT KHẨU - BƯỚC 3: Đặt mật khẩu mới ───────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (fpPassword !== fpPasswordConfirm) {
      setFpError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (fpPassword.length < 6) {
      setFpError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch(`${API}/forgot-password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          identifier:            fpIdentifier,
          otp:                   fpOtp.join(''),
          password:              fpPassword,
          password_confirmation: fpPasswordConfirm,
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setFpSuccess(data.message);
        setTimeout(() => {
          resetForgotState();
          setView('login');
        }, 2500);
      } else {
        setFpError(data.message || 'Có lỗi xảy ra!');
      }
    } catch {
      setFpError('Không thể kết nối đến server!');
    } finally {
      setFpLoading(false);
    }
  };

  // ── HELPER: Step indicator cho quên mật khẩu ─────────────
  const StepIndicator = ({ current }) => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(step => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step < current ? 'bg-green-500 text-white' :
            step === current ? 'bg-[#e30019] text-white' :
            'bg-gray-200 text-gray-400'
          }`}>
            {step < current ? '✓' : step}
          </div>
          {step < 3 && (
            <div className={`h-0.5 w-8 transition-all ${step < current ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[480px] bg-white rounded-xl shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">

        {/* Nút X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all text-lg font-bold"
        >✕</button>

        {/* ════════════════════════════════════════
            VIEW: ĐĂNG NHẬP / ĐĂNG KÝ
        ════════════════════════════════════════ */}
        {(view === 'login' || view === 'register') && (
          <>
            <h2 className="text-xl font-bold text-gray-800 uppercase mb-4">
              {view === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản TOIYÊUPC'}
            </h2>

            {view === 'register' && (
              <div className="text-right mb-2">
                <button
                  type="button"
                  onClick={() => setRegMethod(regMethod === 'phone' ? 'email' : 'phone')}
                  className="text-sm text-gray-600 hover:text-blue-600 underline"
                >
                  {regMethod === 'phone' ? 'Đăng ký bằng email' : 'Đăng ký bằng số điện thoại'}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Inputs Đăng ký */}
              {view === 'register' && (
                <>
                  {regMethod === 'phone' ? (
                    <input type="tel" name="phone" placeholder="Số điện thoại" required
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500"
                      onChange={handleInputChange} />
                  ) : (
                    <input type="email" name="email" placeholder="Email" required
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500"
                      onChange={handleInputChange} />
                  )}
                  <input type="text" name="ho" placeholder="Họ" required
                    className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500"
                    onChange={handleInputChange} />
                  <input type="text" name="ten" placeholder="Tên" required
                    className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500"
                    onChange={handleInputChange} />
                </>
              )}

              {/* Input Đăng nhập - toggle Email / SĐT giống GearVN */}
              {view === 'login' && (
                <div>
                  {/* Nút toggle giống GearVN */}
                  <div className="text-right mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod(loginMethod === 'email' ? 'phone' : 'email');
                        setFormData(prev => ({ ...prev, email: '' }));
                      }}
                      className="text-sm text-gray-500 hover:text-[#e30019] underline transition-colors"
                    >
                      {loginMethod === 'email' ? 'Đăng nhập bằng số điện thoại' : 'Đăng nhập bằng email'}
                    </button>
                  </div>
                  {loginMethod === 'email' ? (
                    <input
                      type="email"
                      name="email"
                      placeholder="Địa chỉ Email"
                      required
                      value={formData.email}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                      onChange={handleInputChange}
                    />
                  ) : (
                    <input
                      type="tel"
                      name="email"
                      placeholder="Số điện thoại"
                      required
                      value={formData.email}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              )}

              <div>
                <input type="password" name="password" placeholder="Mật khẩu" required
                  className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-red-500"
                  onChange={handleInputChange} />
                {/* Link Quên mật khẩu - chỉ hiện khi đăng nhập */}
                {view === 'login' && (
                  <div className="text-right mt-1.5">
                    <button type="button"
                      onClick={() => { resetForgotState(); setView('forgot-step1'); }}
                      className="text-sm text-[#e30019] hover:underline font-medium"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}
              </div>

              <button type="submit"
                className="w-full bg-[#e30019] hover:bg-red-700 text-white font-bold py-3 rounded mt-1 transition-colors">
                {view === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-gray-200" />
              <span className="text-sm text-gray-500">hoặc {view === 'login' ? 'đăng nhập' : 'đăng ký'} bằng</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 bg-[#df4a32] hover:bg-red-700 text-white py-2.5 rounded font-medium transition-colors">
                <span className="font-bold text-lg">G+</span> Google
              </button>
              <button type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-[#3b5998] hover:bg-blue-800 text-white py-2.5 rounded font-medium transition-colors">
                <span className="font-bold text-lg">f</span> Facebook
              </button>
            </div>

            <div className="text-center mt-6 text-sm text-gray-600">
              {view === 'login' ? 'Bạn chưa có tài khoản? ' : 'Bạn đã có tài khoản? '}
              <button type="button"
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:underline font-medium">
                {view === 'login' ? 'Đăng ký ngay!' : 'Đăng nhập!'}
              </button>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
            VIEW: QUÊN MẬT KHẨU - BƯỚC 1
            Nhập email / SĐT
        ════════════════════════════════════════ */}
        {view === 'forgot-step1' && (
          <>
            <button type="button" onClick={() => setView('login')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
              ← Quay lại đăng nhập
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-1">Quên mật khẩu? 🔑</h2>
            <p className="text-sm text-gray-500 mb-5">
              Nhập email hoặc số điện thoại đã đăng ký. Chúng tôi sẽ gửi mã OTP xác nhận về cho bạn.
            </p>

            <StepIndicator current={1} />

            {fpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                ⚠️ {fpError}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <input
                type="text"
                value={fpIdentifier}
                onChange={e => setFpIdentifier(e.target.value)}
                placeholder="Email hoặc Số điện thoại"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
              />
              <button type="submit" disabled={fpLoading}
                className="w-full bg-[#e30019] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                {fpLoading ? (
                  <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang gửi...</>
                ) : '📨 Gửi mã OTP'}
              </button>
            </form>
          </>
        )}

        {/* ════════════════════════════════════════
            VIEW: QUÊN MẬT KHẨU - BƯỚC 2
            Nhập OTP 6 ô
        ════════════════════════════════════════ */}
        {view === 'forgot-step2' && (
          <>
            <button type="button" onClick={() => { setView('forgot-step1'); setFpError(''); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
              ← Quay lại
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-1">Nhập mã OTP 🔐</h2>
            <p className="text-sm text-gray-500 mb-1">
              Mã OTP 6 chữ số đã được gửi đến:
            </p>
            <p className="text-sm font-semibold text-[#e30019] mb-5">{fpIdentifier}</p>

            <StepIndicator current={2} />

            {fpSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
                ✅ {fpSuccess}
              </div>
            )}
            {fpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                ⚠️ {fpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              {/* 6 ô OTP */}
              <div className="flex gap-2 justify-center">
                {fpOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                      digit
                        ? 'border-[#e30019] bg-red-50 text-[#e30019]'
                        : 'border-gray-300 focus:border-red-400'
                    }`}
                  />
                ))}
              </div>

              <button type="submit" disabled={fpLoading || fpOtp.join('').length < 6}
                className="w-full bg-[#e30019] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                {fpLoading ? (
                  <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xác thực...</>
                ) : '✅ Xác nhận OTP'}
              </button>
            </form>

            {/* Gửi lại OTP */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Không nhận được mã?{' '}
              {countdown > 0 ? (
                <span className="text-gray-400">Gửi lại sau {countdown}s</span>
              ) : (
                <button type="button"
                  onClick={handleSendOtp}
                  disabled={fpLoading}
                  className="text-[#e30019] hover:underline font-medium disabled:opacity-50">
                  Gửi lại OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
            VIEW: QUÊN MẬT KHẨU - BƯỚC 3
            Đặt mật khẩu mới
        ════════════════════════════════════════ */}
        {view === 'forgot-step3' && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Đặt mật khẩu mới 🔒</h2>
            <p className="text-sm text-gray-500 mb-5">
              Tạo mật khẩu mới cho tài khoản của bạn.
            </p>

            <StepIndicator current={3} />

            {fpSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-bold text-lg text-green-800 mb-1">Thành công!</p>
                <p className="text-sm">{fpSuccess}</p>
                <p className="text-xs text-gray-500 mt-2">Đang chuyển về trang đăng nhập...</p>
              </div>
            ) : (
              <>
                {fpError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                    ⚠️ {fpError}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="password"
                      value={fpPassword}
                      onChange={e => setFpPassword(e.target.value)}
                      placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={fpPasswordConfirm}
                      onChange={e => setFpPasswordConfirm(e.target.value)}
                      placeholder="Xác nhận mật khẩu mới"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                    />
                    {/* Hiển thị check khớp mật khẩu */}
                    {fpPasswordConfirm && (
                      <p className={`text-xs mt-1.5 ${fpPassword === fpPasswordConfirm ? 'text-green-600' : 'text-red-500'}`}>
                        {fpPassword === fpPasswordConfirm ? '✓ Mật khẩu khớp' : '✗ Mật khẩu chưa khớp'}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={fpLoading}
                    className="w-full bg-[#e30019] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    {fpLoading ? (
                      <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
                    ) : '🔐 Đặt lại mật khẩu'}
                  </button>
                </form>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default AuthModal;