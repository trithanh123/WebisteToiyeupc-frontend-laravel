import React, { useState, useEffect, Component } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

import iconReload from '../../../assets/icons/icons8-reload-50.png';
import iconEdit from '../../../assets/icons/icons8-pencil-50.png';
import iconDelete from '../../../assets/icons/icons8-remove-24.png';

import iconCase from '../../../assets/icons/icons8-case-64.png';
import iconCPU from '../../../assets/icons/icons8-cpu-50.png';
import iconHDD from '../../../assets/icons/icons8-hdd-50.png';
import iconKeyboard from '../../../assets/icons/icons8-keyboard-32.png';
import iconLaptop from '../../../assets/icons/icons8-laptop-50.png';
import iconLaptopGaming from '../../../assets/icons/icons8-laptop-gaming-64.png';
import iconMainboard from '../../../assets/icons/icons8-mainboard-32.png';
import iconMouse from '../../../assets/icons/icons8-mouse-50.png';
import iconPC from '../../../assets/icons/icons8-pc-64.png';
import iconPower from '../../../assets/icons/icons8-power-supply-64.png';
import iconRAM from '../../../assets/icons/icons8-ram-64.png';
import iconScreen from '../../../assets/icons/icons8-screen-50.png';
import iconVGA from '../../../assets/icons/icons8-vga-50.png';

const API = 'http://127.0.0.1:8000/api';

export const ICON_LIST = [
  { name: 'icons8-case-64.png',           src: iconCase,         label: 'Case máy tính' },
  { name: 'icons8-cpu-50.png',            src: iconCPU,          label: 'CPU' },
  { name: 'icons8-hdd-50.png',            src: iconHDD,          label: 'Ổ cứng HDD' },
  { name: 'icons8-keyboard-32.png',       src: iconKeyboard,     label: 'Bàn phím' },
  { name: 'icons8-laptop-50.png',         src: iconLaptop,       label: 'Laptop' },
  { name: 'icons8-laptop-gaming-64.png',  src: iconLaptopGaming, label: 'Laptop Gaming' },
  { name: 'icons8-mainboard-32.png',      src: iconMainboard,    label: 'Mainboard' },
  { name: 'icons8-mouse-50.png',          src: iconMouse,        label: 'Chuột' },
  { name: 'icons8-pc-64.png',             src: iconPC,           label: 'PC' },
  { name: 'icons8-power-supply-64.png',   src: iconPower,        label: 'Nguồn điện' },
  { name: 'icons8-ram-64.png',            src: iconRAM,          label: 'RAM' },
  { name: 'icons8-screen-50.png',         src: iconScreen,       label: 'Màn hình' },
  { name: 'icons8-vga-50.png',            src: iconVGA,          label: 'Card VGA' },
];

export const getIconSrc = (name) => {
  const found = ICON_LIST.find(i => i.name === name);
  return found ? found.src : null;
};

