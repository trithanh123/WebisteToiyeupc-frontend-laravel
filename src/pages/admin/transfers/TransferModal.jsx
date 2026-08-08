import React, { useState, useEffect } from 'react';

const TransferModal = ({ onClose, onSuccess }) => {
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    ma_kho_xuat: '',
    ma_kho_nhap: '',
    ly_do: '',
    ghi_chu: ''
  });

  const [items, setItems] = useState([{ ma_sanpham: '', so_luong: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_access_token");
      try {
        const [branchRes, prodRes] = await Promise.all([
          fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/branches', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/products', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const branchData = await branchRes.json();
        const prodData = await prodRes.json();

        if (branchRes.ok) setBranches(branchData.data || []);
        if (prodRes.ok) {

          setProducts(prodData.data?.data || prodData.data || []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => setItems([...items, { ma_sanpham: '', so_luong: 1 }]);

  const handleRemoveItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const handleChangeItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ma_kho_xuat || !form.ma_kho_nhap) return alert("Vui lòng chọn đầy đủ Kho Xuất và Kho Nhập");
    if (form.ma_kho_xuat === form.ma_kho_nhap) return alert("Kho xuất và Kho nhập phải khác nhau");
    const validItems = items.filter(i => i.ma_sanpham && i.so_luong > 0);
    if (validItems.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm hợp lệ");

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_access_token");
      const res = await fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          chi_tiet: validItems
        })
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        alert("Tạo phiếu điều chuyển thành công!");
        onSuccess();
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Tạo Phiếu Điều Chuyển</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kho Xuất (Nguồn)</label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  value={form.ma_kho_xuat} onChange={e => setForm({ ...form, ma_kho_xuat: e.target.value })} required
                >
                  <option value="">-- Chọn kho xuất --</option>
                  {branches.map(b => <option key={b.id_chinhanh} value={b.id_chinhanh}>{b.ten_chinhanh}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Kho Nhập (Đích)</label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  value={form.ma_kho_nhap} onChange={e => setForm({ ...form, ma_kho_nhap: e.target.value })} required
                >
                  <option value="">-- Chọn kho nhập --</option>
                  {branches.map(b => <option key={b.id_chinhanh} value={b.id_chinhanh}>{b.ten_chinhanh}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lý do điều chuyển</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                value={form.ly_do} onChange={e => setForm({ ...form, ly_do: e.target.value })} placeholder="VD: Khách hàng cần gấp..." />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ghi chú thêm (Tùy chọn)</label>
              <textarea className="w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-[60px]"
                value={form.ghi_chu} onChange={e => setForm({ ...form, ghi_chu: e.target.value })} placeholder="Các ghi chú đặc biệt khác..." />
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Danh sách Sản Phẩm</label>
                <button type="button" onClick={handleAddItem} className="text-xs text-blue-600 font-bold hover:underline">+ Thêm sản phẩm</button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                    <select
                      className="flex-1 border border-slate-200 rounded p-2 text-sm"
                      value={item.ma_sanpham} onChange={e => handleChangeItem(idx, 'ma_sanpham', e.target.value)} required
                    >
                      <option value="">-- Chọn SP --</option>
                      {products.map(p => <option key={p.id_sanpham} value={p.id_sanpham}>{p.tensp} ({p.masp})</option>)}
                    </select>
                    <input
                      type="number" min="1" className="w-20 border border-slate-200 rounded p-2 text-sm text-center"
                      value={item.so_luong} onChange={e => handleChangeItem(idx, 'so_luong', parseInt(e.target.value) || 1)} required
                    />
                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 font-bold px-2 hover:bg-red-50 rounded">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Hủy bỏ</button>
          <button type="submit" form="transfer-form" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
            {loading ? "Đang xử lý..." : "Tạo phiếu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
