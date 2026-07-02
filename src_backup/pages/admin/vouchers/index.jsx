import React, { useState, useEffect, Component } from 'react';
import AdminMasterLayout from '../theme/masterLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

import iconReload from '../../../assets/icons/icons8-reload-50.png';
import iconEdit from '../../../assets/icons/icons8-pencil-50.png';
import iconDelete from '../../../assets/icons/icons8-remove-24.png';

const API = 'http://127.0.0.1:8000/api';

// ── Hàm hỗ trợ format ngày giờ ──────────────────────────────
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

// ── Skeleton row ───────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[40, 150, 100, 100, 120, 100, 90].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3.5 rounded-md bg-gray-200 animate-pulse"
          style={{ width: `${w}px` }}
        />
      </td>
    ))}
  </tr>
);

// ── Modal Thêm / Cập Nhật Voucher ─────────────────────────────
const VoucherModal = ({ isOpen, onClose, voucher, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    Tenkhuyenmai: '',
    Ma_voucher: '',
    Loai_giamgia: 'Phần trăm', // Default
    gia_trigiam: '',
    don_toithieu: '',
    giam_toida: '',
    soluongma: '',
    ngaybdchuongtrinh: '',
    ngayketthucchuongtrinh: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (voucher) {
        setFormData({
          Tenkhuyenmai: voucher.Tenkhuyenmai || '',
          Ma_voucher: voucher.Ma_voucher || '',
          Loai_giamgia: voucher.Loai_giamgia || 'Phần trăm',
          gia_trigiam: voucher.gia_trigiam || '',
          don_toithieu: voucher.don_toithieu || '',
          giam_toida: voucher.giam_toida || '',
          soluongma: voucher.soluongma || '',
          ngaybdchuongtrinh: formatDateForInput(voucher.ngaybdchuongtrinh),
          ngayketthucchuongtrinh: formatDateForInput(voucher.ngayketthucchuongtrinh),
        });
      } else {
        setFormData({
          Tenkhuyenmai: '',
          Ma_voucher: '',
          Loai_giamgia: 'Phần trăm',
          gia_trigiam: '',
          don_toithieu: '',
          giam_toida: '',
          soluongma: '',
          ngaybdchuongtrinh: '',
          ngayketthucchuongtrinh: ''
        });
      }
    }
  }, [voucher, isOpen]);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, Ma_voucher: code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const payload = {
        ...formData,
        // Ép sang định dạng yyyy-mm-dd HH:mm:ss để laravel dễ nhận nếu cần, nhưng gửi nguyên T cũng được
        ngaybdchuongtrinh: formData.ngaybdchuongtrinh.replace('T', ' ') + ':00',
        ngayketthucchuongtrinh: formData.ngayketthucchuongtrinh.replace('T', ' ') + ':00',
      };

      if (voucher) {
        // Cập nhật (PUT)
        const res = await axios.put(`${API}/admin/vouchers/${voucher.id_khuyenmai}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật voucher thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          onSaveSuccess();
          onClose();
        }
      } else {
        // Thêm mới (POST)
        const res = await axios.post(`${API}/admin/vouchers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Thêm voucher thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          onSaveSuccess();
          onClose();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại!';
      
      // Xử lý lỗi validation từ Laravel trả về (422)
      let detailedErrors = '';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        detailedErrors = errors[firstErrorKey][0];
      }
      
      Swal.fire({
        icon: 'error', title: 'Lỗi!', text: detailedErrors || msg,
        toast: true, position: 'top-end', showConfirmButton: false, timer: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {voucher ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên chương trình KM <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={formData.Tenkhuyenmai} onChange={e => setFormData({ ...formData, Tenkhuyenmai: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="VD: Siêu sale 11/11..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input type="text" required value={formData.Ma_voucher} onChange={e => setFormData({ ...formData, Ma_voucher: e.target.value })}
                  className="w-full pl-3 pr-24 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all uppercase"
                  placeholder="SALE50K" />
                <button type="button" onClick={generateRandomCode}
                  className="absolute right-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-md transition-colors font-semibold text-[11px] whitespace-nowrap">
                  Tạo mã
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select required value={formData.Loai_giamgia} onChange={e => setFormData({ ...formData, Loai_giamgia: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none cursor-pointer">
                <option value="Phần trăm">Phần trăm (%)</option>
                <option value="Số tiền">Tiền mặt (VNĐ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="number" required min="0" value={formData.gia_trigiam} onChange={e => setFormData({ ...formData, gia_trigiam: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder={formData.Loai_giamgia === 'Phần trăm' ? 'VD: 10' : 'VD: 50000'} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                  {formData.Loai_giamgia === 'Phần trăm' ? '%' : 'đ'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Số lượng mã <span className="text-red-500">*</span>
              </label>
              <input type="number" required min="0" value={formData.soluongma} onChange={e => setFormData({ ...formData, soluongma: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="Số lượng phát hành..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Đơn tối thiểu để áp dụng (Tùy chọn)
              </label>
              <div className="relative">
                <input type="number" min="0" value={formData.don_toithieu} onChange={e => setFormData({ ...formData, don_toithieu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="Để trống nếu không yêu cầu..." />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">đ</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Giảm tối đa (Tùy chọn)
              </label>
              <div className="relative">
                <input type="number" min="0" value={formData.giam_toida} onChange={e => setFormData({ ...formData, giam_toida: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="Áp dụng khi giảm %..." />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">đ</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ngày Bắt đầu <span className="text-red-500">*</span>
              </label>
              <input type="datetime-local" required value={formData.ngaybdchuongtrinh} onChange={e => setFormData({ ...formData, ngaybdchuongtrinh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ngày Kết thúc <span className="text-red-500">*</span>
              </label>
              <input type="datetime-local" required value={formData.ngayketthucchuongtrinh} onChange={e => setFormData({ ...formData, ngayketthucchuongtrinh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />
            </div>
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
                voucher ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/admin/vouchers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setVouchers(res.data.data);
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Xóa mã khuyến mãi?',
      text: `Chắc chắn muốn xóa voucher "${name}"?`,
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
        const res = await axios.delete(`${API}/admin/vouchers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Đã xóa!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          fetchVouchers();
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Thất bại!', text: err.response?.data?.message || 'Có lỗi xảy ra!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
    }
  };

  // Hàm xác định trạng thái bằng các badge theo yêu cầu
  const renderStatusBadge = (v) => {
    const now = new Date();
    const start = new Date(v.ngaybdchuongtrinh);
    const end = new Date(v.ngayketthucchuongtrinh);
    const remaining = v.soluongma - (v.dasudung || 0);

    if (now > end || remaining <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          Đã hết hạn / Hết lượt
        </span>
      );
    }
    
    if (now < start) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-yellow-200 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
          Chưa diễn ra
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
        Đang hoạt động
      </span>
    );
  };

  const filtered = vouchers.filter(v => {
    const q = search.toLowerCase();
    return !q || 
           (v.Tenkhuyenmai && v.Tenkhuyenmai.toLowerCase().includes(q)) || 
           (v.Ma_voucher && v.Ma_voucher.toLowerCase().includes(q));
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filtered.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = (event) => {
    setItemOffset((event.selected * itemsPerPage) % filtered.length);
  };

  useEffect(() => { setItemOffset(0); }, [search]);

  return (
    <AdminMasterLayout title="Quản lý Khuyến mãi – Admin">
      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-2xl font-bold text-slate-800 m-0">Danh Sách Voucher (Khuyến mãi)</h1>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-100 gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-[340px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên chương trình, mã voucher..." className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-red-500 transition-colors" />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button onClick={fetchVouchers} className="py-2 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-600 text-sm flex items-center gap-1.5 transition-colors">
              <img src={iconReload} alt="Tải lại" className="w-4 h-4 object-contain" /> Tải lại
            </button>
            <button onClick={() => { setEditingVoucher(null); setIsModalOpen(true); }} className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-sm">
              + Thêm Voucher
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-12 text-center text-red-600"><div className="text-4xl mb-3">⚠️</div><p className="font-semibold">{error}</p><button onClick={fetchVouchers} className="mt-3 py-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Thử lại</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Mã / Tên CT</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Giảm giá</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Thời gian</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Đã dùng / Tổng</th>
                  <th className="p-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />) : currentItems.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-slate-400">Không có dữ liệu</td></tr> : currentItems.map((v, idx) => (
                  <tr key={v.id_khuyenmai} className={`border-b border-slate-100 hover:bg-red-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    
                    <td className="p-3.5 px-4">
                      <div className="font-bold text-red-600 uppercase font-mono bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100 mb-1">
                        {v.Ma_voucher}
                      </div>
                      <div className="text-slate-700 font-semibold text-xs">{v.Tenkhuyenmai}</div>
                    </td>
                    
                    <td className="p-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {v.Loai_giamgia === 'Phần trăm' ? `${v.gia_trigiam}%` : `${new Intl.NumberFormat('vi-VN').format(v.gia_trigiam)} đ`}
                      </div>
                      {v.don_toithieu > 0 && <div className="text-[10px] text-gray-500 mt-1">Đơn tối thiểu: {new Intl.NumberFormat('vi-VN').format(v.don_toithieu)} đ</div>}
                      {v.giam_toida > 0 && <div className="text-[10px] text-gray-500">Giảm tối đa: {new Intl.NumberFormat('vi-VN').format(v.giam_toida)} đ</div>}
                    </td>

                    <td className="p-3.5 px-4">
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <span className="w-10 inline-block font-semibold">Từ:</span> {formatDisplayDate(v.ngaybdchuongtrinh)}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                        <span className="w-10 inline-block font-semibold">Đến:</span> {formatDisplayDate(v.ngayketthucchuongtrinh)}
                      </div>
                    </td>

                    <td className="p-3.5 px-4 text-center">
                      {renderStatusBadge(v)}
                    </td>

                    <td className="p-3.5 px-4 text-center">
                       <span className="font-bold text-slate-700">{v.dasudung || 0}</span> / <span className="font-semibold text-slate-500">{v.soluongma}</span>
                    </td>

                    <td className="p-3.5 px-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => { setEditingVoucher(v); setIsModalOpen(true); }} className="py-1.5 px-3 rounded-md border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1.5"><img src={iconEdit} alt="Sửa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Sửa</button>
                        <button onClick={() => handleDelete(v.id_khuyenmai, v.Ma_voucher)} className="py-1.5 px-2.5 rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center gap-1.5"><img src={iconDelete} alt="Xóa" className="w-3.5 h-3.5 object-contain" style={{ filter: 'currentColor' }} /> Xóa</button>
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
            <span>Hiển thị <b>{currentItems.length}</b> / <b>{filtered.length}</b> voucher</span>
            {pageCount > 1 && (() => {
              const PaginateComp = ReactPaginate.default ? ReactPaginate.default : ReactPaginate;
              return <PaginateComp breakLabel="..." nextLabel="Sau >" onPageChange={handlePageClick} pageRangeDisplayed={3} pageCount={pageCount} previousLabel="< Trước" renderOnZeroPageCount={null} containerClassName="flex gap-1" pageLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100" previousLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" nextLinkClassName="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-medium" activeLinkClassName="bg-red-600 text-white border-red-600 hover:bg-red-700" disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent" />;
            })()}
          </div>
        )}
      </div>

      <VoucherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} voucher={editingVoucher} onSaveSuccess={fetchVouchers} />
    </AdminMasterLayout>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}><h2>Lỗi Component Voucher!</h2><pre>{this.state.error && this.state.error.toString()}</pre></div>;
    return this.props.children;
  }
}

export default function VoucherManagementWrapper(props) {
  return <ErrorBoundary><VoucherManagement {...props} /></ErrorBoundary>;
}
