import React from 'react';

const TopProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex items-center justify-center text-slate-400">
        <p>Chưa có dữ liệu sản phẩm bán chạy.</p>
      </div>
    );
  }

  const maxSold = Math.max(...products.map(p => parseInt(p.total_sold) || 0));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Top 5 Sản phẩm Bán chạy
      </h2>

      <div className="flex-1 flex flex-col justify-between gap-4">
        {products.map((product, index) => {
          const sold = parseInt(product.total_sold) || 0;
          const percentage = maxSold > 0 ? (sold / maxSold) * 100 : 0;

          return (
            <div key={product.id_sanpham} className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-slate-700 line-clamp-1 pr-4" title={product.tensp}>
                  {index + 1}. {product.tensp}
                </span>
                <span className="font-black text-indigo-600 whitespace-nowrap">{sold} đã bán</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:from-indigo-600 group-hover:to-blue-600"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProducts;
