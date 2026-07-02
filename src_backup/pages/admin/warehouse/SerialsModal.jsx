import React, { useState, useEffect } from 'react';

const SerialsModal = ({ isOpen, onClose, tonKho }) => {
  const [serials, setSerials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && tonKho) {
      const fetchSerials = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(`http://127.0.0.1:8000/api/admin/warehouse/${tonKho.ID_Khoton}/serials`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();
          if (response.ok && result.status === 'success') {
            setSerials(result.data || []);
          } else {
            setError(result.message || 'Lỗi lấy dữ liệu Serial');
          }
        } catch (err) {
          setError('Không thể kết nối đến máy chủ.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchSerials();
    }
  }, [isOpen, tonKho]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Chi tiết Số Serial
            </h2>
            {tonKho?.san_pham && (
              <p className="text-slate-500 text-sm mt-1">
                Sản phẩm: <span className="font-medium text-slate-700">{tonKho.san_pham.TenSP}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
              {error}
            </div>
          ) : serials.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <p>Không có mã Serial nào được tìm thấy trong lô hàng này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serials.map((s, idx) => (
                <div key={s.ID_Serial} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-medium flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-slate-700 font-bold">{s.serial_code}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.tinhtrang === 'Trong kho' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {s.tinhtrang}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SerialsModal;
