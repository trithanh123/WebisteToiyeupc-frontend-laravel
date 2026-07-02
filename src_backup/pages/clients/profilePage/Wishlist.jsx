import React from 'react';
import ProfileLayout from './ProfileLayout';

const Wishlist = () => {
  // Demo: danh sách rỗng — sau này sẽ fetch từ API
  const items = [];

  return (
    <ProfileLayout>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Sản phẩm yêu thích</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg viewBox="0 0 100 80" className="w-24 h-24 mb-4" fill="none">
            <path d="M50 70 C50 70 10 45 10 25 C10 14 18.5 6 29 8 C36 9.5 43 15 50 22 C57 15 64 9.5 71 8 C81.5 6 90 14 90 25 C90 45 50 70 50 70Z"
              stroke="#d1d5db" strokeWidth="4" fill="#f3f4f6"/>
          </svg>
          <p className="text-base font-medium text-gray-400">Bạn chưa có sản phẩm yêu thích nào.</p>
          <a href="/" className="mt-3 text-sm text-blue-600 hover:underline">Khám phá sản phẩm →</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition cursor-pointer group">
              <div className="bg-gray-50 rounded-lg h-36 flex items-center justify-center mb-3 overflow-hidden">
                <img src={p.img} alt={p.name} className="h-32 object-contain group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</p>
              <p className="text-red-600 font-bold text-sm">{p.price}</p>
              <button className="mt-2 w-full text-xs border border-blue-500 text-blue-600 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};

export default Wishlist;
