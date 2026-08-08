import React, { useState, useEffect } from 'react';
import StaffMasterLayout from '../theme/masterLayout';
import TransferModal from './TransferModal';
import TransferDetailModal from './TransferDetailModal';

const StaffTransferTickets = () => {
  const [transfers, setTransfers] = useState([]);
  const [myBranch, setMyBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("staff_access_token");
      const res = await fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/staff/transfers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setTransfers(result.data.data || []);
        setMyBranch(result.branch);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ duyệt': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ duyệt</span>;
      case 'Đang vận chuyển': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Đang vận chuyển</span>;
      case 'Hoàn thành': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Hoàn thành</span>;
      case 'Từ chối':
      case 'Đã hủy': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{status}</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <StaffMasterLayout title="Luân Chuyển Hàng – Staff">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Phiếu Luân Chuyển (Chi Nhánh)</h1>
          <p className="text-sm text-slate-500 mt-1">
            {myBranch ? `Chi nhánh của bạn: ${myBranch.ten_chinhanh}` : 'Đang tải thông tin chi nhánh...'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          Tạo Phiếu / Xin Hàng
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Mã Phiếu</th>
                <th className="px-4 py-3">Phân loại</th>
                <th className="px-4 py-3">Kho Xuất (Gửi)</th>
                <th className="px-4 py-3">Kho Nhập (Nhận)</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Chưa có phiếu luân chuyển nào liên quan đến chi nhánh của bạn.</td></tr>
              ) : (
                transfers.map((ticket) => {
                  const isImporting = ticket.ma_kho_nhap === myBranch?.id_chinhanh;
                  return (
                    <tr key={ticket.id_phieu} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">#{ticket.id_phieu}</td>
                      <td className="px-4 py-3">
                        {isImporting 
                          ? <span className="text-green-600 font-bold border border-green-200 bg-green-50 px-2 py-1 rounded text-[10px]">NHẬP HÀNG VỀ</span>
                          : <span className="text-orange-600 font-bold border border-orange-200 bg-orange-50 px-2 py-1 rounded text-[10px]">XUẤT HÀNG ĐI</span>
                        }
                      </td>
                      <td className="px-4 py-3">{ticket.kho_xuat?.ten_chinhanh || "—"}</td>
                      <td className="px-4 py-3">{ticket.kho_nhap?.ten_chinhanh || "—"}</td>
                      <td className="px-4 py-3">{getStatusBadge(ticket.trang_thai)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedTicket(ticket.id_phieu)}
                          className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && myBranch && (
        <TransferModal 
          myBranch={myBranch}
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
          myBranchId={myBranch?.id_chinhanh}
          onClose={() => setSelectedTicket(null)} 
          onUpdated={() => {
            setSelectedTicket(null);
            fetchTransfers();
          }}
        />
      )}
    </StaffMasterLayout>
  );
};

export default StaffTransferTickets;
