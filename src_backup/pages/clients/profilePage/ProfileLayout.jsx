import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTERS } from '../../../utils/route';

import iconUser     from '../../../assets/icons/icons8-user-24.png';
import iconOrder    from '../../../assets/icons/icons8-purchase-order-50.png';
import iconFavorite from '../../../assets/icons/icons8-favorite-50.png';
import iconAddress  from '../../../assets/icons/icons8-address-book-50.png';
import iconNotif    from '../../../assets/icons/icons8-notification.png';

const API = 'http://127.0.0.1:8000/api';

const NAV = [
  { path: ROUTERS.CLIENT.PROFILE,        icon: iconUser,     label: 'Thông tin tài khoản' },
  { path: ROUTERS.CLIENT.PROFILE_ORDERS, icon: iconOrder,    label: 'Quản lý đơn hàng'   },
  { path: ROUTERS.CLIENT.PROFILE_WISH,   icon: iconFavorite, label: 'Sản phẩm yêu thích' },
  { path: ROUTERS.CLIENT.PROFILE_ADDR,   icon: iconAddress,  label: 'Sổ địa chỉ'          },
  { path: ROUTERS.CLIENT.PROFILE_NOTIF,  icon: iconNotif,    label: 'Thông báo'           },
];

const ProfileLayout = ({ children }) => {
  const location = useLocation();
  const [user,    setUser]    = useState(null);
  const [imgErr,  setImgErr]  = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setUser(d.user); });
  }, []);

  const initial = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1][0].toUpperCase();
  };

  const Avatar = ({ size = 'sm' }) => {
    const base = size === 'lg'
      ? 'w-14 h-14 text-2xl'
      : 'w-10 h-10 text-base';
    if (user?.avatar && !imgErr) {
      return <img src={user.avatar} alt="" onError={() => setImgErr(true)}
        className={`${base} rounded-full object-cover ring-2 ring-white shadow`} />;
    }
    return (
      <div className={`${base} rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-extrabold ring-2 ring-white shadow`}>
        {initial(user?.Ten)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-6">
      <div className="max-w-[1100px] mx-auto px-4 flex gap-4 items-start">

        {/* ── SIDEBAR ─────────────────────────────────── */}
        <aside className="w-[220px] flex-shrink-0 sticky top-20">

          {/* User card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4 mb-2 flex items-center gap-3">
            <Avatar size="sm" />
            <div className="overflow-hidden">
              <p className="text-[11px] text-gray-400 leading-none mb-0.5">Tài khoản của</p>
              <p className="font-bold text-gray-800 text-sm truncate">{user?.Ten || '...'}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {NAV.map((item, i) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all
                    ${i < NAV.length - 1 ? 'border-b border-gray-50' : ''}
                    ${active
                      ? 'bg-blue-50 text-blue-700 border-l-[3px] border-l-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 border-l-[3px] border-l-transparent'
                    }`}
                  style={{ textDecoration: 'none' }}
                >
                  <img src={item.icon} alt="" className={`w-5 h-5 object-contain ${active ? 'opacity-100' : 'opacity-45'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────── */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-7 min-h-[520px]">
          {children}
        </main>

      </div>
    </div>
  );
};

export default ProfileLayout;