export const CategoryModal = ({ isOpen, onClose, category, onSaveSuccess, categoriesList }) => {
  const [formData, setFormData] = useState({
    Ten_DanhMuc: '',
    slug: '',
    DanhMuc_cha: '',
    Hinhanh_icon: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const toSlug = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

  useEffect(() => {
    if (category) {
      setFormData({
        Ten_DanhMuc: category.ten_danhmuc || '',
        slug: category.slug || '',
        DanhMuc_cha: category.danhmuc_cha || '',
        Hinhanh_icon: category.hinhanh_icon || '',
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    } else {
      setFormData({ Ten_DanhMuc: '', slug: '', DanhMuc_cha: '', Hinhanh_icon: '', is_active: true });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setFormData(prev => ({ ...prev, Ten_DanhMuc: val, slug: toSlug(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const payload = {
        Ten_DanhMuc: formData.ten_danhmuc,
        slug: formData.slug || undefined,
        DanhMuc_cha: formData.danhmuc_cha ? Number(formData.danhmuc_cha) : null,
        Hinhanh_icon: formData.hinhanh_icon,
        is_active: formData.is_active,
      };
      const headers = { Authorization: `Bearer ${token}` };

      if (category) {
        await axios.put(`${API}/admin/categories/${category.id_danhmuc}`, payload, { headers });
        Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
      } else {
        await axios.post(`${API}/admin/categories`, payload, { headers });
        Swal.fire({ icon: 'success', title: 'Thêm danh mục thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra!';
      Swal.fire({ icon: 'error', title: 'Lỗi!', text: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        .cm-input { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 14px; outline: none; box-sizing: border-box; color: #374151; }
        .cm-input:focus { border-color: #dc2626; }
        .cm-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
        .cm-group { margin-bottom: 13px; }
      `}</style>

      <div style={{ background: '#fff', width: 460, borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {}
        <div style={{ background: '#dc2626', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {category ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {}
        <form onSubmit={handleSubmit} style={{ padding: '16px 18px 14px' }}>

          <div className="cm-group">
            <label className="cm-label">Tên danh mục <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              className="cm-input"
              type="text"
              required
              value={formData.ten_danhmuc}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Nhập tên danh mục..."
            />
          </div>

          <div className="cm-group">
            <label className="cm-label">Slug URL</label>
            <input
              className="cm-input"
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="ten-danh-muc"
            />
          </div>

          <div className="cm-group">
            <label className="cm-label">Danh mục cha</label>
            <select
              className="cm-input"
              value={formData.danhmuc_cha}
              onChange={e => setFormData({ ...formData, DanhMuc_cha: e.target.value })}
            >
              <option value="">-- Là danh mục gốc --</option>
              {categoriesList && categoriesList
                .filter(cat => !category || cat.id_danhmuc !== category.id_danhmuc)
                .map(cat => (
                  <option key={cat.id_danhmuc} value={cat.id_danhmuc}>
                    {cat.danhmuc_cha ? `  ↳ ${cat.ten_danhmuc}` : cat.ten_danhmuc}
                  </option>
                ))}
            </select>
          </div>

          <div className="cm-group">
            <label className="cm-label">Icon</label>
            <select
              className="cm-input"
              value={formData.hinhanh_icon}
              onChange={e => setFormData({ ...formData, Hinhanh_icon: e.target.value })}
            >
              <option value="">-- Không chọn --</option>
              {ICON_LIST.map(icon => (
                <option key={icon.name} value={icon.name}>{icon.label}</option>
              ))}
            </select>
          </div>

          <div className="cm-group">
            <label className="cm-label">Trạng thái</label>
            <select
              className="cm-input"
              value={formData.is_active ? '1' : '0'}
              onChange={e => setFormData({ ...formData, is_active: e.target.value === '1' })}
            >
              <option value="1">Hiển thị</option>
              <option value="0">Ẩn</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '8px 0', border: '1px solid #d1d5db', borderRadius: 5, background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 2, padding: '8px 0', border: 'none', borderRadius: 5, background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Đang lưu...' : (category ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resAll, resTree] = await Promise.all([
        axios.get(`${API}/categories/all`, { headers }),
        axios.get(`${API}/admin/categories`, { headers }),
      ]);

      if (resAll.data.status === 'success') setFlatCategories(resAll.data.data);

      if (resTree.data.status === 'success') {
        let flat = [];
        const process = (node, level = 0, parentName = null) => {
          flat.push({ ...node, level, parentName });
          if (node.danh_muc_con?.length > 0)
            node.danh_muc_con.forEach(child => process(child, level + 1, node.ten_danhmuc));
        };
        resTree.data.data.forEach(root => process(root, 0, null));
        setCategories(flat);
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa danh mục?',
      html: `Bạn có chắc muốn xóa danh mục <b>"${name}"</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      await axios.delete(`${API}/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ icon: 'success', title: 'Đã xóa!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
      fetchCategories();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || 'Có lỗi xảy ra khi xóa!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      await axios.patch(`${API}/admin/categories/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchCategories();
    } catch {
      Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Không thể thay đổi trạng thái!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
  };

  const filtered = categories.filter(c => {
    const q = search.toLowerCase();
    return !q || c.ten_danhmuc?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q);
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filtered.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filtered.length;
    setItemOffset(newOffset);
  };
  useEffect(() => { setItemOffset(0); }, [search]);

  return (
    <AdminMasterLayout title="Quản lý Danh mục – Admin">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .cat-page-table thead th { position: sticky; top: 0; z-index: 2; }
        .row-hover:hover { background: #fff5f5 !important; }
        .badge-active { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 20px; padding: 3px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .badge-active:hover { background: #16a34a; color: #fff; }
        .badge-hidden { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 20px; padding: 3px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .badge-hidden:hover { background: #475569; color: #fff; }
        .action-edit { padding: 5px 11px; border-radius: 6px; border: 1px solid #3b82f6; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .action-edit:hover { background: #3b82f6; color: #fff; }
        .action-del { padding: 5px 9px; border-radius: 6px; border: 1px solid #fca5a5; background: #fff5f5; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .action-del:hover { background: #dc2626; color: #fff; }
      `}</style>

      {}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Quản lý Danh mục</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#9ca3af' }}>Quản lý cây danh mục sản phẩm</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          + Thêm danh mục
        </button>
      </div>

      {}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

        {}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên danh mục, slug..."
              style={{ width: '100%', padding: '7px 10px 7px 32px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#dc2626'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <button
            onClick={fetchCategories}
            style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}
          >
            <img src={iconReload} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
            Tải lại
          </button>
        </div>

        {/* Table */}
        {error ? (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#dc2626', marginBottom: 12 }}>{error}</p>
            <button onClick={fetchCategories} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Thử lại</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cat-page-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['ID', 'Tên danh mục', 'Danh mục cha', 'Slug', 'Trạng thái', 'Thao tác'].map(col => (
                    <th key={col} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Đang tải...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '50px 20px', textAlign: 'center', color: '#9ca3af' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                      <div style={{ fontSize: 14 }}>Không tìm thấy danh mục nào</div>
                    </td>
                  </tr>
                ) : currentItems.map((c, idx) => (
                  <tr
                    key={c.id_danhmuc}
                    className="row-hover"
                    style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td style={{ padding: '11px 14px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>#{c.id_danhmuc}</td>

                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>
                      {c.ten_danhmuc}
                    </td>

                    <td style={{ padding: '11px 14px' }}>
                      {c.parentName
                        ? <span style={{ fontSize: 12, color: '#2563eb' }}>{c.parentName}</span>
                        : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                      }
                    </td>

                    <td style={{ padding: '11px 14px' }}>
                      <code style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 4, padding: '2px 7px', display: 'inline-block', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.slug}
                      </code>
                    </td>

                    <td style={{ padding: '11px 14px' }}>
                      <button
                        onClick={() => handleToggle(c.id_danhmuc)}
                        className={c.is_active ? 'badge-active' : 'badge-hidden'}
                        title="Click để thay đổi"
                      >
                        {c.is_active ? '● Hiện' : '○ Ẩn'}
                      </button>
                    </td>

                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="action-edit" onClick={() => { setEditingCategory(c); setIsModalOpen(true); }}>
                          <img src={iconEdit} alt="" style={{ width: 12, height: 12 }} /> Sửa
                        </button>
                        <button className="action-del" onClick={() => handleDelete(c.id_danhmuc, c.ten_danhmuc)}>
                          <img src={iconDelete} alt="" style={{ width: 12, height: 12 }} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>
              Hiển thị <strong style={{ color: '#111827' }}>{currentItems.length}</strong> / <strong style={{ color: '#111827' }}>{filtered.length}</strong> danh mục
            </span>
            {pageCount > 1 && (() => {
              const PaginateComp = ReactPaginate.default ? ReactPaginate.default : ReactPaginate;
              return (
                <PaginateComp
                  breakLabel="..."
                  nextLabel="Sau →"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel="← Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="flex gap-1.5 items-center"
                  pageLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm transition-colors"
                  previousLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm font-semibold"
                  nextLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm font-semibold"
                  activeLinkClassName="!bg-red-600 !text-white !border-red-600 hover:!bg-red-700"
                  disabledLinkClassName="opacity-40 cursor-not-allowed hover:bg-transparent"
                />
              );
            })()}
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSaveSuccess={fetchCategories}
        categoriesList={flatCategories}
      />
    </AdminMasterLayout>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 24, background: '#ffebee', color: '#c62828', borderRadius: 8 }}>
        <h2>Lỗi tải trang Danh mục!</h2>
        <p>Vui lòng thử tải lại trang.</p>
      </div>
    );
    return this.props.children;
  }
}

export default function CategoryManagementWrapper(props) {
  return <ErrorBoundary><CategoryManagement {...props} /></ErrorBoundary>;
}
