import React, { useState } from 'react';
import ProfileLayout from './ProfileLayout';

const ORDER_STATUS = [
  { id: 'pending',   label: 'Chờ thanh toán' },
  { id: 'confirmed', label: 'Chờ lấy hàng'  },
  { id: 'shipping',  label: 'Chờ giao hàng'  },
  { id: 'done',      label: 'Đã hoàn thành'  },
  { id: 'cancelled', label: 'Đã huỷ'         },
];

const EmptyOrder = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg viewBox="0 0 100 100" className="w-24 h-24 mb-4" fill="none">
      <circle cx="42" cy="42" r="28" stroke="#d1d5db" strokeWidth="5"/>
      <line x1="62" y1="62" x2="82" y2="82" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="42" cy="42" r="10" stroke="#e5e7eb" strokeWidth="3"/>
    </svg>
    <p className="text-base font-medium text-gray-400">Bạn không có đơn hàng nào</p>
    <a href="/" className="mt-3 text-sm text-blue-600 hover:underline">Mua sắm ngay →</a>
  </div>
);

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <ProfileLayout>
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Quản lý đơn hàng</h2>

      {/* Status tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {ORDER_STATUS.map(t => (
          <button key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${activeTab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <input type="text" placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
          className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors" />
        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      <EmptyOrder />
    </ProfileLayout>
  );
};

export default OrderManagement;
