import React, { useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MasterLayout from '../theme/masterLayout';
import { ROUTERS } from '../../../utils/route';
import { formatCurrency } from '../../../utils/formatter';
import { getImageUrl } from '../../../utils/getImageUrl';
import { CartContext } from '../../../context/CartContext';
import { useAddressBook, PROVINCES } from '../../../hooks/useAddressBook';
import AddressModal from '../../../components/AddressModal';
import VoucherModal from '../../../components/VoucherModal';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';
import axios from 'axios';

const API = "http://127.0.0.1:8000/api";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, clearCart, removeFromCart } = useContext(CartContext);
  const { addresses, addAddress } = useAddressBook();

  const selectedItemIds = location.state?.selectedItems || [];
  const [orderVoucher, setOrderVoucher] = useState(location.state?.orderVoucher || null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', province: '', district: '', ward: '', detail: '', isDefault: true
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Additional Checkout States
  const [deliveryType, setDeliveryType] = useState('home'); 
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [note, setNote] = useState('');
  const [wantInvoice, setWantInvoice] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [consultantCode, setConsultantCode] = useState('');
  const [needInstall, setNeedInstall] = useState(false);
  const [needSupport, setNeedSupport] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay'); 

  const BRANCHES = [
    { id: 1, name: 'HCM - Quận 8', address: '45 cao lỗ phường 4 Quận 8, TP.HCM' },
    { id: 2, name: 'HCM - Quận 2', address: '275 Nguyễn Thị Định, Bình Trưng Quận 2, TP.HCM' },
    { id: 3, name: 'HCM - Quận 3', address: '330-332 Võ Văn Tần, Phường Bàn Cờ Quận 3, TP.HCM' },
    { id: 4, name: 'HCM - Bình Dương', address: '882 Lê Hồng Phong, Thủ Dầu Một, TP.HCM' },
    { id: 5, name: 'HCM - Đồng Nai', address: '272 Phạm Văn Thuận, Biên Hòa, TP.HCM' }
  ];

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const [selectedHomeAddressId, setSelectedHomeAddressId] = useState(defaultAddress?.id || null);

  React.useEffect(() => {
    if (addresses.length > 0 && !selectedHomeAddressId) {
      setSelectedHomeAddressId(defaultAddress?.id);
    }
  }, [addresses, defaultAddress, selectedHomeAddressId]);

  const selectedProducts = useMemo(() => {
    return cartItems.filter(item => selectedItemIds.includes(item.id || item.id_sanpham));
  }, [cartItems, selectedItemIds]);

  const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price || item.gia || 0) * item.quantity, 0);

  const discount = useMemo(() => {
    if (!orderVoucher) return 0;
    if (orderVoucher.Loai_giamgia === 'Phần trăm') {
      let d = subtotal * (orderVoucher.gia_trigiam / 100);
      if (orderVoucher.giam_toida) d = Math.min(d, orderVoucher.giam_toida);
      return d;
    }
    return orderVoucher.gia_trigiam;
  }, [subtotal, orderVoucher]);

  const total = subtotal - discount;

  if (selectedItemIds.length === 0) {
    return (
      <MasterLayout>
        <div className="py-20 text-center">
          <h2 className="text-xl text-gray-700 mb-4">Không có sản phẩm nào để thanh toán.</h2>
          <Link to={ROUTERS.CLIENT.CART} className="text-blue-600 hover:underline">Quay lại Giỏ hàng</Link>
        </div>
      </MasterLayout>
    );
  }

  const handleSaveAddressInline = () => {
    if (!form.name || !form.phone || !form.province || !form.detail) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return false;
    }
    addAddress(form);
    return true;
  };

  const handleCheckout = () => {
    if (deliveryType === 'home') {
      if (addresses.length === 0) {
        const saved = handleSaveAddressInline();
        if (!saved) return;
      } else if (!selectedHomeAddressId) {
        alert('Vui lòng chọn một địa chỉ nhận hàng.');
        return;
      }
    } else {
      if (!selectedBranch) {
        alert('Vui lòng chọn một điểm nhận hàng.');
        return;
      }
    }

    const finishCheckout = async () => {
      try {
        Swal.fire({
          title: 'Đang xử lý...',
          text: 'Vui lòng chờ trong giây lát.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const selectedAddressObj = addresses.find(a => a.id === selectedHomeAddressId) || form;
        const fullAddress = [selectedAddressObj.detail, selectedAddressObj.ward, selectedAddressObj.district, selectedAddressObj.province].filter(Boolean).join(', ');

        const payload = {
          ma_chinhanh: selectedBranch ? (selectedBranch.id || selectedBranch.id_chinhanh) : 1, 
          ma_khuyenmai: orderVoucher ? (orderVoucher.id_khuyenmai || orderVoucher.ID_KhuyenMai || orderVoucher.id) : null,
          ma_diachinguoidung: selectedHomeAddressId, 
          addressData: {
            ten_nguoinhan: selectedAddressObj.name || "Khách hàng",
            sdt_nguoinhan: selectedAddressObj.phone || "0999999999",
            diachi_chitiet: fullAddress || "Địa chỉ nhận hàng"
          },
          phuong_thuc_tt: paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt',
          ghichu: note,
          cart_items: selectedProducts.map(item => ({
            ma_sanpham: item.id || item.id_sanpham,
            soluong: item.quantity,
            don_gia: item.price || item.gia || 0
          })),
          tongtien: total
        };

        const res = await axios.post(`${API}/admin/checkout`, payload, { headers });
        if (res.data.status === 'success') {

          selectedItemIds.forEach(id => removeFromCart(id));

          if (res.data.payment_url) {
            window.location.href = res.data.payment_url;
            return;
          }

          Swal.fire({
            icon: 'success',
            title: 'Đặt hàng thành công!',
            text: 'Cảm ơn bạn đã mua sắm tại ToiYeuPC.',
            confirmButtonText: 'Tiếp tục mua sắm'
          }).then(() => {
            navigate(ROUTERS.CLIENT.HOME);
          });
        } else {
          Swal.fire('Lỗi', res.data.message || 'Thanh toán thất bại', 'error');
        }
      } catch (error) {
        console.error("Checkout error:", error);
        Swal.fire('Lỗi', error.response?.data?.message || 'Đã xảy ra lỗi trong quá trình đặt hàng.', 'error');
      }
    };

    if (wantInvoice && invoiceEmail) {
      Swal.fire({
        title: 'Đang gửi hóa đơn...',
        text: 'Vui lòng chờ trong giây lát.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const templateParams = {
        email: invoiceEmail, 
        customer_name: deliveryType === 'home' 
          ? (addresses.find(a => a.id === selectedHomeAddressId)?.name || form.name || 'Quý khách') 
          : 'Quý khách',
        order_id: `ORD${Date.now()}`,
        orders: selectedProducts.map(item => ({
          name: item.name || item.tensp,
          image_url: 'https://placehold.co/100x100?text=SP', 
          units: item.quantity,
          price: formatCurrency((item.price || item.gia || 0) * item.quantity)
        })),
        cost: {
          shipping: 'Miễn phí',
          tax: '0 đ',
          discount: discount > 0 ? `-${formatCurrency(discount)}` : '0 đ',
          total: formatCurrency(total)
        }
      };

      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).then(() => {
        finishCheckout();
      }).catch((err) => {
        console.error('EmailJS Error:', err);
        Swal.fire('Lỗi', 'Không thể gửi email hóa đơn. Đơn hàng vẫn được ghi nhận.', 'error').then(finishCheckout);
      });
    } else {
      finishCheckout();
    }
  };

  const handleAddAddressFromModal = (newAddress) => {
    addAddress(newAddress);
  };

  return (
    <MasterLayout>
      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSave={handleAddAddressFromModal} 
      />
      <VoucherModal 
        isOpen={isVoucherModalOpen} 
        onClose={() => setIsVoucherModalOpen(false)} 
        onApply={(voucher) => setOrderVoucher(voucher)} 
        selectedVoucher={orderVoucher} 
        cartTotal={subtotal} 
      />
      <div className="bg-[#f8f9fa] min-h-screen py-6">
        <div className="max-w-[1280px] mx-auto px-4">
          <h1 className="text-[20px] font-bold text-gray-800 mb-6 hidden md:block">Thanh toán</h1>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {}
            <div className="w-full lg:w-[65%] space-y-6">

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex bg-white border-b border-gray-100">
                  <div 
                    onClick={() => setDeliveryType('home')}
                    className={`flex-1 py-3 px-5 text-center font-semibold text-[15px] cursor-pointer transition-colors ${deliveryType === 'home' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                  >
                    Nhận hàng tại nhà
                  </div>
                  <div 
                    onClick={() => setDeliveryType('store')}
                    className={`flex-1 py-3 px-5 text-center font-semibold text-[15px] cursor-pointer transition-colors ${deliveryType === 'store' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                  >
                    Nhận hàng tại điểm
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-[15px] font-semibold text-gray-800 mb-4">Thông tin nhận hàng</h3>

                  {deliveryType === 'home' ? (
                    addresses.length === 0 ? (
                    <div className="border border-gray-200 rounded-lg p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Họ tên</label>
                          <input type="text" placeholder="Vui lòng nhập tên người nhận" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Số điện thoại</label>
                            <input type="tel" placeholder="Nhập số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" placeholder="Nhập email của bạn" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Tỉnh/Thành phố</label>
                          <select value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500 bg-white">
                            <option value="">Chọn</option>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Quận/Huyện</label>
                            <input type="text" placeholder="Nhập quận/huyện" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Phường/Xã</label>
                            <input type="text" placeholder="Nhập phường/xã" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Địa chỉ cụ thể</label>
                        <input type="text" placeholder="Số nhà, ngõ, tên đường..." value={form.detail} onChange={e => setForm({...form, detail: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedHomeAddressId === addr.id ? 'border-blue-600 bg-blue-50/10' : 'border-gray-200 hover:border-blue-300'}`}>
                          <input 
                            type="radio" 
                            name="homeAddress" 
                            checked={selectedHomeAddressId === addr.id}
                            onChange={() => setSelectedHomeAddressId(addr.id)}
                            className="mt-1 w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-bold text-gray-800 text-[14px]">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded font-medium">Mặc định</span>
                              )}
                            </div>
                            <div className="text-[13px] text-gray-600 mb-1">{addr.phone}</div>
                            <div className="text-[13px] text-gray-600 leading-relaxed">
                              {[addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </label>
                      ))}
                      <button 
                        onClick={() => setIsAddressModalOpen(true)}
                        className="w-full border border-dashed border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 hover:border-blue-400 transition-colors"
                      >
                        <span className="text-[20px] font-light leading-none">+</span>
                        <span className="text-[14px] font-medium">Thêm địa chỉ mới</span>
                      </button>
                    </div>
                  )) : (
                    <div>
                      <div className="mb-4">
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">Chọn khu vực nhận hàng</label>
                        <select className="border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500 bg-white w-auto min-w-[200px]">
                          <option>Thành phố Hồ Chí Minh</option>
                        </select>
                      </div>
                      <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {BRANCHES.map(branch => (
                          <label key={branch.id} className="flex gap-3 items-start cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors border border-transparent hover:border-gray-100">
                            <input 
                              type="radio" 
                              name="branch" 
                              checked={selectedBranch?.id === branch.id} 
                              onChange={() => setSelectedBranch(branch)}
                              className="mt-1 w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <div>
                              <div className="text-[14px] font-semibold text-gray-800">{branch.name}</div>
                              <div className="text-[13px] text-gray-600 leading-relaxed mt-0.5">{branch.address}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {}
                  <div className="mt-8">
                    <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Phương thức giao hàng</h3>
                    <label className="flex items-center justify-between border border-blue-500 bg-blue-50/10 rounded-lg p-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="radio" checked readOnly className="w-4 h-4 accent-blue-600" />
                        <span className="text-[14px] text-gray-800 font-medium">Phí giao tiêu chuẩn</span>
                      </div>
                      <span className="text-green-600 font-semibold text-[14px]">Miễn phí</span>
                    </label>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-3">Ghi chú cho đơn hàng</h3>
                <textarea 
                  rows="3" 
                  placeholder="Nhập thông tin ghi chú cho nhà bán hàng" 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-[14px] focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[18px] font-bold text-gray-800 mb-1">Phương thức thanh toán</h3>
                <p className="text-[13px] text-gray-500 mb-5">Thông tin thanh toán của bạn sẽ luôn được bảo mật</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`border-2 rounded-lg p-4 relative cursor-pointer transition-colors ${paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    {paymentMethod === 'vnpay' && (
                      <div className="absolute top-0 right-0 bg-blue-600 w-6 h-6 flex items-center justify-center rounded-bl-lg rounded-tr-[6px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                    <div className="font-semibold text-gray-800 text-[14px] mb-1">Thanh toán VNPAY-QR</div>
                    <div className="text-[13px] text-gray-500">Thanh toán VNPAY-QR</div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    className={`border-2 rounded-lg p-4 relative cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    {paymentMethod === 'cod' && (
                      <div className="absolute top-0 right-0 bg-blue-600 w-6 h-6 flex items-center justify-center rounded-bl-lg rounded-tr-[6px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                    <div className="font-semibold text-gray-800 text-[14px] mb-1">Thanh toán khi nhận hàng</div>
                    <div className="text-[13px] text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={wantInvoice} onChange={e => setWantInvoice(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded border-gray-300" />
                  <span className="text-[14px] text-gray-800 font-medium">Tôi muốn xuất hóa đơn</span>
                </label>

                {wantInvoice && (
                  <div className="animate-fadeIn">
                    <input type="email" placeholder="Nhập email nhận hóa đơn" value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500" />
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <label className="block text-[14px] font-semibold text-gray-800 mb-2">Mã nhân viên tư vấn</label>
                  <input type="text" placeholder="Đây là mã giới thiệu, không có tác dụng giảm giá cho đơn hàng" value={consultantCode} onChange={e => setConsultantCode(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {}
            <div className="w-full lg:w-[35%] space-y-4">

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-[16px] m-0">Thông tin đơn hàng</h3>
                  <Link to={ROUTERS.CLIENT.CART} className="text-[13px] text-blue-600 hover:underline">Chỉnh sửa</Link>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedProducts.map(item => (
                    <div key={item.id || item.id_sanpham} className="flex gap-3">
                      <div className="w-[60px] h-[60px] border border-gray-200 rounded p-1 shrink-0">
                        <img src={getImageUrl(item.img || item.thumbail)} alt={item.name || item.tensp} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[13px] text-gray-800 font-medium leading-snug m-0 mb-1">{item.name || item.tensp}</h4>
                        <div className="text-[12px] text-gray-500 mb-1">Số lượng {item.quantity}</div>
                        <div className="text-[14px] font-bold text-[#111]">{formatCurrency((item.price || item.gia || 0) * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {orderVoucher && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2 items-start bg-blue-50/30 p-2 rounded border border-blue-100">
                      <div className="text-red-500 mt-0.5 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                      </div>
                      <p className="text-[12.5px] text-gray-700 m-0">
                        <span className="font-semibold">1x</span> {orderVoucher.Tenkhuyenmai ? `${orderVoucher.Tenkhuyenmai} - ` : ''} 
                        Mã giảm thêm {orderVoucher.Loai_giamgia === 'Phần trăm' ? `${orderVoucher.gia_trigiam}%` : formatCurrency(orderVoucher.gia_trigiam)} ({orderVoucher.Ma_voucher})
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-[14px]">Khuyến mãi đơn hàng</span>
                <button onClick={() => setIsVoucherModalOpen(true)} className="text-blue-600 text-[13px] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  Chọn hoặc nhập khuyến mãi
                </button>
              </div>

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <label className="flex justify-between items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={needInstall} onChange={e => setNeedInstall(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded border-gray-300" />
                    <span className="text-[14px] text-gray-800 font-medium">Cài đặt</span>
                  </div>
                  <span className="text-blue-600 font-semibold text-[14px]">Miễn phí</span>
                </label>
                <label className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={needSupport} onChange={e => setNeedSupport(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded border-gray-300" />
                    <span className="text-[14px] text-gray-800 font-medium">Hỗ trợ kỹ thuật</span>
                  </div>
                  <span className="text-blue-600 font-semibold text-[14px]">Miễn phí</span>
                </label>
              </div>

              {}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-3 text-[14px]">
                  <span className="text-gray-500">Tổng tạm tính</span>
                  <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center mb-3 text-[14px]">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="font-medium text-gray-800">Miễn phí</span>
                </div>

                {needInstall && (
                  <div className="flex justify-between items-center mb-3 text-[14px]">
                    <span className="text-gray-500">Cài đặt</span>
                    <span className="font-medium text-gray-800">Miễn phí</span>
                  </div>
                )}

                {needSupport && (
                  <div className="flex justify-between items-center mb-3 text-[14px]">
                    <span className="text-gray-500">Hỗ trợ kỹ thuật</span>
                    <span className="font-medium text-gray-800">Miễn phí</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between items-center mb-3 text-[14px]">
                    <span className="text-gray-500 flex items-center gap-2">
                      Mã giảm giá 
                      {orderVoucher?.Ma_voucher && (
                        <span className="border border-blue-600 text-blue-600 text-[11px] px-2 py-0.5 font-medium uppercase rounded-sm">
                          {orderVoucher.Ma_voucher}
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-gray-800">-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-end mb-2 mt-4">
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
                  className="w-full mt-4 font-bold py-3.5 rounded-lg transition-all text-[15px] bg-[#1435c3] hover:bg-[#0f2899] text-white shadow-md hover:shadow-lg"
                >
                  THANH TOÁN
                </button>
                <p className="text-[12px] text-gray-500 mt-4 text-center">
                  Nhấn "Thanh toán" đồng nghĩa với việc bạn đọc và đồng ý tuân theo <a href="#" className="text-blue-600 hover:underline">Điều khoản và Điều kiện</a>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default CheckoutPage;
