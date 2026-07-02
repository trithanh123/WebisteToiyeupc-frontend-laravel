import React, { useState } from 'react';
import ProfileLayout from './ProfileLayout';

const NOTIF_TABS = [
  { id: 'updates', label: 'Ưu đãi & Cập nhật' },
  { id: 'orders',  label: 'Đơn hàng'           },
];

// Demo notifications (để trống cho thực tế)
const mockNotifs = [];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('updates');
  const filtered = mockNotifs.filter(n => n.type === activeTab);

  return (
    <ProfileLayout>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Thông báo của bạn</h2>
        {mockNotifs.length > 0 && (
          <button className="text-xs text-blue-600 hover:underline font-medium">
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {/* Tabs */}
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

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg viewBox="0 0 100 100" className="w-24 h-24 mb-4" fill="none">
            <circle cx="42" cy="42" r="28" stroke="#d1d5db" strokeWidth="5"/>
            <line x1="62" y1="62" x2="82" y2="82" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="42" cy="42" r="10" stroke="#e5e7eb" strokeWidth="3"/>
          </svg>
          <p className="text-base font-medium text-gray-400">
            Bạn chưa có {activeTab === 'orders' ? 'thông báo đơn hàng' : 'thông báo ưu đãi'} nào
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(n => (
            <div key={n.id}
              className={`p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors
                ${!n.read ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div>
                  <p className="font-medium text-sm text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
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
