import React, { useState, useEffect } from 'react';

import iconUser      from '../../../assets/icons/icons8-user-24.png';
import iconOrder     from '../../../assets/icons/icons8-purchase-order-50.png';
import iconFavorite  from '../../../assets/icons/icons8-favorite-50.png';
import iconAddress   from '../../../assets/icons/icons8-address-book-50.png';
import iconNotif     from '../../../assets/icons/icons8-notification.png';
import iconSearch    from '../../../assets/icons/icons8-tumble-dry-low-heat-50.png';

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <svg viewBox="0 0 80 80" className="w-16 h-16 text-gray-300" fill="none">
        <circle cx="34" cy="34" r="22" stroke="currentColor" strokeWidth="5"/>
        <line x1="50" y1="50" x2="68" y2="68" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
      </svg>
    </div>
    <p className="text-base font-medium text-gray-400">{message}</p>
  </div>
);

const API = 'http://127.0.0.1:8000/api';

const TABS = [
  { id: 'info',     label: 'Thông tin tài khoản', icon: iconUser    },
  { id: 'orders',   label: 'Quản lý đơn hàng',    icon: iconOrder   },
  { id: 'wishlist', label: 'Sản phẩm yêu thích',  icon: iconFavorite},
  { id: 'address',  label: 'Sổ địa chỉ',           icon: iconAddress },
  { id: 'notif',    label: 'Thông báo',             icon: iconNotif  },
];

const ORDER_TABS = [
  { id: 'pending',   label: 'Chờ thanh toán' },
  { id: 'shipping',  label: 'Chờ giao hàng'  },
  { id: 'done',      label: 'Đã hoàn thành'  },
  { id: 'cancelled', label: 'Đã huỷ'         },
];

