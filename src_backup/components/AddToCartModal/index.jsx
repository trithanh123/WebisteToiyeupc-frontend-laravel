import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTERS } from '../../utils/route';
import { formatCurrency } from '../../utils/formatter';
import { getImageUrl } from '../../utils/getImageUrl';

const AddToCartModal = ({ isOpen, onClose, product, quantity = 1, vouchers = [] }) => {
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const price = product.price || product.Gia || 0;
  const name = product.name || product.TenSP;
  const img = product.img || product.Thumbail;
  const total = price * quantity;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[450px] max-w-[90vw] overflow-hidden flex flex-col animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex gap-4 mb-4">
            <div className="w-[80px] h-[80px] flex-shrink-0 border border-gray-200 rounded-md p-1 bg-white">
              <img src={getImageUrl(img)} alt={name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-medium text-gray-800 m-0 mb-1 leading-snug line-clamp-2">
                {name}
              </h3>
              <p className="text-gray-500 text-[13px] m-0 mb-1">
                Số lượng: {quantity}
              </p>
              <p className="text-[#111] font-bold text-[15px] m-0">
                {formatCurrency(price)}
              </p>
            </div>
          </div>

          {vouchers && vouchers.length > 0 && (
            <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
              {vouchers.map((v, i) => (
                <div key={i} className="flex gap-2 items-start mb-3 last:mb-0">
                  <div className="text-red-500 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 12 20 22 4 22 4 12"></polyline>
                      <rect x="2" y="7" width="20" height="5"></rect>
                      <line x1="12" y1="22" x2="12" y2="7"></line>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-700 m-0 leading-snug">
                    <span className="font-semibold">{v.quantity || 1}x</span> {v.name || v.TenVoucher || v.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-5 border-t border-gray-100 border-dashed">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-gray-600">Tổng tiền ({quantity}) sản phẩm</span>
            <span className="text-[18px] font-bold text-[#111]">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={() => {
              onClose();
              navigate(ROUTERS.CLIENT.CART);
            }}
            className="w-full bg-[#1435c3] hover:bg-[#0f2899] text-white font-medium py-3 rounded-lg transition-colors border-none cursor-pointer"
          >
            Xem giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
