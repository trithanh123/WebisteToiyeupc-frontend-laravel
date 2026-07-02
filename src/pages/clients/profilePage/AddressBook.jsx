import React, { useState } from 'react';
import ProfileLayout from './ProfileLayout';
import { useAddressBook, PROVINCES } from '../../../hooks/useAddressBook';

const AddressBook = () => {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressBook();
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name:'', phone:'', province:'', district:'', ward:'', detail:'', isDefault: false
  });

  const handleSave = () => {
    if (!form.name || !form.phone || !form.province) return;
    if (editingId) {
      updateAddress(editingId, form);
    } else {
      addAddress(form);
    }
    setForm({ name:'', phone:'', province:'', district:'', ward:'', detail:'', isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr) => {
    setForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province || '',
      district: addr.district || '',
      ward: addr.ward || '',
      detail: addr.detail || '',
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm({ name:'', phone:'', province:'', district:'', ward:'', detail:'', isDefault: false });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name:'', phone:'', province:'', district:'', ward:'', detail:'', isDefault: false });
    setShowForm(false);
  };

  const handleDelete = (id) => deleteAddress(id);

  const handleSetDefault = (id) => setDefaultAddress(id);

  return (
    <ProfileLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Sổ địa chỉ</h2>
        <button onClick={handleAddNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          + Thêm địa chỉ mới
        </button>
      </div>

      {/* Form thêm địa chỉ */}
      {showForm && (
        <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">{editingId ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input type="text" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố *</label>
              <select value={form.province}
                onChange={e => setForm({...form, province: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                <option value="">Chọn tỉnh / thành</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
              <input type="text" value={form.district}
                onChange={e => setForm({...form, district: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
              <input type="text" value={form.ward}
                onChange={e => setForm({...form, ward: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể (số nhà, tên đường...)</label>
              <input type="text" value={form.detail}
                onChange={e => setForm({...form, detail: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
                <input type="checkbox" checked={form.isDefault}
                  onChange={e => setForm({...form, isDefault: e.target.checked})}
                  className="w-4 h-4 accent-blue-600 rounded" />
                Đặt làm địa chỉ mặc định
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors">
              Lưu địa chỉ
            </button>
            <button onClick={handleCancel}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2 rounded-lg text-sm transition-colors">
              Hủy
            </button>
          </div>
        </div>
      )}

      {}
      {addresses.length === 0 && !showForm ? (
        <div>
          <button onClick={handleAddNew}
            className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl py-5 text-sm text-gray-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-all mb-4">
            <span className="text-xl">+</span> Thêm địa chỉ nhận hàng
          </button>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-gray-500">
            Bạn chưa có địa chỉ nhận hàng mặc định. Vui lòng thêm địa chỉ mới.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map(addr => (
            <div key={addr.id}
              className={`border rounded-xl p-5 relative transition-all ${addr.isDefault ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{addr.name}</span>
                    <span className="text-gray-400 text-sm">|</span>
                    <span className="text-gray-600 text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Mặc định</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {[addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-blue-600 hover:underline">
                      Đặt mặc định
                    </button>
                  )}
                  <button onClick={() => handleEdit(addr)} className="text-xs text-gray-500 hover:text-blue-600">Sửa</button>
                  <button onClick={() => handleDelete(addr.id)}
                    className="text-xs text-red-500 hover:text-red-700">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};

export default AddressBook;
