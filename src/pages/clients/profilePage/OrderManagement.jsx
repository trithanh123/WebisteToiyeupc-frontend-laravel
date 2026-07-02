import React, { useState } from 'react';
import ProfileLayout from './ProfileLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
  const [activeTab, setActiveTab] = useState('Chờ duyệt');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const ORDER_STATUS = [
    { id: 'Chờ duyệt',   label: 'Chờ duyệt / Đang chuẩn bị' },
    { id: 'Đang giao',  label: 'Đang giao hàng'  },
    { id: 'Thành công',      label: 'Thành công'  },
    { id: 'Đã hủy', label: 'Đã huỷ'         },
  ];

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch('http://127.0.0.1:8000/api/my-orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setOrders(d.data || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnpayStatus = params.get('vnpay');

    if (vnpayStatus === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Thanh toán thành công!',
        text: 'Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị.',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        navigate('/tai-khoan/don-hang', { replace: true });
      });
    } else if (vnpayStatus === 'error') {
      Swal.fire({
        icon: 'error',
        title: 'Thanh toán thất bại',
        text: 'Giao dịch không thành công hoặc đã bị huỷ.',
        confirmButtonColor: '#d33',
      }).then(() => {
        navigate('/tai-khoan/don-hang', { replace: true });
      });
    }
  }, [location, navigate]);

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'Chờ duyệt') return o.trang_thai_dh === 'Chờ duyệt' || o.trang_thai_dh === 'Chờ xác nhận' || o.trang_thai_dh === 'Đang chuẩn bị';
    if (activeTab === 'Đang giao') return o.trang_thai_dh === 'Đang giao' || o.trang_thai_dh === 'Đang giao hàng';
    return o.trang_thai_dh === activeTab;
  });

  const handleCancelOrder = (orderId) => {
    Swal.fire({
      title: 'Xác nhận hủy đơn hàng',
      text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý hủy',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('access_token');
        fetch(`http://127.0.0.1:8000/api/my-orders/${orderId}/cancel`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        .then(r => r.json())
        .then(data => {
          if (data.status === 'success') {
            Swal.fire('Đã hủy!', 'Đơn hàng của bạn đã được hủy thành công.', 'success');

            setOrders(prev => prev.map(o => o.id_donhang === orderId ? { ...o, trang_thai_dh: 'Đã hủy' } : o));
          } else {
            Swal.fire('Lỗi', data.message || 'Không thể hủy đơn hàng lúc này.', 'error');
          }
        })
        .catch(err => {
          console.error(err);
          Swal.fire('Lỗi', 'Lỗi kết nối máy chủ.', 'error');
        });
      }
    });
  };

  return (
    <ProfileLayout>
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Quản lý đơn hàng</h2>

      {}
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

      {isLoading ? (
        <div className="py-10 text-center text-gray-400">Đang tải...</div>
      ) : filteredOrders.length === 0 ? (
        <EmptyOrder />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map(order => (
            <div key={order.id_donhang} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow bg-white relative">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <span className="font-bold text-gray-800">Đơn hàng #{order.id_donhang}</span>
                <span className="text-blue-600 text-sm font-medium">{order.trang_thai_dh}</span>
              </div>
              <div className="flex flex-col gap-3 mb-4">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-1 border border-gray-100 shrink-0">
                       <img src={item.hinhanh || '/placeholder.png'} className="max-w-full max-h-full object-contain" alt="" />
                    </div>
                    <span className="text-sm text-gray-700 line-clamp-2">{item.tensp}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Ngày đặt: {new Date(order.thoigiandathang).toLocaleDateString('vi-VN')}</span>
                  {(order.trang_thai_dh === 'Chờ duyệt' || order.trang_thai_dh === 'Chờ xác nhận') && (
                    <button onClick={() => handleCancelOrder(order.id_donhang)} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors ml-4 border border-red-100">
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">Tổng tiền:</span>
                  <span className="font-bold text-red-600 text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongtien)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};

export default OrderManagement;
