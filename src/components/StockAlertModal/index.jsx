import React from 'react';

const StockAlertModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[450px] max-w-[95vw] overflow-hidden flex flex-col animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-[18px] font-bold text-red-700 m-0">Thông báo tồn kho</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-5 bg-white">
          <p className="text-gray-700 font-medium mb-4 text-[15px]">
            Sản phẩm này chỉ còn <strong className="text-red-600">{data.stock} cái</strong> trong kho tại chi nhánh hiện tại.
          </p>
          
          {data.otherBranches && data.otherBranches.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-bold text-[14px] text-blue-800 mb-2 flex items-center gap-2">
                <span>💡</span> Gợi ý: Các chi nhánh khác vẫn còn hàng:
              </h3>
              <ul className="space-y-1.5 ml-1 mt-3">
                {data.otherBranches.map((b, idx) => (
                  <li key={idx} className="flex justify-between items-center text-[14px] border-b border-dashed border-blue-100 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-gray-700 font-medium">{b.ten_chinhanh}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[12px] font-bold">{b.stock} cái</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-sm"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlertModal;
