import React, { useState, useEffect } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import ImportModal from './ImportModal';
import SerialsModal from './SerialsModal';
import EditStockModal from './EditStockModal';

const WarehouseManagement = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedSerialsKho, setSelectedSerialsKho] = useState(null);
  const [selectedEditKho, setSelectedEditKho] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/warehouse', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setInventoryList(result.data || []);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu kho hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho hàng không? (Tất cả mã Serial liên quan cũng sẽ bị xóa vĩnh viễn)")) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://127.0.0.1:8000/api/admin/warehouse/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          fetchInventory(); // Reload danh sách sau khi xóa
        } else {
          alert("Lỗi xóa: " + (result.message || "Không xác định"));
        }
      } catch (error) {
        alert("Lỗi kết nối khi xóa.");
        console.error("Lỗi:", error);
      }
    }
  };

  // Helper cho Badge Trạng thái
  const getStatusBadge = (tonKho) => {
    const sl = tonKho.Soluongtonkho || 0;
    const min = tonKho.Soluongkhothap || 0;

    if (sl === 0) {
      return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold whitespace-nowrap">Hết hàng</span>;
    }
    if (sl <= min) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1">⚠️ Cần nhập thêm</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">✓ An toàn</span>;
  };

  return (
    <AdminMasterLayout title="Quản lý Kho tổng – Admin">
      {/* ── HEADER ────────────────────────────────── */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            Danh Sách Kho Cửa Hàng
          </h1>
        </div>
      </div>

      {/* ── THAO TÁC (Tạo phiếu nhập) ──────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Kiểm soát Nhập hàng</h3>
          <p className="text-sm text-slate-500 mt-0.5">Sử dụng máy quét mã vạch để đưa hàng vào chi nhánh nhanh chóng</p>
        </div>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tạo Phiếu Nhập
        </button>
      </div>

      {/* ── TỔNG QUAN / DANH SÁCH ─────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-16 flex justify-center items-center">
            <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : inventoryList.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <div className="mb-4 drop-shadow-sm">
              <img src="/src/assets/icons/icons8-box.jpg" alt="Empty Box" style={{ width: 80, height: 80, objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">Kho hàng đang trống</h3>
            <p className="text-sm text-center max-w-sm">
              Bạn chưa có lịch sử phiếu nhập nào. Hãy bấm <b>Tạo Phiếu Nhập</b> để bắt đầu đưa hàng hóa và số Serial vào kho.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Sản phẩm</th>
                  <th className="px-6 py-4 font-bold">Chi nhánh</th>
                  <th className="px-6 py-4 font-bold text-center">Số lượng tồn</th>
                  <th className="px-6 py-4 font-bold">Trạng thái</th>
                  <th className="px-6 py-4 font-bold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList.map((item) => (
                  <tr key={item.ID_Khoton} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">

                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1 max-w-[200px] lg:max-w-xs" title={item.san_pham?.TenSP}>
                            {item.san_pham?.TenSP || 'Sản phẩm lỗi'}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Mã: {item.san_pham?.MaSP || `#${item.MaSanPham}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {item.chi_nhanh?.Ten_ChiNhanh || `Chi nhánh ID ${item.MaChiNhanh}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xl font-black text-slate-800">{item.Soluongtonkho || 0}</span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Định mức: {item.Soluongkhothap || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedSerialsKho(item)}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          Xem Serial
                        </button>
                        <button 
                          onClick={() => setSelectedEditKho(item)}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(item.ID_Khoton)}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Xóa
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

      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          fetchInventory(); // Refresh after import
        }}
      />

      <SerialsModal 
        isOpen={!!selectedSerialsKho}
        onClose={() => setSelectedSerialsKho(null)}
        tonKho={selectedSerialsKho}
      />

      <EditStockModal 
        isOpen={!!selectedEditKho}
        onClose={() => setSelectedEditKho(null)}
        tonKho={selectedEditKho}
        onSuccess={() => {
          fetchInventory(); // Refresh list to get new stock numbers
        }}
      />
    </AdminMasterLayout>
  );
};

export default WarehouseManagement;
