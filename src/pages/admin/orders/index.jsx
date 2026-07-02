import React, { useState, useEffect } from 'react';
import AdminMasterLayout from '../theme/masterLayout';

const OrderSupervise = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const fetchOrders = async (emergency = false) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const endpoint = emergency 
        ? 'http://127.0.0.1:8000/api/admin/orders/emergency'
        : 'http://127.0.0.1:8000/api/admin/orders/monitor';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setOrders(result.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu đơn hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(isEmergencyMode);
  }, [isEmergencyMode]);

  const toggleEmergency = () => {
    setIsEmergencyMode(!isEmergencyMode);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trang_thai_dh: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchOrders(isEmergencyMode);
      } else {
        alert(data.message || 'Lỗi cập nhật trạng thái');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      handleUpdateStatus(orderId, 'Đã hủy');
    }
  };

  const handlePrint = (orderId) => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");

    fetch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/print`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    })
    .catch(err => console.error("Lỗi in hóa đơn:", err));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return 'text-slate-500';
    if (status.includes('Đã thanh toán') || status.includes('Thành công')) return 'text-green-600 font-medium';
    if (status.includes('Thất bại')) return 'text-red-600 font-medium';
    return 'text-amber-600 font-medium';
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'Chờ duyệt': return 'bg-amber-100 text-amber-700';
      case 'Đang chuẩn bị': return 'bg-blue-100 text-blue-700';
      case 'Đang giao': return 'bg-indigo-100 text-indigo-700';
      case 'Thành công': return 'bg-green-100 text-green-700';
      case 'Đã hủy': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AdminMasterLayout title="Giám Sát Đơn Hàng – Admin">
      {}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            {isEmergencyMode ? '⚠️ Cảnh Báo: Đơn Hàng Bị Treo' : 'Giám Sát Đơn Hàng'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEmergencyMode ? 'Danh sách các đơn hàng chờ duyệt quá 2 tiếng cần xử lý gấp.' : 'Theo dõi trạng thái và tình hình thanh toán của tất cả đơn hàng.'}
          </p>
        </div>

        <button
          onClick={toggleEmergency}
          className={`py-2 px-5 rounded-lg font-bold flex items-center gap-2 transition-all ${
            isEmergencyMode 
              ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-lg' 
              : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
          }`}
        >
          {isEmergencyMode ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Trở về Bình Thường
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Lọc Đơn Khẩn Cấp
            </>
          )}
        </button>
      </div>

      {}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-16 flex justify-center items-center">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <div className="text-5xl mb-3 opacity-50 drop-shadow-sm">📋</div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">Không tìm thấy đơn hàng nào</h3>
            <p className="text-sm">Hiện tại không có dữ liệu để hiển thị.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 font-medium">
                  <th className="px-5 py-4 whitespace-nowrap">Mã ĐH</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4 whitespace-nowrap">Tổng tiền</th>
                  <th className="px-5 py-4">Thanh toán</th>
                  <th className="px-5 py-4 whitespace-nowrap">Trạng thái ĐH</th>
                  <th className="px-5 py-4 whitespace-nowrap">Thời gian</th>
                  <th className="px-5 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id_donhang} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700">#{order.id_donhang}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800 text-sm">{order.tenkhachhang || 'Khách Vãng Lai'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{order.sdt || 'Chưa có SĐT'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{formatCurrency(order.tongtien)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-800">{order.phuong_thuc_tt}</p>
                      <p className={`text-xs mt-0.5 ${getPaymentStatusColor(order.trangthaithanhtoan)}`}>
                        {order.trangthaithanhtoan || 'Chưa cập nhật'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getOrderStatusColor(order.trang_thai_dh)}`}>
                        {order.trang_thai_dh}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600 whitespace-nowrap">{formatDate(order.thoigiandathang)}</p>
                      {order.ten_chinhanh && (
                        <p className="text-xs text-slate-400 mt-0.5">Tại: {order.ten_chinhanh}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col gap-2 items-end">
                        {(order.trang_thai_dh === 'Chờ duyệt' || order.trang_thai_dh === 'Chờ xác nhận' || order.trang_thai_dh === 'Đang chuẩn bị') && (
                          <div className="flex gap-2">
                            <button onClick={() => handleCancelOrder(order.id_donhang)} className="px-4 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors border border-red-100 whitespace-nowrap">
                              Hủy đơn
                            </button>
                            <button onClick={() => handleUpdateStatus(order.id_donhang, 'Đang giao')} className="px-4 py-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white text-sm font-medium transition-colors border border-amber-100 whitespace-nowrap">
                              {order.trang_thai_dh === 'Đang chuẩn bị' ? 'Giao hàng' : 'Xác nhận ĐH'}
                            </button>
                          </div>
                        )}
                        {(order.trang_thai_dh === 'Đang giao' || order.trang_thai_dh === 'Đang giao hàng') && (
                          <button onClick={() => handleUpdateStatus(order.id_donhang, 'Thành công')} className="px-4 py-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-sm font-medium transition-colors border border-indigo-100 whitespace-nowrap">
                            Đã giao xong
                          </button>
                        )}
                        <button 
                          onClick={() => handlePrint(order.id_donhang)}
                          className="px-4 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-sm font-medium transition-colors border border-blue-100 inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          In Hóa Đơn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminMasterLayout>
  );
};

export default OrderSupervise;
