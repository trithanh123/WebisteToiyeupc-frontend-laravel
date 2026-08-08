import React, { useState, useEffect } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import ImportModal from './ImportModal';
import SerialsModal from './SerialsModal';
import EditStockModal from './EditStockModal';
import Swal from 'sweetalert2';

const WarehouseManagement = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of groups per page

  const [selectedSerialsKho, setSelectedSerialsKho] = useState(null);
  const [selectedEditKho, setSelectedEditKho] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_access_token");
      const response = await fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/warehouse', {
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
    const resultConfirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Tất cả mã Serial liên quan cũng sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy"
    });

    if (resultConfirm.isConfirmed) {
      try {
        const token = localStorage.getItem("admin_access_token");
        const response = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/warehouse/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          Swal.fire("Đã xóa!", "Xóa sản phẩm khỏi kho hàng thành công.", "success");
          fetchInventory();
        } else {
          Swal.fire("Lỗi xóa!", result.message || "Không xác định", "error");
        }
      } catch (error) {
        Swal.fire("Lỗi!", "Lỗi kết nối khi xóa.", "error");
        console.error("Lỗi:", error);
      }
    }
  };

  const getStatusBadge = (tonKho) => {
    const sl = tonKho.soluongtonkho || 0;
    const min = tonKho.soluongkhothap || 0;

    if (sl === 0) {
      return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold whitespace-nowrap">Hết hàng</span>;
    }
    if (sl <= min) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1">⚠️ Cần nhập thêm</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">✓ An toàn</span>;
  };

  const filteredInventory = inventoryList.filter(item => {
    // filter by status
    if (statusFilter !== 'all') {
      const sl = item.soluongtonkho || 0;
      const min = item.soluongkhothap || 0;
      if (statusFilter === 'out' && sl > 0) return false;
      if (statusFilter === 'warning' && (sl === 0 || sl > min)) return false;
      if (statusFilter === 'safe' && sl <= min) return false;
    }
    
    // filter by search
    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      const name = (item.san_pham?.tensp || '').toLowerCase();
      const code = (item.san_pham?.masp || '').toLowerCase();
      if (!name.includes(term) && !code.includes(term)) return false;
    }
    
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const groupedInventory = filteredInventory.reduce((acc, item) => {
    const key = item.ma_sanpham;
    if (!acc[key]) {
      acc[key] = {
        ma_sanpham: item.ma_sanpham,
        san_pham: item.san_pham,
        totalStock: 0,
        items: []
      };
    }
    acc[key].totalStock += (item.soluongtonkho || 0);
    acc[key].items.push(item);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedInventory);

  const toggleGroup = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPages = Math.ceil(groupedArray.length / itemsPerPage);
  const currentData = groupedArray.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <AdminMasterLayout title="Quản lý Kho tổng – Admin">
      { }
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            Danh Sách Kho Cửa Hàng
          </h1>
        </div>


        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm tên, mã sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700 bg-white shadow-sm w-48 sm:w-64"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">Lọc:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 bg-white shadow-sm cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="safe"> An toàn</option>
              <option value="warning">Cần nhập thêm</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>
        </div>
      </div>

      { }
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

      { }
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-16 flex justify-center items-center">
            <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredInventory.length === 0 ? (
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
                {currentData.map((group) => (
                  <React.Fragment key={group.ma_sanpham}>
                    {/* Header Row */}
                    <tr 
                      className="hover:bg-slate-100 transition-colors group cursor-pointer bg-slate-50/50"
                      onClick={() => toggleGroup(group.ma_sanpham)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedGroups[group.ma_sanpham] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div>
                            <p className="font-bold text-slate-800 text-sm line-clamp-1 max-w-[200px] lg:max-w-xs">
                              {group.san_pham?.tensp || 'Sản phẩm lỗi'}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              Mã: {group.san_pham?.masp || `#${group.ma_sanpham}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                          {group.items.length} chi nhánh
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-blue-600">{group.totalStock}</span>
                          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase whitespace-nowrap">Tổng tồn kho</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {group.totalStock === 0 ? (
                           <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold whitespace-nowrap">Hết hàng</span>
                        ) : group.items.some(i => (i.soluongtonkho || 0) <= (i.soluongkhothap || 0)) ? (
                           <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 w-fit">⚠️ Cần nhập</span>
                        ) : (
                           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">✓ An toàn</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-slate-400 italic font-medium group-hover:text-blue-500 transition-colors cursor-pointer whitespace-nowrap">
                          {expandedGroups[group.ma_sanpham] ? 'Thu gọn' : 'Xem chi tiết'}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Detail Rows */}
                    {expandedGroups[group.ma_sanpham] && group.items.map((item) => (
                      <tr key={item.id_khoton} className="hover:bg-slate-50 transition-colors group bg-white">
                        <td className="px-6 py-4 pl-14 text-sm text-slate-400">
                          ↳ Chi tiết tại:
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 text-sm">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {item.chi_nhanh?.ten_chinhanh || `Chi nhánh ID ${item.ma_chinhanh}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xl font-black text-slate-800">{item.soluongtonkho || 0}</span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Định mức: {item.soluongkhothap || 0}</span>
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
                              onClick={() => handleDelete(item.id_khoton)}
                              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 bg-white px-4 py-4 gap-4">
                <div className="text-sm text-slate-700 m-0 whitespace-nowrap">
                  Hiển thị <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold">{Math.min(currentPage * itemsPerPage, groupedArray.length)}</span> trong số <span className="font-bold">{groupedArray.length}</span> sản phẩm
                </div>
                <div className="overflow-x-auto max-w-full pb-1">
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {getPageNumbers().map((page, i) => (
                      page === '...' ? (
                        <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-offset-0">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${currentPage === page ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-offset-0'}`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      { }
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          fetchInventory();
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
          fetchInventory();
        }}
      />
    </AdminMasterLayout>
  );
};

export default WarehouseManagement;
