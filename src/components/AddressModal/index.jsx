import React, { useState } from 'react';
import { PROVINCES } from '../../hooks/useAddressBook';

const AddressModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', province: '', district: '', ward: '', detail: '', isDefault: false
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.name || !form.phone || !form.province || !form.detail) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    onSave(form);
    setForm({ name: '', phone: '', email: '', province: '', district: '', ward: '', detail: '', isDefault: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col animate-fadeIn relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-[20px] font-bold text-gray-800 m-0">Thông tin người nhận hàng</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Họ tên</label>
              <input type="text" placeholder="Vui lòng nhập tên người nhận" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Số điện thoại</label>
              <input type="tel" placeholder="Nhập số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="Nhập email của bạn" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <h3 className="font-bold text-[16px] text-gray-800 mb-4 mt-6">Địa chỉ nhận hàng</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Tỉnh/Thành phố</label>
              <select value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500 bg-white">
                <option value="">Chọn</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Phường/Xã</label>
              <input type="text" placeholder="Chọn" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500 bg-gray-50" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Địa chỉ cụ thể</label>
            <input type="text" placeholder="Số nhà, ngõ, tên đường..." value={form.detail} onChange={e => setForm({...form, detail: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500" />
          </div>

          <div className="flex justify-end mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="w-4 h-4 accent-blue-600 rounded border-gray-300" />
              <span className="text-[14px] text-gray-700">Đặt làm mặc định</span>
            </label>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button 
            onClick={onClose}
            className="border border-blue-600 text-blue-600 font-medium px-6 py-2 rounded hover:bg-blue-50 transition-colors text-[14px]"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            className="bg-[#1435c3] text-white font-medium px-6 py-2 rounded hover:bg-[#0f2899] transition-colors text-[14px]"
          >
            Lưu địa chỉ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
