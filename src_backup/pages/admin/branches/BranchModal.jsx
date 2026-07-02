import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API = 'http://127.0.0.1:8000/api';

const BranchModal = ({ isOpen, onClose, branch, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    Ten_ChiNhanh: '',
    Ma_chi_nhanh: '',
    SDT_Chi_nhanh: '',
    email_chi_nhanh: '',
    diachi_chitiet: '',
    map_link: '',
    Maso_phuong: '',
    Maso_TP: '',
    Maso_TInh: '',
  });
  const [loading, setLoading] = useState(false);

  // Cascading Dropdown States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch Danh sách Tỉnh/Thành phố khi component mount
  useEffect(() => {
    axios.get('https://provinces.open-api.vn/api/p/')
      .then(res => setProvinces(res.data))
      .catch(err => console.error("Lỗi tải Tỉnh:", err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (branch) {
        setFormData({
          Ten_ChiNhanh: branch.Ten_ChiNhanh || '',
          Ma_chi_nhanh: branch.Ma_chi_nhanh || '',
          SDT_Chi_nhanh: branch.SDT_Chi_nhanh || '',
          email_chi_nhanh: branch.email_chi_nhanh || '',
          diachi_chitiet: branch.diachi_chitiet || '',
          map_link: branch.map_link || '',
          Maso_phuong: branch.Maso_phuong || '',
          Maso_TP: branch.Maso_TP || '',
          Maso_TInh: branch.Maso_TInh || '',
        });

        // Tải Quận/Huyện dựa trên Tỉnh hiện tại
        if (branch.Maso_TInh) {
          axios.get(`https://provinces.open-api.vn/api/p/${branch.Maso_TInh}?depth=2`)
            .then(res => setDistricts(res.data.districts || []))
            .catch(err => console.error(err));
        } else {
          setDistricts([]);
        }

        // Tải Phường/Xã dựa trên Quận hiện tại
        if (branch.Maso_TP) {
          axios.get(`https://provinces.open-api.vn/api/d/${branch.Maso_TP}?depth=2`)
            .then(res => setWards(res.data.wards || []))
            .catch(err => console.error(err));
        } else {
          setWards([]);
        }
      } else {
        setFormData({
          Ten_ChiNhanh: '',
          Ma_chi_nhanh: '',
          SDT_Chi_nhanh: '',
          email_chi_nhanh: '',
          diachi_chitiet: '',
          map_link: '',
          Maso_phuong: '',
          Maso_TP: '',
          Maso_TInh: '',
        });
        setDistricts([]);
        setWards([]);
      }
    }
  }, [branch, isOpen]);

  // Xử lý khi Tỉnh/Thành thay đổi
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    setFormData({ ...formData, Maso_TInh: provinceCode, Maso_TP: '', Maso_phuong: '' });
    setWards([]); // Xóa danh sách phường
    if (provinceCode) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        setDistricts(res.data.districts || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setDistricts([]);
    }
  };

  // Xử lý khi Quận/Huyện thay đổi
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    setFormData({ ...formData, Maso_TP: districtCode, Maso_phuong: '' });
    if (districtCode) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        setWards(res.data.wards || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setWards([]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        Maso_phuong: formData.Maso_phuong || null,
        Maso_TP: formData.Maso_TP || null,
        Maso_TInh: formData.Maso_TInh || null,
      };

      if (branch) {
        const res = await axios.put(`${API}/admin/branches/${branch.iD_ChiNhanh}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật chi nhánh thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          onSaveSuccess();
          onClose();
        }
      } else {
        const res = await axios.post(`${API}/admin/branches`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Thêm chi nhánh thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          onSaveSuccess();
          onClose();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại!';
      let detailedErrors = '';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        detailedErrors = errors[firstErrorKey][0];
      }
      Swal.fire({ icon: 'error', title: 'Lỗi!', text: detailedErrors || msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {branch ? 'Cập nhật Chi nhánh' : 'Thêm Chi nhánh Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Cột trái: Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2 text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Thông tin cơ bản
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mã Chi Nhánh <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.Ma_chi_nhanh} onChange={e => setFormData({ ...formData, Ma_chi_nhanh: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase font-mono"
                  placeholder="TYPC-05" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên Chi Nhánh <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.Ten_ChiNhanh} onChange={e => setFormData({ ...formData, Ten_ChiNhanh: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="VD: ToiYêuPc Bình Dương..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={formData.SDT_Chi_nhanh} onChange={e => setFormData({ ...formData, SDT_Chi_nhanh: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="09xx..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" required value={formData.email_chi_nhanh} onChange={e => setFormData({ ...formData, email_chi_nhanh: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="admin@toiyeupc.com" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Link Google Maps
                </label>
                <input type="text" value={formData.map_link} onChange={e => setFormData({ ...formData, map_link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="https://maps.google.com/..." />
              </div>
            </div>

            {/* Cột phải: Địa chỉ (Cascading Dropdown) */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2 text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">2</span>
                Địa chỉ chi tiết
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select value={formData.Maso_TInh} onChange={handleProvinceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer bg-white">
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quận/Huyện</label>
                <select value={formData.Maso_TP} onChange={handleDistrictChange} disabled={!formData.Maso_TInh}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phường/Xã</label>
                <select value={formData.Maso_phuong} onChange={(e) => setFormData({ ...formData, Maso_phuong: e.target.value })} disabled={!formData.Maso_TP}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Địa chỉ số nhà, đường <span className="text-red-500">*</span>
                </label>
                <textarea required value={formData.diachi_chitiet} onChange={e => setFormData({ ...formData, diachi_chitiet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                  placeholder="VD: 882 Lê Hồng Phong..." />
              </div>
            </div>

          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-gray-50">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                branch ? 'Lưu Cập Nhật' : 'Thêm Chi Nhánh'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchModal;
