import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../context/CartContext';
import { formatCurrency } from '../../../utils/formatter';
import { ROUTERS } from '../../../utils/route';
import { getImageUrl } from '../../../utils/getImageUrl';
import MasterLayout from '../theme/masterLayout';
import VoucherModal from '../../../components/VoucherModal';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // State to manage selected items for checkout
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Voucher state
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [orderVoucher, setOrderVoucher] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.id || item.ID_SanPham));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    // Proceed to checkout page, passing selected items in state or Context
    navigate(ROUTERS.CLIENT.CHECKOUT, { state: { selectedItems, orderVoucher } });
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id || item.ID_SanPham))
      .reduce((total, item) => total + (item.price || item.Gia || 0) * item.quantity, 0);
  };

  const calculateDiscount = (subtotal) => {
    if (!orderVoucher) return 0;
    if (orderVoucher.Loai_giamgia === 'Phần trăm') {
      let discount = subtotal * (orderVoucher.gia_trigiam / 100);
      if (orderVoucher.giam_toida) {
        discount = Math.min(discount, orderVoucher.giam_toida);
      }
      return discount;
    }
    return orderVoucher.gia_trigiam;
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  const total = subtotal - discount;

  // Watch for invalid vouchers if subtotal drops below min order
  useEffect(() => {
    if (orderVoucher && subtotal < orderVoucher.don_toithieu) {
      setOrderVoucher(null); // Auto-remove invalid voucher
    }
  }, [subtotal, orderVoucher]);

  return (
    <MasterLayout>
      <div className="bg-[#f8f9fa] min-h-screen py-6">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-[13px] text-gray-500 mb-4 flex items-center gap-2">
            <Link to={ROUTERS.CLIENT.HOME} className="text-blue-600 hover:underline">Trang chủ</Link>
            <span>›</span>
            <span>Giỏ hàng</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[20px] font-bold text-gray-800 m-0">Giỏ hàng ({cartItems.length})</h1>
            {cartItems.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-blue-500 text-[13px] hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-sm">
              <div className="w-40 h-40 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 01-8 0"></path>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Giỏ hàng của bạn đang trống</h2>
              <Link 
                to={ROUTERS.CLIENT.HOME}
                className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* Left Column - Product List */}
              <div className="w-full lg:w-[70%]">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-[auto_1fr_120px_140px_140px] gap-4 p-4 items-center text-[13px] text-gray-600 border-b border-gray-100">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                    <div className="font-semibold text-gray-800 uppercase tracking-wide">Danh sách sản phẩm</div>
                    <div className="text-center font-medium">Đơn giá</div>
                    <div className="text-center font-medium">Số lượng</div>
                    <div className="text-right font-medium">Thành tiền</div>
                  </div>

                  {/* Product Items */}
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => {
                      const id = item.id || item.ID_SanPham;
                      const name = item.name || item.TenSP;
                      const price = item.price || item.Gia || 0;
                      const img = item.img || item.Thumbail;
                      const selectedVoucher = item.selectedVoucher;

                      return (
                        <div key={id} className="p-4 md:p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_120px_140px_140px] gap-4 items-start md:items-center">
                            
                            {/* Checkbox */}
                            <div className="pt-2 md:pt-0 flex justify-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                                checked={selectedItems.includes(id)}
                                onChange={(e) => handleSelectItem(id, e.target.checked)}
                              />
                            </div>

                            {/* Info */}
                            <div className="flex gap-4">
                              <Link to={`${ROUTERS.CLIENT.PRODUCTS}/${id}`} className="w-[80px] h-[80px] border border-gray-200 rounded p-1 bg-white flex-shrink-0">
                                <img src={getImageUrl(img)} alt={name} className="w-full h-full object-contain" />
                              </Link>
                              <div className="flex flex-col">
                                <Link to={`${ROUTERS.CLIENT.PRODUCTS}/${id}`} className="text-[14px] text-gray-800 font-medium hover:text-blue-600 mb-1 leading-snug line-clamp-2">
                                  {name}
                                </Link>
                                <span className="text-[12px] text-gray-500 mb-1">SKU: {item.MaSP || id}</span>
                                
                                {/* Mobile Price/Qty view */}
                                <div className="md:hidden mt-2 flex flex-col gap-2">
                                  <span className="font-bold text-red-600">{formatCurrency(price)}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="flex border border-gray-300 rounded overflow-hidden w-fit">
                                      <button onClick={() => updateQuantity(id, -1)} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border-r border-gray-300">-</button>
                                      <div className="w-10 text-center py-1 text-[13px] font-medium">{item.quantity}</div>
                                      <button onClick={() => updateQuantity(id, 1)} className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border-l border-gray-300">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(id)} className="text-blue-500 text-[13px] bg-transparent border-none">Xóa</button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Desktop Price */}
                            <div className="hidden md:block text-center font-bold text-[14px] text-[#111]">
                              {formatCurrency(price)}
                            </div>

                            {/* Desktop Qty */}
                            <div className="hidden md:flex flex-col items-center gap-2">
                              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                                <button onClick={() => updateQuantity(id, -1)} className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 border-r border-gray-200 transition-colors">-</button>
                                <div className="w-12 text-center py-1.5 text-[14px] font-medium">{item.quantity}</div>
                                <button onClick={() => updateQuantity(id, 1)} className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 border-l border-gray-200 transition-colors">+</button>
                              </div>
                              <button onClick={() => removeFromCart(id)} className="text-blue-500 text-[12px] hover:underline bg-transparent border-none cursor-pointer">Xóa</button>
                            </div>

                            {/* Desktop Total */}
                            <div className="hidden md:block text-right font-bold text-[15px] text-red-600">
                              {formatCurrency(price * item.quantity)}
                            </div>
                          </div>

                          {/* Vouchers/Promotions inside row */}
                          {selectedVoucher && (
                            <div className="mt-4 ml-8 md:ml-[140px] p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex gap-2 items-start">
                                <div className="text-red-500 mt-0.5 shrink-0">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 12 20 22 4 22 4 12"></polyline>
                                    <rect x="2" y="7" width="20" height="5"></rect>
                                    <line x1="12" y1="22" x2="12" y2="7"></line>
                                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                                  </svg>
                                </div>
                                <p className="text-[12.5px] text-gray-700 m-0 leading-relaxed">
                                  <span className="font-semibold">{selectedVoucher.quantity || 1}x</span> {selectedVoucher.Tenkhuyenmai ? <span className="font-medium text-blue-700">{selectedVoucher.Tenkhuyenmai}</span> : ''} {selectedVoucher.Tenkhuyenmai ? '-' : ''} Mã giảm thêm {selectedVoucher.Loai_giamgia === 'Phần trăm' ? `${selectedVoucher.gia_trigiam}%` : formatCurrency(selectedVoucher.gia_trigiam)} ({selectedVoucher.Ma_voucher})
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary & Checkout */}
              <div className="w-full lg:w-[30%] space-y-4">
                {/* Vouchers Panel */}
                <div 
                  className={`bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer transition-colors group ${orderVoucher ? 'border-blue-500 bg-blue-50/10' : 'border-gray-100 hover:border-blue-300'}`}
                  onClick={() => setIsVoucherModalOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                      </svg>
                    </div>
                    <div>
                      {orderVoucher ? (
                        <div>
                          <p className="font-semibold text-gray-800 text-[13px] m-0 mb-1">
                            {orderVoucher.Tenkhuyenmai ? <span className="block text-blue-700 text-[12.5px] font-medium mb-0.5">{orderVoucher.Tenkhuyenmai}</span> : null}
                            Đã áp dụng: <span className="text-blue-600 uppercase">{orderVoucher.Ma_voucher}</span>
                          </p>
                          <p className="text-[12px] text-gray-500 m-0">Giảm {formatCurrency(discount)}</p>
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-800 text-[14px] m-0">Khuyến mãi</p>
                      )}
                    </div>
                  </div>
                  <span className="text-blue-600 text-[13px] font-medium group-hover:underline ml-2 text-right">
                    {orderVoucher ? 'Đổi mã' : 'Chọn hoặc nhập mã'}
                  </span>
                </div>

                {/* Total Panel */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-[16px] mb-4 pb-3 border-b border-gray-100 m-0">Thanh toán</h3>
                  
                  <div className="flex justify-between items-center mb-3 text-[14px]">
                    <span className="text-gray-500">Tổng tạm tính</span>
                    <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center mb-3 text-[14px] text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-medium">- {formatCurrency(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end mb-1 mt-4">
                    <span className="text-gray-600 font-medium text-[15px]">Thành tiền</span>
                    <div className="text-right">
                      <span className="block font-bold text-[22px] text-red-600 leading-none mb-1">
                        {formatCurrency(total)}
                      </span>
                      <span className="text-[11px] text-gray-400 font-normal">(Đã bao gồm VAT)</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className={`w-full mt-5 font-bold py-3.5 rounded-lg transition-all text-[15px] ${
                      selectedItems.length > 0 
                      ? 'bg-[#1435c3] hover:bg-[#0f2899] text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    TIẾP TỤC
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      
      <VoucherModal 
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApply={(voucher) => setOrderVoucher(voucher)}
        appliedVoucher={orderVoucher}
        orderTotal={subtotal}
      />
    </MasterLayout>
  );
};

export default CartPage;
