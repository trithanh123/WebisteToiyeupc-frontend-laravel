import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImportModal = ({ isOpen, onClose }) => {

  const [formData, setFormData] = useState({
    nha_cung_cap: '',
    ngay_nhap: new Date().toISOString().split('T')[0],
    ma_chi_nhanh: '',
  });

  // Trạng thái danh sách sản phẩm được chọn để nhập hàng
  const [importItems, setImportItems] = useState([
    { id: Date.now(), ma_san_pham: '', ten_san_pham: '', serialsText: '', soluongtonkho: 0, soluongkhothap: 5 }
  ]);

  // Trạng thái loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dữ liệu động từ API
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          const [branchRes, productRes] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/admin/branches', { headers }),
            axios.get('http://127.0.0.1:8000/api/admin/products', { headers })
          ]);

          if (branchRes.data?.status === 'success' || branchRes.data?.data) {
            setBranches(branchRes.data.data || []);
          }
          if (productRes.data?.status === 'success' || productRes.data?.data) {
            setProducts(productRes.data.data?.data || productRes.data.data || []);
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setImportItems(prev => [
      ...prev,
      { id: Date.now(), ma_san_pham: '', ten_san_pham: '', serialsText: '', soluongtonkho: 0, soluongkhothap: 5 }
    ]);
  };

  // Xóa một dòng sản phẩm
  const handleRemoveItem = (id) => {
    setImportItems(prev => prev.filter(item => item.id !== id));
  };

  // Xử lý thay đổi cho từng dòng sản phẩm
  const handleItemChange = (id, field, value) => {
    setImportItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Đếm số lượng serial hợp lệ từ textarea
  const countSerials = (text) => {
    if (!text) return 0;
    return text.split('\n').filter(line => line.trim() !== '').length;
  };

  // Xử lý submit gửi API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Lọc và chuẩn hóa dữ liệu Serial từ textarea
      const san_phams = importItems.map(item => {
        // Tách chuỗi theo dấu xuống dòng, xóa khoảng trắng thừa ở hai đầu và loại bỏ các dòng rỗng
        const serialArray = item.serialsText
          .split('\n')
          .map(s => s.trim())
          .filter(s => s !== '');

        return {
          ma_san_pham: parseInt(item.ma_san_pham),
          serials: serialArray,
          soluongtonkho: parseInt(item.soluongtonkho) || serialArray.length,
          soluongkhothap: parseInt(item.soluongkhothap) || 5
        };
      }).filter(item => (item.serials.length > 0 || item.soluongtonkho > 0) && !isNaN(item.ma_san_pham)); // Lấy item có mã SP và (có serial hoặc có nhập số lượng)

      if (san_phams.length === 0) {
        alert("Vui lòng chọn sản phẩm và nhập số lượng hoặc Serial hợp lệ!");
        setIsSubmitting(false);
        return;
      }

      // 2. Tạo payload theo đúng format API Laravel mong đợi
      const payload = {
        nha_cung_cap: formData.nha_cung_cap,
        ngay_nhap: formData.ngay_nhap,
        ma_chi_nhanh: parseInt(formData.ma_chi_nhanh),
        san_phams: san_phams
      };

      console.log('📦 Dữ liệu gửi lên API:', payload);

      // 3. Gọi API thật
      const response = await fetch('http://127.0.0.1:8000/api/admin/warehouse/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token") || localStorage.getItem("admin_access_token")}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if(response.ok && result.status === 'success') {
         alert("Lưu phiếu nhập thành công!");
         onClose();

         window.location.reload();
      } else {
         alert(result.message || "Lỗi lưu phiếu nhập");
         console.error(result.error);
      }

    } catch (error) {
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Tạo Phiếu Nhập Kho Mới
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {}
        <form id="import-form" onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Thông tin Phiếu Nhập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                <input type="text" name="nha_cung_cap" required value={formData.nha_cung_cap} onChange={handleFormChange} placeholder="Vd: Asus Việt Nam" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày nhập <span className="text-red-500">*</span></label>
                <input type="date" name="ngay_nhap" required value={formData.ngay_nhap} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chi nhánh nhận <span className="text-red-500">*</span></label>
                <select name="ma_chi_nhanh" required value={formData.ma_chi_nhanh} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map(b => (
                    <option key={b.iD_ChiNhanh} value={b.iD_ChiNhanh}>
                      {b.Ten_ChiNhanh}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. DANH SÁCH SẢN PHẨM & SERIAL */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                Chi tiết hàng hóa (Quét Mã Vạch)
              </h3>
              <button type="button" onClick={handleAddItem} className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Thêm sản phẩm khác
              </button>
            </div>

            <div className="space-y-4">
              {importItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-white border border-emerald-100/60 rounded-xl relative">

                  {}
                  {importItems.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa sản phẩm này">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">

                    {}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Sản phẩm #{index + 1} <span className="text-red-500">*</span>
                        </label>
                        <select 
                          required
                          value={item.ma_san_pham} 
                          onChange={(e) => handleItemChange(item.id, 'ma_san_pham', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                          <option value="">-- Chọn sản phẩm từ danh mục --</option>
                          {products.map(p => (
                            <option key={p.id_sanpham} value={p.id_sanpham}>
                              {p.tensp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-emerald-50/30 border border-emerald-100 p-3 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-emerald-800">SL quét được từ Serial:</span>
                          <span className="text-xl font-black text-emerald-600">
                            {countSerials(item.serialsText)}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Số lượng nhập kho thực tế <span className="text-red-500">*</span></label>
                          <input 
                            type="number" min="0" required
                            value={item.soluongtonkho} 
                            onChange={(e) => handleItemChange(item.id, 'soluongtonkho', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Định mức cảnh báo (Sắp hết)</label>
                          <input 
                            type="number" min="0" required
                            value={item.soluongkhothap} 
                            onChange={(e) => handleItemChange(item.id, 'soluongkhothap', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="lg:col-span-7">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          Danh sách Serial (Sử dụng máy quét)
                        </label>
                        <span className="text-xs text-gray-500">Mỗi dòng 1 mã</span>
                      </div>
                      <textarea 
                        rows="8"
                        placeholder={`VD:\nSN2026A0001\nSN2026A0002...`}
                        value={item.serialsText}
                        onChange={(e) => handleItemChange(item.id, 'serialsText', e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-mono text-sm leading-relaxed tracking-wide shadow-inner resize-y transition-shadow"
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="pt-2 flex gap-3 border-t border-gray-100 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              form="import-form"
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : 'Lưu Phiếu Nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
