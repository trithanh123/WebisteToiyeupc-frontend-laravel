import React, { useState, useEffect } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import TransferModal from './TransferModal';
import TransferDetailModal from './TransferDetailModal';

const TransferTickets = () => {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTuNgay, setFilterTuNgay] = useState('');

  const fetchTransfers = async (status = filterStatus, tuNgay = filterTuNgay) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_access_token");

      const params = new URLSearchParams();
      if (status) params.append('trang_thai', status);
      if (tuNgay) params.append('tu_ngay', tuNgay);

      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setTransfers(result.data.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách điều chuyển:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phiếu #${id} không?`)) return;
    try {
      const token = localStorage.getItem("admin_access_token");
      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        fetchTransfers();
      } else {
        alert(result.message || 'Lỗi khi xóa phiếu');
      }
    } catch (err) {
      alert('Không thể kết nối đến server.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ duyệt': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>;
      case 'Đang vận chuyển': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Đang vận chuyển</span>;
      case 'Hoàn thành': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Hoàn thành</span>;
      case 'Từ chối': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{status}</span>;
      case 'Đã hủy': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{status}</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <AdminMasterLayout title="Phiếu Điều Chuyển – Admin">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Quản lý Phiếu Điều Chuyển</h1>

          <div className="flex gap-3 mt-4 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đang vận chuyển">Đang vận chuyển</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Từ chối">Từ chối</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>

            <input
              type="date"
              value={filterTuNgay}
              onChange={(e) => setFilterTuNgay(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm"
            />

            <button
              onClick={() => fetchTransfers()}
              className="px-4 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded hover:bg-slate-700"
            >
              Lọc
            </button>

            {(filterStatus || filterTuNgay) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterTuNgay('');
                  fetchTransfers('', '');
                }}
                className="text-sm text-blue-600 hover:underline font-semibold ml-2"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          Tạo Phiếu Điều Chuyển
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Mã Phiếu</th>
                <th className="px-4 py-3">Kho Xuất</th>
                <th className="px-4 py-3">Kho Nhập</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Chưa có phiếu điều chuyển nào.</td></tr>
              ) : (
                transfers.map((ticket) => (
                  <tr key={ticket.id_phieu} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">#{ticket.id_phieu}</td>
                    <td className="px-4 py-3">{ticket.kho_xuat?.ten_chinhanh || "—"}</td>
                    <td className="px-4 py-3">{ticket.kho_nhap?.ten_chinhanh || "—"}</td>
                    <td className="px-4 py-3">{getStatusBadge(ticket.trang_thai)}</td>
                    <td className="px-4 py-3">{new Date(ticket.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket.id_phieu)}
                          className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded"
                        >
                          Chi tiết
                        </button>
                        {ticket.trang_thai === 'Chờ duyệt' && (
                          <button
                            onClick={() => handleDelete(ticket.id_phieu)}
                            className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1.5 rounded"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <TransferModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTransfers();
          }}
        />
      )}

      {selectedTicket && (
        <TransferDetailModal
          id={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => {
            setSelectedTicket(null);
            fetchTransfers();
          }}
        />
      )}
    </AdminMasterLayout>
  );
};

export default TransferTickets;
