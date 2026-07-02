import React, { useState, useEffect, Component } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

import iconAccount from '../../../assets/icons/icons8-account-30.png';
import iconAdmin from '../../../assets/icons/icons8-admin-30.png';
import iconEmployee from '../../../assets/icons/icons8-employee-50.png';
import iconCustomer from '../../../assets/icons/icons8-customer-50.png';
import iconReload from '../../../assets/icons/icons8-reload-50.png';
import iconEdit from '../../../assets/icons/icons8-pencil-50.png';
import iconDelete from '../../../assets/icons/icons8-remove-24.png';

const API = 'http://127.0.0.1:8000/api';

const RoleBadge = ({ role }) => {
  const map = {
    1: { label: 'Admin', classes: 'bg-red-100 text-red-700 border-red-300', dot: 'bg-red-600' },
    2: { label: 'Nhân viên', classes: 'bg-blue-100 text-blue-700 border-blue-300', dot: 'bg-blue-600' },
    3: { label: 'Khách hàng', classes: 'bg-green-100 text-green-700 border-green-300', dot: 'bg-green-600' },
  };
  const style = map[role] ?? { label: 'Không rõ', classes: 'bg-gray-100 text-gray-500 border-gray-300', dot: 'bg-gray-500' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${style.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

const SkeletonRow = () => (
  <tr>
    {[40, 130, 180, 100, 120, 90].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3.5 rounded-md bg-gray-200 animate-pulse"
          style={{ width: `${w}px` }}
        />
      </td>
    ))}
    <td className="px-4 py-3.5">
      <div className="flex gap-1.5">
        <div className="h-7 w-14 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-7 w-12 rounded-md bg-gray-200 animate-pulse" />
      </div>
    </td>
  </tr>
);

const UserModal = ({ isOpen, onClose, user, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    Ten: '',
    email: '',
    SDT: '',
    matkhau: '',
    Phanquyen: 3,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        Ten: user.ten || '',
        email: user.email || '',
        SDT: user.sdt || '',
        matkhau: '', // Không tải mật khẩu lên
        Phanquyen: user.phanquyen || 3,
      });
    } else {
      setFormData({
        Ten: '',
        email: '',
        SDT: '',
        matkhau: '',
        Phanquyen: 3,
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");

      if (user) {
        // Gọi API Cập nhật (PUT) - backend cho phép cập nhật Ten, SDT và Phanquyen
        const res = await axios.put(`${API}/admin/users/${user.id_nguoidung}`, {
          Ten: formData.ten,
          SDT: formData.sdt,
          Phanquyen: formData.phanquyen
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Cập nhật người dùng thành công!',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
          });
          window.dispatchEvent(new CustomEvent('admin-notify', { detail: `Đã cập nhật thông tin tài khoản "${formData.ten}" thành công!` }));
          onSaveSuccess();
          onClose();
        }
      } else {

        const res = await axios.post(`${API}/admin/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Thêm người dùng thành công!',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
          });
          window.dispatchEvent(new CustomEvent('admin-notify', { detail: `Đã thêm tài khoản "${formData.ten}" thành công!` }));
          onSaveSuccess();
          onClose();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại!';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: msg,
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {user ? 'Cập nhật Người dùng' : 'Thêm Người dùng Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Họ và Tên <span className="text-red-500">*</span>
              {user && <span className="text-gray-400 font-normal ml-1">(có thể sửa)</span>}
            </label>
            <input type="text" required value={formData.ten} onChange={e => setFormData({ ...formData, Ten: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="Nhập họ và tên..." />
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="abc@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                <input type="password" required minLength="8" value={formData.matkhau} onChange={e => setFormData({ ...formData, matkhau: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="Ít nhất 8 ký tự..." />
              </div>
            </>
          )}

          {user && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 text-sm text-blue-700">
              <span className="font-semibold">Lưu ý:</span> Không thể thay đổi Email và Mật khẩu ở chế độ Cập nhật.
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại {user && <span className="text-gray-400 font-normal">(có thể sửa)</span>}</label>
            <input type="text" value={formData.sdt} onChange={e => setFormData({ ...formData, SDT: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="0912345678" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phân quyền {user && <span className="text-gray-400 font-normal">(có thể sửa)</span>}</label>
            <select value={formData.phanquyen} onChange={e => setFormData({ ...formData, Phanquyen: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer">
              <option value={1}>Admin</option>
              <option value={2}>Nhân viên</option>
              <option value={3}>Khách hàng</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                user ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, ten) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn có chắc chắn muốn xóa tài khoản "${ten}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Vâng, xóa ngay!',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
        const res = await axios.delete(`${API}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success', title: 'Đã xóa!', text: 'Xóa người dùng thành công.',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
          });
          window.dispatchEvent(new CustomEvent('admin-notify', { detail: `Đã xóa tài khoản "${ten}" thành công!` }));
          setUsers(prev => prev.filter(u => u.id_nguoidung !== id));
        }
      } catch (err) {
        Swal.fire({
          icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || 'Có lỗi xảy ra khi xóa!',
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
        });
      }
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || String(u.phanquyen) === filterRole;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (u.ten && u.ten.toLowerCase().includes(q))
      || (u.email && u.email.toLowerCase().includes(q))
      || (u.sdt && u.sdt.includes(q));
    return matchRole && matchSearch;
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filtered.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filtered.length;
    setItemOffset(newOffset);
  };

  useEffect(() => {
    setItemOffset(0);
  }, [search, filterRole]);

  const countByRole = (r) => users.filter(u => u.phanquyen === r).length;

  return (
    <AdminMasterLayout title="Quản lý Người dùng – Admin">
      {}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            Danh Sách Người dùng
          </h1>
        </div>
      </div>
      {}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-100 gap-3">
          {}
          <div className="relative flex-1 min-w-[200px] max-w-[340px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {}
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="py-2 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 cursor-pointer outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors">
              <option value="all">Tất cả quyền</option>
              <option value="1">Admin</option>
              <option value="2">Nhân viên</option>
              <option value="3">Khách hàng</option>
            </select>

            {}
            <button onClick={fetchUsers}
              className="py-2 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-600 cursor-pointer text-sm flex items-center gap-1.5 transition-colors">
              <img src={iconReload} alt="Tải lại" className="w-4 h-4 object-contain" /> Tải lại
            </button>

            {}
            <button onClick={handleAddNew}
              className="py-2 px-4 rounded-lg border-none bg-red-600 hover:bg-red-700 text-white cursor-pointer text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
              + Thêm người dùng
            </button>
          </div>
        </div>

        {}
        {error ? (
          <div className="p-12 text-center text-red-600">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-base font-semibold">{error}</p>
            <button onClick={fetchUsers} className="mt-3 py-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white border-none cursor-pointer font-semibold transition-colors">
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  {['ID', 'Họ và Tên', 'Email', 'Mật khẩu', 'Số điện thoại', 'Phân quyền', 'Thao tác'].map(h => (
                    <th key={h} className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />)
                  : currentItems.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400">
                          <div className="text-4xl mb-2.5">🔍</div>
                          <p className="font-semibold text-base">Không tìm thấy người dùng nào</p>
                          <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </td>
                      </tr>
                    )
                    : currentItems.map((u, idx) => (
                      <tr key={u.id_nguoidung} className={`border-b border-slate-100 transition-colors hover:bg-red-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        {}
                        <td className="p-3.5 px-4 font-bold text-slate-500">
                          #{u.id_nguoidung}
                        </td>

                        {}
                        <td className="p-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full shrink-0 text-white flex items-center justify-center font-bold text-sm bg-gradient-to-br ${u.phanquyen === 1 ? 'from-red-500 to-red-700' :
                              u.phanquyen === 2 ? 'from-blue-500 to-blue-700' :
                                'from-emerald-500 to-emerald-700'
                              }`}>
                              {u.ten ? u.ten.trim().charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="font-semibold text-slate-800">{u.ten || '—'}</span>
                          </div>
                        </td>

                        {}
                        <td className="p-3.5 px-4 text-slate-600">
                          {u.email
                            ? <a href={`mailto:${u.email}`} className="text-blue-600 hover:underline">
                              {u.email}
                            </a>
                            : <span className="text-slate-300">Chưa có</span>
                          }
                        </td>

                        {}
                        <td className="p-3.5 px-4">
                          <span className="font-mono tracking-widest text-slate-400 text-base">••••••••</span>
                        </td>

                        {}
                        <td className="p-3.5 px-4 text-slate-600">
                          {u.sdt
                            ? <span className="bg-slate-100 py-0.5 px-2 rounded-md text-xs font-mono">
                              {u.sdt}
                            </span>
                            : <span className="text-slate-300">Chưa có</span>
                          }
                        </td>

                        {}
                        <td className="p-3.5 px-4">
                          <RoleBadge role={u.phanquyen} />
                        </td>

                        {}
                        <td className="p-3.5 px-4">
                          <div className="flex gap-1.5">
                            <button onClick={() => handleEdit(u)}
                              className="py-1.5 px-3 rounded-md border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer text-xs font-semibold transition-colors flex items-center gap-1.5">
                              <img src={iconEdit} alt="Sửa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Sửa
                            </button>
                            <button onClick={() => handleDelete(u.id_nguoidung, u.ten)}
                              className="py-1.5 px-2.5 rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer text-xs font-semibold transition-colors flex items-center gap-1.5">
                              <img src={iconDelete} alt="Xóa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}

        {}
        {!loading && !error && (
          <div className="p-3 px-5 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <span>
              Hiển thị <b className="text-slate-700">{currentItems.length}</b> / <b className="text-slate-700">{filtered.length}</b> người dùng
            </span>

            {pageCount > 1 && (() => {

              const PaginateComp = ReactPaginate.default ? ReactPaginate.default : ReactPaginate;
              return (
                <PaginateComp
                  breakLabel="..."
                  nextLabel="Sau >"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="flex gap-1"
                  pageLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  previousLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors font-medium"
                  nextLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors font-medium"
                  activeLinkClassName="bg-red-600 text-white border-red-600 hover:bg-red-700"
                  disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
                />
              );
            })()}
          </div>
        )}
      </div>

      {}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSaveSuccess={fetchUsers}
      />
    </AdminMasterLayout>
  );
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}>
          <h2>Đã xảy ra lỗi React!</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UserManagementWrapper(props) {
  return (
    <ErrorBoundary>
      <UserManagement {...props} />
    </ErrorBoundary>
  );
}
