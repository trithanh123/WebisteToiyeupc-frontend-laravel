import React, { useState, useEffect } from 'react';

const EditStockModal = ({ isOpen, onClose, tonKho, onSuccess }) => {
  const [formData, setFormData] = useState({
    Soluongtonkho: 0,
    Soluongkhothap: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && tonKho) {
      setFormData({
        Soluongtonkho: tonKho.soluongtonkho || 0,
        Soluongkhothap: tonKho.soluongkhothap || 0
      });
      setError(null);
    }
  }, [isOpen, tonKho]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
      const response = await fetch(`http://127.0.0.1:8000/api/admin/warehouse/${tonKho.id_khoton}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        onSuccess(result.data); 
        onClose();
      } else {
        setError(result.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800">Sửa Tồn Kho</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {tonKho?.san_pham && (
            <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1">SẢN PHẨM</p>
              <p className="text-sm font-bold text-slate-800">{tonKho.san_pham.tensp}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng tồn kho (Thực tế)</label>
              <input 
                type="number" 
                name="Soluongtonkho"
                min="0"
                value={formData.soluongtonkho}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-semibold"
              />
              <p className="text-xs text-slate-500 mt-1">Lưu ý: Thường hệ thống tự tính dựa vào Phiếu Nhập và Đơn Hàng. Chỉ nên sửa khi cần đồng bộ.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Định mức cảnh báo (Sắp hết hàng)</label>
              <input 
                type="number" 
                name="Soluongkhothap"
                min="0"
                value={formData.soluongkhothap}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-semibold"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 flex items-center transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditStockModal;
