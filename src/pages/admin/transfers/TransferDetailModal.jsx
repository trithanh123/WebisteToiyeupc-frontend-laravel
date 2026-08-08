import React, { useState, useEffect } from 'react';

const TransferDetailModal = ({ id, onClose, onUpdated }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [availableSerials, setAvailableSerials] = useState({});
  const [selectedSerials, setSelectedSerials] = useState({});

  const token = localStorage.getItem("admin_access_token");

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        const data = result.data;
        setTicket(data);
        if (data.trang_thai === 'Chờ duyệt') {
          const serialsMap = {};
          const selMap = {};
          for (let ct of data.chi_tiet) {
            const sRes = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers/serials?ma_sanpham=${ct.ma_sanpham}&ma_chinhanh=${data.ma_kho_xuat}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const sData = await sRes.json();
            serialsMap[ct.ma_sanpham] = sData.data || [];
            selMap[ct.id_chitiet] = [];
          }
          setAvailableSerials(serialsMap);
          setSelectedSerials(selMap);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSerial = (id_chitiet, id_serial, so_luong_can) => {
    const current = selectedSerials[id_chitiet] || [];
    if (current.includes(id_serial)) {
      setSelectedSerials({
        ...selectedSerials,
        [id_chitiet]: current.filter(id => id !== id_serial)
      });
    } else {
      if (current.length >= so_luong_can) {
        alert(`Bạn chỉ được chọn tối đa ${so_luong_can} mã serial cho sản phẩm này.`);
        return;
      }
      setSelectedSerials({
        ...selectedSerials,
        [id_chitiet]: [...current, id_serial]
      });
    }
  };

  const handleApprove = async () => {
    for (let ct of ticket.chi_tiet) {
      const sel = selectedSerials[ct.id_chitiet] || [];
      if (sel.length !== ct.so_luong) {
        return alert(`Sản phẩm "${ct.san_pham?.tensp}" yêu cầu chọn đúng ${ct.so_luong} serials (hiện tại đã chọn ${sel.length}).`);
      }
    }

    setProcessing(true);
    try {
      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serials: selectedSerials })
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        alert("Đã duyệt phiếu thành công. Hàng đang được vận chuyển.");
        onUpdated();
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối phiếu điều chuyển này?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && (result.status === 'success' || !result.status)) {
        alert("Đã từ chối phiếu thành công.");
        onUpdated();
      } else {
        alert("Lỗi: " + (result.message || 'Không thể từ chối phiếu'));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm("Xác nhận phiếu này đã đến nơi và nhập kho thành công?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`https://webistetoiyeupc-backend-laravel.onrender.com/api/admin/transfers/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        alert("Đã nhận hàng thành công. Tồn kho đã được cập nhật.");
        onUpdated();
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl">Đang tải chi tiết...</div>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Chi Tiết Phiếu #{ticket.id_phieu}</h2>
            <p className="text-xs text-slate-500 font-medium">Trạng thái: <span className="text-blue-600 uppercase">{ticket.trang_thai}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Kho Xuất (Nguồn)</div>
              <div className="font-semibold text-slate-800">{ticket.kho_xuat?.ten_chinhanh}</div>
              <div className="text-xs text-slate-500 mt-1">{ticket.kho_xuat?.diachi_chitiet}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Kho Nhập (Đích)</div>
              <div className="font-semibold text-slate-800">{ticket.kho_nhap?.ten_chinhanh}</div>
              <div className="text-xs text-slate-500 mt-1">{ticket.kho_nhap?.diachi_chitiet}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-sm text-slate-700">
              Danh sách Sản phẩm Điều chuyển
            </div>
            <div className="divide-y divide-slate-100">
              {ticket.chi_tiet?.map((ct) => (
                <div key={ct.id_chitiet} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-slate-800">{ct.san_pham?.tensp}</div>
                      <div className="text-xs text-slate-500">Mã SP: {ct.san_pham?.masp}</div>
                    </div>
                    <div className="font-bold text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded">x{ct.so_luong}</div>
                  </div>

                  {ticket.trang_thai === 'Chờ duyệt' && (
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-xs font-bold text-slate-700 mb-2">
                        CHỌN MÃ SERIAL ĐỂ XUẤT (Đã chọn {selectedSerials[ct.id_chitiet]?.length || 0}/{ct.so_luong})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSerials[ct.ma_sanpham]?.length > 0 ? (
                          availableSerials[ct.ma_sanpham].map(ser => {
                            const isSelected = selectedSerials[ct.id_chitiet]?.includes(ser.id_serial);
                            return (
                              <button
                                key={ser.id_serial}
                                onClick={() => handleToggleSerial(ct.id_chitiet, ser.id_serial, ct.so_luong)}
                                className={`text-xs px-2.5 py-1.5 rounded font-medium border transition-colors ${isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                                  }`}
                              >
                                {ser.serial_code}
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-sm text-red-500 font-medium">Kho này đã hết hàng hoặc không có serial!</div>
                        )}
                      </div>
                    </div>
                  )}

                  {ticket.trang_thai !== 'Chờ duyệt' && (
                    <div className="mt-2 text-xs">
                      <span className="font-bold text-slate-600 mr-2">Serials đã chuyển:</span>
                      {ct.serials?.length > 0 ? (
                        ct.serials.map(s => (
                          <span key={s.id_dieu_chuyen_serial} className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded mr-1 mb-1 font-mono">
                            {s.serial?.serial_code}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Không có dữ liệu</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold text-slate-600">Lý do:</span> {ticket.ly_do || "Không có"}</div>
            <div><span className="font-bold text-slate-600">Ghi chú:</span> {ticket.ghi_chu || "Không có"}</div>
            <div><span className="font-bold text-slate-600">Người tạo:</span> {ticket.nguoi_tao?.ten || `ID: ${ticket.nguoi_tao}`}</div>
            {ticket.nguoi_duyet && <div><span className="font-bold text-slate-600">Người duyệt:</span> {ticket.nguoi_duyet?.ten}</div>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Đóng</button>

          {ticket.trang_thai === 'Chờ duyệt' && (
            <>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                {processing ? "Đang xử lý..." : "Từ Chối Phiếu"}
              </button>
              
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                {processing ? "Đang xử lý..." : "Duyệt Phiếu & Xuất Kho"}
              </button>
            </>
          )}

          {ticket.trang_thai === 'Đang vận chuyển' && (
            <button
              onClick={handleComplete}
              disabled={processing}
              className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center gap-2"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              Xác Nhận Đã Nhận Hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferDetailModal;
