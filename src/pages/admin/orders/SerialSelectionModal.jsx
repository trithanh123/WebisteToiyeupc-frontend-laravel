import React, { useState, useEffect } from 'react';

const SerialSelectionModal = ({ orderId, onClose, onSuccess }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");
    fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setData(res.data);
        } else {
          alert("Lỗi tải chi tiết đơn hàng");
          onClose();
        }
      })
      .catch(err => {
        console.error(err);
        onClose();
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSerialChange = (chitietId, index, serialId) => {
    setSelectedSerials(prev => {
      const arr = [...(prev[chitietId] || [])];
      arr[index] = serialId;
      return { ...prev, [chitietId]: arr };
    });
  };

  const handleSubmit = async () => {
    const items = data?.items || [];
    const serialsPayload = [];
    
    for (const item of items) {
      const selected = selectedSerials[item.id_chitietdh] || [];
      const validSelections = selected.filter(Boolean);
      if (validSelections.length < item.soluong) {
        alert(`Vui lòng chọn đủ ${item.soluong} Serial cho SP: ${item.tensp}`);
        return;
      }
      validSelections.forEach(sid => {
        serialsPayload.push({ id_chitietdh: item.id_chitietdh, id_serial: parseInt(sid) });
      });
    }

    if (!window.confirm(`Xác nhận xuất kho và giao đơn hàng #${orderId}?`)) return;
    setUpdating(true);
    
    try {
      const token = localStorage.getItem("admin_access_token");
      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trang_thai_dh: 'Đang giao',
          serials: serialsPayload
        })
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        alert("Đã cập nhật trạng thái Đang giao thành công!");
        onSuccess();
      } else {
        alert(resData.message || "Lỗi cập nhật");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi hệ thống");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return null;

  const items = data?.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">Chọn Serial xuất kho - Đơn #{orderId}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex gap-4 items-start mb-4">
                  {item.thumbail ? (
                    <img src={item.thumbail} alt="" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-md"></div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{item.tensp}</h4>
                    <p className="text-slate-500 text-xs mt-1">Số lượng: {item.soluong}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Vui lòng chọn {item.soluong} mã Serial:</p>
                  {Array.from({ length: item.soluong }).map((_, i) => (
                    <select
                      key={i}
                      value={(selectedSerials[item.id_chitietdh] || [])[i] || ""}
                      onChange={e => handleSerialChange(item.id_chitietdh, i, e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Chọn Serial {i + 1} --</option>
                      {(item.available_serials || []).map(ser => {
                        const isSelectedByOther = (selectedSerials[item.id_chitietdh] || []).some((sid, idx) => idx !== i && sid == ser.id_serial);
                        return (
                          <option key={ser.id_serial} value={ser.id_serial} disabled={isSelectedByOther}>
                            {ser.serial_code}
                          </option>
                        );
                      })}
                    </select>
                  ))}
                  {(!item.available_serials || item.available_serials.length < item.soluong) && (
                    <p className="text-red-500 text-sm font-medium">Kho hiện tại không đủ Serial để giao!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} disabled={updating} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            Hủy bỏ
          </button>
          <button onClick={handleSubmit} disabled={updating} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200">
            {updating ? 'Đang xử lý...' : 'Xác nhận Giao Hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SerialSelectionModal;
