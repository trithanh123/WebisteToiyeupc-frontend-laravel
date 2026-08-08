import React from 'react';
import ProfileLayout from './ProfileLayout';
import useWishlist from '../../../hooks/useWishlist';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const navigate = useNavigate();

  return (
    <ProfileLayout>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Sản phẩm yêu thích</h2>

      {loading ? (
        <div className="flex justify-center py-10"><p>Đang tải...</p></div>
      ) : wishlist.length === 0 ? (
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
          {wishlist.map(p => (
            <div key={p.id_sanpham} 
                 onClick={() => navigate(`/san-pham/${p.id_sanpham}`)}
                 className="border relative border-gray-100 rounded-xl p-3 hover:shadow-md transition cursor-pointer group">
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id_sanpham); }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow-sm hover:scale-110 transition z-10">
                <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              <div className="bg-gray-50 rounded-lg h-36 flex items-center justify-center mb-3 overflow-hidden">
                <img src={`https://webistetoiyeupc-backend-laravel.onrender.com/storage/${p.thumbail}`} alt={p.tensp} className="h-32 object-contain group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{p.tensp}</p>
              <p className="text-red-600 font-bold text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.gia || 0)}</p>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};

export default Wishlist;
