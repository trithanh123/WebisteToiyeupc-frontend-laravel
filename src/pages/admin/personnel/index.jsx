import { useState, useEffect, Component } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

import PersonnelModal from './PersonnelModal';
import ProfileModal from './ProfileModal';

import iconReload from '../../../assets/icons/icons8-reload-50.png';
import iconEdit from '../../../assets/icons/icons8-pencil-50.png';
import iconDelete from '../../../assets/icons/icons8-remove-24.png';
import iconProfile from '../../../assets/icons/icons8-employee-50.png';

const API = 'http://127.0.0.1:8000/api';

const SkeletonRow = () => (
  <tr>
    {[80, 200, 150, 150, 150, 200].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3.5 rounded-md bg-gray-200 animate-pulse" style={{ width: `${w}px` }} />
      </td>
    ))}
  </tr>
);

const PersonnelManagement = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);

  const fetchPersonnel = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const res = await axios.get(`${API}/admin/personnel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setPersonnel(res.data.data);
      }
    } catch {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPersonnel(); }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Đánh dấu nghỉ việc?',
      text: `Bạn có chắc chắn muốn cho nhân viên "${name}" nghỉ việc? Dữ liệu người này sẽ được giữ lại trên hệ thống (Soft Delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý, Nghỉ việc',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
        const res = await axios.delete(`${API}/admin/personnel/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đã cập nhật trạng thái nghỉ việc.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          fetchPersonnel();
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || 'Có lỗi xảy ra!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
    }
  };

  const filtered = personnel.filter(p => {
    const q = search.toLowerCase();
    const name = p.nguoi_dung?.ten?.toLowerCase() || '';
    const phone = p.nguoi_dung?.sdt?.toLowerCase() || '';
    const code = `nv-${p.id_nhanvien}`.toLowerCase();
    return !q || name.includes(q) || phone.includes(q) || code.includes(q);
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filtered.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = (event) => setItemOffset((event.selected * itemsPerPage) % filtered.length);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setItemOffset(0); }, [search]);

  return (
    <AdminMasterLayout title="Quản lý Nhân sự – Admin">
      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-2xl font-bold text-slate-800 m-0">Danh Sách Nhân Viên</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-100 gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-[340px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã NV, tên, số điện thoại..." className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-blue-500 transition-colors" />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button onClick={fetchPersonnel} className="py-2 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-600 text-sm flex items-center gap-1.5 transition-colors">
              <img src={iconReload} alt="Tải lại" className="w-4 h-4 object-contain" /> Tải lại
            </button>
            <button onClick={() => { setSelectedPersonnel(null); setIsFormOpen(true); }} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm">
              + Thêm Nhân Viên
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-600"><div className="text-4xl mb-3">⚠️</div><p className="font-semibold">{error}</p><button onClick={fetchPersonnel} className="mt-3 py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Thử lại</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Mã NV</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Họ & Tên</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Số điện thoại</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Chức vụ</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Chi nhánh</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />) : currentItems.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-slate-400">Không có dữ liệu nhân sự</td></tr> : currentItems.map((p, idx) => {
                  const user = p.nguoi_dung || {};
                  const branch = p.chi_nhanh || {};
                  const isFired = user.phanquyen === -1;

                  return (
                    <tr key={p.id_nhanvien} className={`border-b border-slate-100 transition-colors ${isFired ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-blue-50/30'} ${idx % 2 === 0 && !isFired ? 'bg-white' : ''}`}>
                      <td className="p-3.5 px-4">
                        <div className="font-bold text-gray-700 uppercase font-mono bg-gray-100 inline-block px-2 py-0.5 rounded border border-gray-200">
                          NV-{p.id_nhanvien}
                        </div>
                      </td>
                      <td className="p-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                            {user.ten ? user.ten.charAt(0) : '?'}
                          </div>
                          <span className={isFired ? 'line-through text-red-500' : ''}>{user.ten}</span>
                        </div>
                        {isFired && <div className="text-[10px] text-red-600 font-bold mt-1 ml-9">ĐÃ NGHỈ VIỆC</div>}
                      </td>
                      <td className="p-3.5 px-4 font-semibold text-slate-700">{user.sdt}</td>
                      <td className="p-3.5 px-4 text-blue-700 font-semibold">{p.chucvu}</td>
                      <td className="p-3.5 px-4 text-slate-600 font-medium">{branch.ten_chinhanh || 'Không xác định'}</td>
                      <td className="p-3.5 px-4">
                        <div className="flex gap-1.5 justify-center flex-wrap">
                          <button onClick={() => { setSelectedPersonnel(p); setIsProfileOpen(true); }} className="py-1.5 px-2.5 rounded-md border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            <img src={iconProfile} alt="Hồ sơ" className="w-3.5 h-3.5" style={{ filter: 'currentColor' }} /> Xem hồ sơ
                          </button>
                          <button onClick={() => { setSelectedPersonnel(p); setIsFormOpen(true); }} className="py-1.5 px-3 rounded-md border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            <img src={iconEdit} alt="Sửa" className="w-3.5 h-3.5" style={{ filter: 'currentColor' }} /> Sửa
                          </button>
                          {!isFired && (
                            <button onClick={() => handleDelete(p.id_nhanvien, user.ten)} className="py-1.5 px-2.5 rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                              <img src={iconDelete} alt="Nghỉ việc" className="w-3.5 h-3.5" style={{ filter: 'currentColor' }} /> Nghỉ việc
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="p-3 px-5 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>Hiển thị <b>{currentItems.length}</b> / <b>{filtered.length}</b> nhân sự</span>
            {pageCount > 1 && (() => {
              const PaginateComp = ReactPaginate.default ? ReactPaginate.default : ReactPaginate;
              return <PaginateComp breakLabel="..." nextLabel="Sau >" onPageChange={handlePageClick} pageRangeDisplayed={3} pageCount={pageCount} previousLabel="< Trước" renderOnZeroPageCount={null} containerClassName="flex gap-1" pageLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100" previousLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" nextLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" activeLinkClassName="bg-blue-600 text-white border-blue-600 hover:bg-blue-700" disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent" />;
            })()}
          </div>
        )}
      </div>

      <PersonnelModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} personnel={selectedPersonnel} onSaveSuccess={fetchPersonnel} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} personnel={selectedPersonnel} />
    </AdminMasterLayout>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}><h2>Lỗi Component Nhân Sự!</h2><pre>{this.state.error && this.state.error.toString()}</pre></div>;
    return this.props.children;
  }
}

export default function PersonnelManagementWrapper(props) {
  return <ErrorBoundary><PersonnelManagement {...props} /></ErrorBoundary>;
}
