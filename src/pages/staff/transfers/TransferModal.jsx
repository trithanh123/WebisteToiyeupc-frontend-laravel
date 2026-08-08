import React, { useState, useEffect } from 'react';

const TransferModal = ({ myBranch, onClose, onSuccess }) => {
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  
  // 'nhap' = Mình xin hàng (Kho nhập là mình), 'xuat' = Mình gửi hàng (Kho xuất là mình)
  const [transferType, setTransferType] = useState('nhap'); 
  const [otherBranch, setOtherBranch] = useState('');
  
  const [form, setForm] = useState({
    ly_do: '',
    ghi_chu: ''
  });

  const [items, setItems] = useState([{ ma_sanpham: '', so_luong: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("staff_access_token");
      try {
        const [branchRes, prodRes] = await Promise.all([
          fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/branches', { headers: { 'Authorization': `Bearer ${token}` } }), // Assuming public or staff can read branches. If not, we might need a specific endpoint. Let's assume /api/branches exists and works or use /api/admin/branches if staff has access. Actually, let's use the standard branch endpoint.
          fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/products', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const branchData = await branchRes.json();
        const prodData = await prodRes.json();
        
        if (branchRes.ok) {
          // Filter out my own branch
          const otherBranches = (branchData.data || []).filter(b => b.id_chinhanh !== myBranch.id_chinhanh);
          setBranches(otherBranches);
        }
        if (prodRes.ok) {
          setProducts(prodData.data?.data || prodData.data || []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };
    fetchData();
  }, [myBranch]);

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
    if (!otherBranch) return alert("Vui lòng chọn chi nhánh đối tác");
    
    // Validate items
    const validItems = items.filter(i => i.ma_sanpham && i.so_luong > 0);
    if (validItems.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm hợp lệ");

    const payload = {
      ma_kho_xuat: transferType === 'xuat' ? myBranch.id_chinhanh : otherBranch,
      ma_kho_nhap: transferType === 'nhap' ? myBranch.id_chinhanh : otherBranch,
      ly_do: form.ly_do,
      ghi_chu: form.ghi_chu,
      chi_tiet: validItems
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("staff_access_token");
      const res = await fetch('https://webistetoiyeupc-backend-laravel.onrender.com/api/staff/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        alert("Tạo phiếu luân chuyển thành công!");
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
          <h2 className="text-lg font-bold text-slate-800">Tạo Yêu Cầu Luân Chuyển</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <label className="block text-xs font-semibold text-blue-800 uppercase mb-2">Loại Yêu Cầu</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="transferType" value="nhap" 
                         checked={transferType === 'nhap'} onChange={() => setTransferType('nhap')} />
                  <span className="text-sm font-medium">Mình cần XIN HÀNG từ chi nhánh khác</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="transferType" value="xuat" 
                         checked={transferType === 'xuat'} onChange={() => setTransferType('xuat')} />
                  <span className="text-sm font-medium">Mình muốn GỬI HÀNG đi chi nhánh khác</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  {transferType === 'nhap' ? 'Chi nhánh Nguồn (Nơi xuất)' : 'Chi nhánh của bạn (Nơi xuất)'}
                </label>
                {transferType === 'nhap' ? (
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    value={otherBranch} onChange={e => setOtherBranch(e.target.value)} required
                  >
                    <option value="">-- Chọn chi nhánh nguồn --</option>
                    {branches.map(b => <option key={b.id_chinhanh} value={b.id_chinhanh}>{b.ten_chinhanh}</option>)}
                  </select>
                ) : (
                  <div className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2.5 text-sm font-bold text-slate-700">
                    {myBranch?.ten_chinhanh}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  {transferType === 'nhap' ? 'Chi nhánh của bạn (Nơi nhập)' : 'Chi nhánh Đích (Nơi nhận)'}
                </label>
                {transferType === 'xuat' ? (
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    value={otherBranch} onChange={e => setOtherBranch(e.target.value)} required
                  >
                    <option value="">-- Chọn chi nhánh đích --</option>
                    {branches.map(b => <option key={b.id_chinhanh} value={b.id_chinhanh}>{b.ten_chinhanh}</option>)}
                  </select>
                ) : (
                  <div className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2.5 text-sm font-bold text-slate-700">
                    {myBranch?.ten_chinhanh}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lý do điều chuyển</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" 
                     value={form.ly_do} onChange={e => setForm({...form, ly_do: e.target.value})} placeholder="VD: Khách hàng cần gấp..." />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ghi chú thêm (Tùy chọn)</label>
              <textarea className="w-full border border-slate-200 rounded-lg p-2.5 text-sm min-h-[60px]" 
                     value={form.ghi_chu} onChange={e => setForm({...form, ghi_chu: e.target.value})} placeholder="Các ghi chú đặc biệt khác..." />
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
