import React, { useState, useEffect, Component } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

import iconReload from '../../../assets/icons/icons8-reload-50.png';
import iconEdit from '../../../assets/icons/icons8-pencil-50.png';
import iconDelete from '../../../assets/icons/icons8-remove-24.png';

// Nhập CategoryModal từ trang categories để tái sử dụng
import { CategoryModal } from '../categories/index';

const API = 'http://127.0.0.1:8000/api';

// ── Skeleton row ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[40, 100, 200, 100, 100, 90].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3.5 rounded-md bg-gray-200 animate-pulse"
          style={{ width: `${w}px` }}
        />
      </td>
    ))}
  </tr>
);

// ── Modal Thêm / Cập Nhật Sản Phẩm ─────────────────────────────
const ProductModal = ({ isOpen, onClose, product, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    Ma_DanhMuc: '',
    MaSP: '',
    TenSP: '',
    Gia: '',
    Thumbail: '',
    Motasanpham: '',
    specifications: {},
  });
  const [loading, setLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Trạng thái cho Modal thêm danh mục
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // State phục vụ cho việc nhập Thông số kỹ thuật (Form Động Key-Value)
  const [specList, setSpecList] = useState([]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/categories/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setCategoriesList(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  };

  // Xây dựng cây danh mục phân cấp để hiển thị trong dropdown
  const buildCategoryTree = (categories) => {
    const roots = categories.filter(c => !c.DanhMuc_cha);
    const childrenOf = {};
    categories.forEach(c => {
      if (c.DanhMuc_cha) {
        if (!childrenOf[c.DanhMuc_cha]) childrenOf[c.DanhMuc_cha] = [];
        childrenOf[c.DanhMuc_cha].push(c);
      }
    });
    const result = [];
    const addNodes = (nodes, level) => {
      nodes.forEach(node => {
        const prefix = level === 0 ? '' : level === 1 ? '— ' : '—— ';
        result.push({ ...node, displayName: prefix + node.Ten_DanhMuc, level });
        if (childrenOf[node.ID_DanhMuc]) {
          addNodes(childrenOf[node.ID_DanhMuc], level + 1);
        }
      });
    };
    addNodes(roots, 0);
    return result;
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        setFormData({
          Ma_DanhMuc: product.Ma_DanhMuc || '',
          MaSP: product.MaSP || '',
          TenSP: product.TenSP || '',
          Gia: product.Gia || '',
          Thumbail: product.Thumbail || '',
          Motasanpham: product.Motasanpham || '',
          specifications: product.specifications || {},
        });
        
        // Chuyển object specifications thành mảng [{key, value}] để render form
        const initialSpecs = product.specifications || {};
        const specsArray = Object.keys(initialSpecs).map(k => ({ key: k, value: initialSpecs[k] }));
        setSpecList(specsArray);
      } else {
        setFormData({
          Ma_DanhMuc: '',
          MaSP: '',
          TenSP: '',
          Gia: '',
          Thumbail: '',
          Motasanpham: '',
          specifications: {},
        });
        setSpecList([]);
      }
    }
  }, [product, isOpen]);

  // Đồng bộ từ mảng specList về lại object formData.specifications
  useEffect(() => {
    const newSpecs = {};
    specList.forEach(item => {
      if (item.key.trim() !== '') {
        newSpecs[item.key.trim()] = item.value;
      }
    });
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  }, [specList]);

  // Các hàm thao tác với specList
  const handleAddSpecRow = () => {
    setSpecList([...specList, { key: '', value: '' }]);
  };

  const handleUpdateSpecRow = (index, field, val) => {
    const newList = [...specList];
    newList[index][field] = val;
    setSpecList(newList);
  };

  const handleRemoveSpecRow = (index) => {
    const newList = [...specList];
    newList.splice(index, 1);
    setSpecList(newList);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (product) {
        // Cập nhật (PUT)
        const res = await axios.put(`${API}/admin/products/${product.ID_SanPham}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success', title: 'Thành công!', text: 'Cập nhật sản phẩm thành công!',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
          });
          onSaveSuccess();
          onClose();
        }
      } else {
        // Thêm mới (POST)
        const res = await axios.post(`${API}/admin/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success', title: 'Thành công!', text: 'Thêm sản phẩm thành công!',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
          });
          onSaveSuccess();
          onClose();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại!';
      Swal.fire({
        icon: 'error', title: 'Lỗi!', text: msg,
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories(); // Reload lại danh sách danh mục sau khi thêm mới
  };

  return (
    <>
      <div className="fixed inset-0 z-[40] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              {product ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm Mới'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mã SP <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.MaSP} onChange={e => setFormData({ ...formData, MaSP: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="SP001..." disabled={!!product} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select required value={formData.Ma_DanhMuc} onChange={e => setFormData({ ...formData, Ma_DanhMuc: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none cursor-pointer">
                    <option value="">-- Chọn danh mục --</option>
                    {buildCategoryTree(categoriesList).map(cat => (
                      <option
                        key={cat.ID_DanhMuc}
                        value={cat.ID_DanhMuc}
                        style={{
                          fontWeight: cat.level === 0 ? 'bold' : 'normal',
                          color: cat.level === 0 ? '#dc2626' : cat.level === 1 ? '#374151' : '#6b7280',
                          paddingLeft: cat.level * 16,
                        }}
                      >
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setIsCategoryModalOpen(true)}
                    className="px-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors font-bold flex items-center justify-center"
                    title="Thêm danh mục mới">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={formData.TenSP} onChange={e => setFormData({ ...formData, TenSP: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="Nhập tên sản phẩm..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input type="number" required min="0" value={formData.Gia} onChange={e => setFormData({ ...formData, Gia: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="1500000..." />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL Hình ảnh (Thumbnail)</label>
              <input type="text" value={formData.Thumbail} onChange={e => setFormData({ ...formData, Thumbail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="https://..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả sản phẩm</label>
              <textarea value={formData.Motasanpham} onChange={e => setFormData({ ...formData, Motasanpham: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all h-24"
                placeholder="Nhập mô tả..." />
            </div>

            {/* Form Động nhập Thông số kỹ thuật */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-slate-700">Thông số kỹ thuật (Tùy chọn)</label>
                <button type="button" onClick={handleAddSpecRow}
                  className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-100 transition-colors flex items-center gap-1">
                  + Thêm thông số
                </button>
              </div>
              
              {specList.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-2">Chưa có thông số kỹ thuật nào.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {specList.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input type="text" value={spec.key} onChange={e => handleUpdateSpecRow(index, 'key', e.target.value)}
                        className="w-1/3 px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-red-500 outline-none"
                        placeholder="Tên (VD: CPU, RAM)" />
                      <input type="text" value={spec.value} onChange={e => handleUpdateSpecRow(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-red-500 outline-none"
                        placeholder="Giá trị (VD: Core i7, 16GB)" />
                      <button type="button" onClick={() => handleRemoveSpecRow(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Xóa dòng này">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3 border-t border-gray-100 mt-5">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  product ? 'Cập nhật' : 'Thêm mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Danh Mục lồng lên trên */}
      {isCategoryModalOpen && (
        <div className="relative z-[60]">
          <CategoryModal 
            isOpen={isCategoryModalOpen} 
            onClose={() => setIsCategoryModalOpen(false)} 
            category={null} 
            onSaveSuccess={() => {
              handleCategoryAdded();
              setIsCategoryModalOpen(false);
            }} 
            categoriesList={categoriesList} 
          />
        </div>
      )}
    </>
  );
};

// ══════════════════════════════════════════════════════════════
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setProducts(res.data.data);
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Chắc chắn muốn xóa "${name}"?`,
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
        const res = await axios.delete(`${API}/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Đã xóa!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          fetchProducts();
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || 'Có lỗi xảy ra!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
    }
  };

  const uniqueCategories = [...new Set(products.map(p => p.Ten_DanhMuc).filter(Boolean))];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
           (p.TenSP && p.TenSP.toLowerCase().includes(q)) || 
           (p.MaSP && p.MaSP.toLowerCase().includes(q)) ||
           (p.Ten_DanhMuc && p.Ten_DanhMuc.toLowerCase().includes(q));
           
    const matchCategory = !filterCategory || p.Ten_DanhMuc === filterCategory;

    return matchSearch && matchCategory;
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filtered.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = (event) => {
    setItemOffset((event.selected * itemsPerPage) % filtered.length);
  };

  useEffect(() => { setItemOffset(0); }, [search, filterCategory]);

  return (
    <AdminMasterLayout title="Quản lý Sản phẩm – Admin">
      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-2xl font-bold text-slate-800 m-0">Danh Sách Sản Phẩm</h1>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-100 gap-3">
          <div className="flex flex-wrap gap-3 items-center flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-[340px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã, tên..." className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-red-500 transition-colors" />
            </div>

            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="py-2 px-3 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-red-500 transition-colors text-slate-600 font-semibold cursor-pointer max-w-[200px] truncate"
            >
              <option value="">-- Lọc theo danh mục --</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button onClick={fetchProducts} className="py-2 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-600 text-sm flex items-center gap-1.5 transition-colors">
              <img src={iconReload} alt="Tải lại" className="w-4 h-4 object-contain" /> Tải lại
            </button>
            <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm">
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-600"><div className="text-4xl mb-3">⚠️</div><p className="font-semibold">{error}</p><button onClick={fetchProducts} className="mt-3 py-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Thử lại</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Mã SP</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Tên Sản Phẩm</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Danh mục</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Giá</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />) : currentItems.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-slate-400">Không có dữ liệu</td></tr> : currentItems.map((p, idx) => (
                  <tr key={p.ID_SanPham} className={`border-b border-slate-100 hover:bg-red-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="p-3.5 px-4 font-bold text-slate-500">{p.MaSP}</td>
                    <td className="p-3.5 px-4 font-semibold text-slate-800">{p.TenSP}</td>
                    <td className="p-3.5 px-4">
                      <span className="bg-blue-50 text-blue-700 py-0.5 px-2 rounded-md text-xs font-semibold">{p.Ten_DanhMuc}</span>
                    </td>
                    <td className="p-3.5 px-4 text-right font-mono font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(p.Gia)} đ</td>
                    <td className="p-3.5 px-4">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="py-1.5 px-3 rounded-md border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1.5"><img src={iconEdit} alt="Sửa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Sửa</button>
                        <button onClick={() => handleDelete(p.ID_SanPham, p.TenSP)} className="py-1.5 px-2.5 rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center gap-1.5"><img src={iconDelete} alt="Xóa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Xóa</button>
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
            <span>Hiển thị <b>{currentItems.length}</b> / <b>{filtered.length}</b> sản phẩm</span>
            {pageCount > 1 && (() => {
              const PaginateComp = ReactPaginate.default ? ReactPaginate.default : ReactPaginate;
              return <PaginateComp breakLabel="..." nextLabel="Sau >" onPageChange={handlePageClick} pageRangeDisplayed={3} pageCount={pageCount} previousLabel="< Trước" renderOnZeroPageCount={null} containerClassName="flex gap-1" pageLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100" previousLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" nextLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" activeLinkClassName="bg-red-600 text-white border-red-600 hover:bg-red-700" disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent" />;
            })()}
          </div>
        )}
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={editingProduct} onSaveSuccess={fetchProducts} />
    </AdminMasterLayout>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}><h2>Lỗi Component Sản phẩm!</h2><pre>{this.state.error && this.state.error.toString()}</pre></div>;
    return this.props.children;
  }
}

export default function ProductManagementWrapper(props) {
  return <ErrorBoundary><ProductManagement {...props} /></ErrorBoundary>;
}
