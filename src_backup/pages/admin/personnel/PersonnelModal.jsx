import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API = 'http://127.0.0.1:8000/api';

const PersonnelModal = ({ isOpen, onClose, personnel, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    Ten: '',
    email: '',
    SDT: '',
    matkhau: '',
    chucvu: '',
    Machinhanhi: '',
    existing_user_id: ''
  });
  
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch branches and users for dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const [resBranches, resUsers] = await Promise.all([
            axios.get(`${API}/admin/branches`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          
          if (resBranches.data.status === 'success') setBranches(resBranches.data.data);
          // Theo yêu cầu: Chỉ hiện những người dùng đã được đánh dấu là Nhân viên (Phanquyen = 2)
          if (resUsers.data.status === 'success') {
            const potentialEmployees = resUsers.data.data.filter(u => parseInt(u.Phanquyen) === 2);
            setUsers(potentialEmployees);
          }
        } catch (err) {
          console.error("Lỗi tải dữ liệu", err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (personnel) {
        setIsNewUser(true); // Edit thì luôn hiển thị form như bình thường
        const user = personnel.nguoi_dung || {};
        setFormData({
          Ten: user.Ten || '',
          email: user.email || '',
          SDT: user.SDT || '',
          matkhau: '', // Không nạp mật khẩu cũ
          chucvu: personnel.chucvu || '',
          Machinhanhi: personnel.Machinhanhi || '',
          existing_user_id: ''
        });
      } else {
        setFormData({
          Ten: '',
          email: '',
          SDT: '',
          matkhau: '',
          chucvu: '',
          Machinhanhi: '',
          existing_user_id: ''
        });
        setIsNewUser(true);
      }
    }
  }, [personnel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (personnel) {
        const payload = { ...formData };
        if (!payload.matkhau) delete payload.matkhau;
        delete payload.existing_user_id;

        const res = await axios.put(`${API}/admin/personnel/${personnel.id_nhanvien}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Cập nhật nhân viên thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          onSaveSuccess();
          onClose();
        }
      } else {
        const payload = { ...formData };
        if (!isNewUser) {
           delete payload.Ten;
           delete payload.email;
           delete payload.matkhau;
           delete payload.SDT;
        } else {
           delete payload.existing_user_id;
        }

        const res = await axios.post(`${API}/admin/personnel`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: res.data.message || 'Thêm nhân viên thành công!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {personnel ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Tài khoản Đăng nhập
              </h3>
              
              {!personnel && (
                <div className="flex bg-white rounded-lg border border-blue-200 p-1">
                  <button type="button" onClick={() => setIsNewUser(true)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${isNewUser ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}>
                    Tạo mới
                  </button>
                  <button type="button" onClick={() => setIsNewUser(false)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!isNewUser ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}>
                    Chọn có sẵn
                  </button>
                </div>
              )}
            </div>
            
            {(!personnel && !isNewUser) ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn tài khoản Khách hàng để nâng cấp <span className="text-red-500">*</span></label>
                <select required={!isNewUser} value={formData.existing_user_id} onChange={e => setFormData({ ...formData, existing_user_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">-- Chọn một tài khoản --</option>
                  {users.map(u => (
                    <option key={u.id_NguoiDung} value={u.id_NguoiDung}>{u.Ten} - {u.email}</option>
                  ))}
                </select>
                <p className="text-xs text-blue-600 mt-2">* Mật khẩu và thông tin cá nhân của người này sẽ được giữ nguyên.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                    <input type="text" required={isNewUser} value={formData.Ten} onChange={e => setFormData({ ...formData, Ten: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Nhập họ và tên..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" required={isNewUser} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="admin@toiyeupc.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu {personnel ? '(Bỏ trống nếu không đổi)' : <span className="text-red-500">*</span>}</label>
                    <input type="password" required={!personnel && isNewUser} value={formData.matkhau} onChange={e => setFormData({ ...formData, matkhau: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Ít nhất 6 ký tự..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input type="text" required={isNewUser} value={formData.SDT} onChange={e => setFormData({ ...formData, SDT: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="09..." />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Hồ sơ Chuyên môn
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chi nhánh trực thuộc <span className="text-red-500">*</span></label>
                <select required value={formData.Machinhanhi} onChange={e => setFormData({ ...formData, Machinhanhi: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="">-- Chọn Chi nhánh --</option>
                  {branches.map(b => (
                    <option key={b.iD_ChiNhanh} value={b.iD_ChiNhanh}>[{b.Ma_chi_nhanh}] {b.Ten_ChiNhanh}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chức vụ <span className="text-red-500">*</span></label>
                <select required value={formData.chucvu} onChange={e => setFormData({ ...formData, chucvu: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="">-- Chọn chức vụ --</option>
                  <option value="Quản lý">Quản lý Cửa hàng</option>
                  <option value="Nhân viên Bán hàng">Nhân viên Bán hàng</option>
                  <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                  <option value="Thu ngân">Thu ngân</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                personnel ? 'Lưu Cập Nhật' : 'Tạo Hồ Sơ Mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelModal;
