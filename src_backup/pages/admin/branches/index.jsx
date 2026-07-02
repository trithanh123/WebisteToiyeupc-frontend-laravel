import React, { useState, useEffect, Component } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

import BranchModal from './BranchModal'; // Import Component vừa tách ra

import iconReload from '../../../assets/icons/icons8-reload-50.png';
import iconEdit from '../../../assets/icons/icons8-pencil-50.png';
import iconDelete from '../../../assets/icons/icons8-remove-24.png';

const API = 'http://127.0.0.1:8000/api';

// ── Skeleton row ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[100, 200, 200, 150].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3.5 rounded-md bg-gray-200 animate-pulse"
          style={{ width: `${w}px` }}
        />
      </td>
    ))}
  </tr>
);

// ══════════════════════════════════════════════════════════════
const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const fetchBranches = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/admin/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setBranches(res.data.data);
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa chi nhánh?',
      text: `Chắc chắn muốn xóa chi nhánh "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.delete(`${API}/admin/branches/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Đã xóa!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          fetchBranches();
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || 'Có lỗi xảy ra!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
    }
  };

  const filtered = branches.filter(b => {
    const q = search.toLowerCase();
    return !q ||
      (b.Ten_ChiNhanh && b.Ten_ChiNhanh.toLowerCase().includes(q)) ||
      (b.Ma_chi_nhanh && b.Ma_chi_nhanh.toLowerCase().includes(q));
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filtered.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = (event) => {
    setItemOffset((event.selected * itemsPerPage) % filtered.length);
  };

  useEffect(() => { setItemOffset(0); }, [search]);

  return (
    <AdminMasterLayout title="Hệ thống Chi nhánh – Admin">
      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-2xl font-bold text-slate-800 m-0">Danh Sách Chi Nhánh</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-100 gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-[340px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã, tên chi nhánh..." className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-blue-500 transition-colors" />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button onClick={fetchBranches} className="py-2 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-600 text-sm flex items-center gap-1.5 transition-colors">
              <img src={iconReload} alt="Tải lại" className="w-4 h-4 object-contain" /> Tải lại
            </button>
            <button onClick={() => { setEditingBranch(null); setIsModalOpen(true); }} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm">
              + Thêm Chi nhánh
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-600"><div className="text-4xl mb-3">⚠️</div><p className="font-semibold">{error}</p><button onClick={fetchBranches} className="mt-3 py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Thử lại</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Mã CN</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Tên Chi Nhánh</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Liên hệ</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />) : currentItems.length === 0 ? <tr><td colSpan={4} className="p-12 text-center text-slate-400">Không có dữ liệu chi nhánh</td></tr> : currentItems.map((b, idx) => (
                  <tr key={b.iD_ChiNhanh} className={`border-b border-slate-100 hover:bg-blue-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>

                    <td className="p-3.5 px-4">
                      <div className="font-bold text-blue-600 uppercase font-mono bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                        {b.Ma_chi_nhanh}
                      </div>
                    </td>

                    <td className="p-3.5 px-4">
                      <div className="font-bold text-slate-800 text-sm">
                        {b.Ten_ChiNhanh}
                      </div>
                    </td>

                    <td className="p-3.5 px-4">
                      <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span className="font-semibold">{b.SDT_Chi_nhanh}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span>{b.email_chi_nhanh}</span>
                      </div>
                    </td>

                    <td className="p-3.5 px-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {b.map_link && (
                          <a href={b.map_link} target="_blank" rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title="Mở Google Maps">
                            📍 Map
                          </a>
                        )}
                        <button onClick={() => { setEditingBranch(b); setIsModalOpen(true); }} className="py-1.5 px-3 rounded-md border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"><img src={iconEdit} alt="Sửa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Sửa</button>
                        <button onClick={() => handleDelete(b.iD_ChiNhanh, b.Ten_ChiNhanh)} className="py-1.5 px-2.5 rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"><img src={iconDelete} alt="Xóa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="p-3 px-5 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>Hiển thị <b>{currentItems.length}</b> / <b>{filtered.length}</b> chi nhánh</span>
            {pageCount > 1 && (() => {
              const PaginateComp = ReactPaginate.default ? ReactPaginate.default : ReactPaginate;
              return <PaginateComp breakLabel="..." nextLabel="Sau >" onPageChange={handlePageClick} pageRangeDisplayed={3} pageCount={pageCount} previousLabel="< Trước" renderOnZeroPageCount={null} containerClassName="flex gap-1" pageLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100" previousLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" nextLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" activeLinkClassName="bg-blue-600 text-white border-blue-600 hover:bg-blue-700" disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent" />;
            })()}
          </div>
        )}
      </div>

      <BranchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} branch={editingBranch} onSaveSuccess={fetchBranches} />
    </AdminMasterLayout>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}><h2>Lỗi Component Chi Nhánh!</h2><pre>{this.state.error && this.state.error.toString()}</pre></div>;
    return this.props.children;
  }
}

export default function BranchManagementWrapper(props) {
  return <ErrorBoundary><BranchManagement {...props} /></ErrorBoundary>;
}