const CustomerProfile = () => {
  const [activeTab,  setActiveTab]  = useState('info');
  const [orderTab,   setOrderTab]   = useState('pending');
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [imgError,   setImgError]   = useState(false);
  const [showAddAddr,setShowAddAddr]= useState(false);

  const [userInfo, setUserInfo] = useState({
    fullName: '', email: '', phone: '', dob: '', gender: 'nam'
  });

  const [newAddr, setNewAddr] = useState({
    name:'', phone:'', province:'', district:'', ward:'', detail:'', isDefault: false
  });

  // Fetch user từ token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = '/'; return; }
    fetch(`${API}/me`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
        const u = data.user;
        setUser(u);
        setUserInfo({ fullName: u.Ten||'', email: u.email||'', phone: u.SDT||'', dob:'', gender:'nam' });
      }
    })
    .finally(() => setLoading(false));
  }, []);

  const getInitial = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const Avatar = ({ size = 'sm' }) => {
    const cls = size === 'lg'
      ? 'w-20 h-20 text-3xl ring-4 ring-white shadow-md'
      : 'w-11 h-11 text-lg ring-2 ring-white shadow';
    if (user?.avatar && !imgError) {
      return <img src={user.avatar} alt={user.ten}
        onError={() => setImgError(true)}
        className={`${cls} rounded-full object-cover`} />;
    }
    return (
      <div className={`${cls} rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-extrabold`}>
        {getInitial(user?.Ten)}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const renderContent = () => {

    if (activeTab === 'info') return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông tin tài khoản</h2>

        {}
        <div className="flex items-center gap-5 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <Avatar size="lg" />
          <div>
            <p className="text-lg font-bold text-gray-800">{userInfo.fullName}</p>
            <p className="text-sm text-gray-500">{userInfo.email}</p>
            {user?.MaNCC === 'google' ? (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                <span className="font-bold text-red-500">G</span> Tài khoản Google
              </span>
            ) : (
              <button className="mt-1.5 text-xs text-blue-600 hover:underline flex items-center gap-1">
                📷 Thay đổi ảnh đại diện
              </button>
            )}
          </div>
        </div>

        {}
        <form className="max-w-lg flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <input type="text" name="fullName" value={userInfo.fullName}
              onChange={e => setUserInfo({...userInfo, fullName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={userInfo.email} disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed text-sm"/>
            <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input type="tel" name="phone" value={userInfo.phone}
              placeholder="Nhập số điện thoại"
              onChange={e => setUserInfo({...userInfo, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input type="date" name="dob" value={userInfo.dob}
              onChange={e => setUserInfo({...userInfo, dob: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm w-auto"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <div className="flex gap-6">
              {[{v:'nam',l:'Nam'},{v:'nu',l:'Nữ'},{v:'khac',l:'Khác'}].map(g => (
                <label key={g.v} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="gender" value={g.v}
                    checked={userInfo.gender===g.v}
                    onChange={e => setUserInfo({...userInfo, gender: e.target.value})}
                    className="w-4 h-4 text-blue-600 accent-blue-600"/>
                  <span className="text-gray-700">{g.l}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="button"
            className="w-max mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow transition-colors text-sm">
            Cập nhật
          </button>
        </form>
      </div>
    );

    if (activeTab === 'orders') return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Quản lý đơn hàng</h2>

        {}
        <div className="flex border-b border-gray-200 mb-6">
          {ORDER_TABS.map(t => (
            <button key={t.id}
              onClick={() => setOrderTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                orderTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <EmptyState message="Bạn không có đơn hàng nào" />
      </div>
    );

    if (activeTab === 'wishlist') return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Sản phẩm yêu thích</h2>
        <EmptyState message="Bạn chưa có sản phẩm yêu thích nào." />
      </div>
    );

    if (activeTab === 'address') return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Sổ địa chỉ</h2>

        {!showAddAddr ? (
          <>
            {}
            <button
              onClick={() => setShowAddAddr(true)}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl py-4 text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-all mb-4">
              <span className="text-xl">+</span> Thêm địa chỉ mới
            </button>

            {}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">Địa chỉ mặc định</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Mặc định</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Bạn chưa có địa chỉ nhận hàng mặc định.<br/>
                    Vui lòng chọn <span className="text-blue-600 font-medium cursor-pointer" onClick={() => setShowAddAddr(true)}>Thêm địa chỉ nhận hàng</span>.
                  </p>
                </div>
                <img src={iconAddress} alt="address" className="w-10 h-10 opacity-40"/>
              </div>
            </div>
          </>
        ) : (

          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Địa chỉ mới</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:'Họ và tên',    name:'name',     type:'text',  col:1},
                {label:'Số điện thoại',name:'phone',    type:'tel',   col:1},
                {label:'Tỉnh / Thành', name:'province', type:'text',  col:1},
                {label:'Quận / Huyện', name:'district', type:'text',  col:1},
                {label:'Phường / Xã',  name:'ward',     type:'text',  col:1},
              ].map(f => (
                <div key={f.name} className={f.col===2 ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={newAddr[f.name]}
                    onChange={e => setNewAddr({...newAddr,[f.name]:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 text-sm"/>
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể (số nhà, đường...)</label>
                <input type="text" value={newAddr.detail}
                  onChange={e => setNewAddr({...newAddr, detail:e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 text-sm"/>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                  <input type="checkbox" checked={newAddr.isDefault}
                    onChange={e => setNewAddr({...newAddr, isDefault:e.target.checked})}
                    className="w-4 h-4 accent-blue-600"/>
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors">
                Lưu địa chỉ
              </button>
              <button type="button" onClick={() => setShowAddAddr(false)}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2 rounded-lg text-sm transition-colors">
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    );

    // ── THÔNG BÁO ─────────────────────────────────────────────
    if (activeTab === 'notif') return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Cập nhật đơn hàng</h2>
          <button className="text-xs text-blue-600 hover:underline">Đánh dấu tất cả là đã đọc</button>
        </div>

        {}
        <div className="flex border-b border-gray-200 mb-6">
          {['Ưu đãi & Cập nhật','Đơn hàng'].map(t => (
            <button key={t}
              className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors">
              {t}
            </button>
          ))}
        </div>

        <EmptyState message="Bạn chưa có thông báo mới" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1100px] mx-auto px-4 flex gap-5">

        {}
        <aside className="w-[240px] flex-shrink-0">

          {}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
            <div className="flex items-center gap-3">
              <Avatar size="sm" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Tài khoản của</p>
                <p className="font-bold text-gray-800 text-sm truncate">{userInfo.fullName || 'Người dùng'}</p>
              </div>
            </div>
          </div>

          {}
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all
                  ${i < TABS.length-1 ? 'border-b border-gray-50' : ''}
                  ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}>
                <img src={tab.icon} alt={tab.label}
                  className={`w-5 h-5 object-contain flex-shrink-0 ${activeTab === tab.id ? 'opacity-100' : 'opacity-50'}`}/>
                <span className="text-left leading-tight">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-7 min-h-[500px]">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

export default CustomerProfile;