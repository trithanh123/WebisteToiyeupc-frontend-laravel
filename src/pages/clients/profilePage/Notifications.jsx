import React, { useState } from 'react';
import ProfileLayout from './ProfileLayout';
import useNotifications from '../../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NOTIF_TABS = [
  { id: 'don_hang',  label: 'Đơn hàng' },
  { id: 'bao_hanh',  label: 'Bảo hành & Hỗ trợ' },
];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('don_hang');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const filtered = notifications.filter(n => n.loai_thong_bao === activeTab);

  const handleNotificationClick = (n) => {
    if (!n.da_doc) {
      markAsRead(n.id_thongbao);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <ProfileLayout>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Thông báo của bạn</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline font-medium">
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {}
      <div className="flex border-b border-gray-200 mb-6">
        {NOTIF_TABS.map(t => (
          <button key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg viewBox="0 0 100 100" className="w-24 h-24 mb-4" fill="none">
            <circle cx="42" cy="42" r="28" stroke="#d1d5db" strokeWidth="5"/>
            <line x1="62" y1="62" x2="82" y2="82" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="42" cy="42" r="10" stroke="#e5e7eb" strokeWidth="3"/>
          </svg>
          <p className="text-base font-medium text-gray-400">
            Bạn chưa có {activeTab === 'don_hang' ? 'thông báo đơn hàng' : 'thông báo bảo hành'} nào
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(n => (
            <div key={n.id_thongbao}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors
                ${!n.da_doc ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.da_doc ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div>
                  <p className={`font-medium text-sm ${!n.da_doc ? 'text-gray-900' : 'text-gray-700'}`}>{n.tieu_de}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.noi_dung}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};

export default Notifications;
