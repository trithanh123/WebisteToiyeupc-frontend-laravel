import React, { useState, useEffect } from 'react';
import ProfileLayout from './ProfileLayout';

const API = 'http://127.0.0.1:8000/api';

const AccountInfo = () => {
  const [user,    setUser]    = useState(null);
  const [imgErr,  setImgErr]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', gender: 'nam',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          const u = d.user;
          setUser(u);
          setForm({ fullName: u.ten || '', email: u.email || '', phone: u.sdt || '', dob: u.ngaysinh || '', gender: u.gioitinh || 'nam' });
        }
      });
  }, []);

  const initial = (n) => {
    if (!n) return '?';
    const p = n.trim().split(' ');
    return p[p.length - 1][0].toUpperCase();
  };

  const handleSave = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`${API}/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ten: form.fullName,
        sdt: form.phone,
        ngaysinh: form.dob,
        gioitinh: form.gender
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setUser(d.user);
          setForm({ ...form, fullName: d.user.ten || '', phone: d.user.sdt || '', dob: d.user.ngaysinh || '', gender: d.user.gioitinh || 'nam' });
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        } else {
          alert(d.message || 'Có lỗi xảy ra!');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Lỗi kết nối máy chủ!');
      });
  };

  return (
    <ProfileLayout>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông tin tài khoản</h2>

      {}
      <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-xl border border-gray-100 mb-8">
        {user?.avatar && !imgErr ? (
          <img src={user.avatar} alt="" onError={() => setImgErr(true)}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-extrabold text-3xl ring-4 ring-white shadow-md">
            {initial(user?.ten)}
          </div>
        )}
        <div>
          <p className="text-lg font-bold text-gray-800">{form.fullName}</p>
          <p className="text-sm text-gray-500">{form.email}</p>
          {user?.MaNCC === 'google' ? (
            <span className="inline-flex items-center gap-1 mt-2 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
              <b className="text-red-500">G</b> Tài khoản Google
            </span>
          ) : (
            <button className="mt-2 text-xs text-blue-600 hover:underline">📷 Thay đổi ảnh đại diện</button>
          )}
        </div>
      </div>

      {}
      <form className="max-w-md flex flex-col gap-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input type="text" value={form.fullName}
            onChange={e => setForm({...form, fullName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} disabled
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input type="tel" value={form.phone} placeholder="Nhập số điện thoại"
            onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
          <input type="date" value={form.dob}
            onChange={e => setForm({...form, dob: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all" />
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
          <div className="flex gap-6">
            {[{v:'nam',l:'Nam'},{v:'nu',l:'Nữ'},{v:'khac',l:'Khác'}].map(g => (
              <label key={g.v} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" name="gender" value={g.v}
                  checked={form.gender === g.v}
                  onChange={e => setForm({...form, gender: e.target.value})}
                  className="accent-blue-600 w-4 h-4" />
                <span className="text-gray-700">{g.l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition-colors shadow">
            Cập nhật
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              ✓ Đã lưu thành công!
            </span>
          )}
        </div>
      </form>
    </ProfileLayout>
  );
};

export default AccountInfo;
