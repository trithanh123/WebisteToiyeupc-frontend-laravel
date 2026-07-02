import React from 'react';

const LowStock = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col items-center justify-center text-green-500">
        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-bold text-center">Mọi thứ đều ổn!</p>
        <p className="text-sm text-slate-400 mt-1">Không có sản phẩm nào sắp hết hàng.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
        <h2 className="text-base font-bold text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Sắp hết hàng ({items.length})
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-bold text-slate-700 line-clamp-1" title={item.tensp}>{item.tensp}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.ten_chinhanh}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-black text-red-600 leading-none">{item.soluongtonkho}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Định mức: {item.soluongkhothap}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LowStock;
