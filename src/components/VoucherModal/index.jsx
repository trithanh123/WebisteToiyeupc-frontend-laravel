import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatter';

const API = 'http://127.0.0.1:8000/api';

const VoucherModal = ({ isOpen, onClose, onApply, appliedVoucher, orderTotal }) => {
  const [vouchers, setVouchers] = useState([]);
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API}/vouchers/active`)
        .then(res => {
          if (res.data.status === 'success') {
            setVouchers(res.data.data);
          }
        })
        .catch(err => console.error("Error fetching vouchers", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyClick = (voucher) => {
    if (orderTotal < voucher.don_toithieu) {
      alert(`Đơn hàng tối thiểu ${formatCurrency(voucher.don_toithieu)} để áp dụng mã này.`);
      return;
    }
    onApply(voucher);
    onClose();
  };

  const handleManualApply = () => {
    if (!inputCode.trim()) return;
    const found = vouchers.find(v => v.Ma_voucher.toUpperCase() === inputCode.trim().toUpperCase());
    if (found) {
      handleApplyClick(found);
    } else {
      alert("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-[20px] font-bold text-gray-800 m-0">Khuyến mãi và mã giảm giá</h2>
        </div>

        <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="flex gap-3 mb-6">
            <input 
              type="text" 
              placeholder="Mã giảm giá/phiếu mua hàng" 
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-[14px]"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
            />
            <button 
              onClick={handleManualApply}
              className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-[14px]"
            >
              Áp dụng
            </button>
          </div>

          <h3 className="font-bold text-[15px] text-gray-800 mb-3">Mã giảm giá</h3>

          <div className="space-y-3 mb-6">
            {vouchers.map(v => {
              const isValid = orderTotal >= v.don_toithieu;
              const isApplied = appliedVoucher?.id_khuyenmai === v.id_khuyenmai;

              return (
                <div key={v.id_khuyenmai} className={`bg-white border rounded-xl p-4 flex gap-4 items-start ${isApplied ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                  <div className="w-[60px] h-[60px] bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <div className="bg-[#ff3b5c] text-white w-10 h-10 rounded flex items-center justify-center">
                      <span className="font-bold text-lg">%</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-2">
                      {v.Tenkhuyenmai && <h4 className="font-bold text-gray-800 text-[15px] m-0 mb-1.5 leading-snug">{v.Tenkhuyenmai}</h4>}
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="border border-blue-600 text-blue-700 text-[12px] font-medium px-2 py-0.5 rounded uppercase bg-blue-50/50">{v.Ma_voucher}</span>
                        <span className="font-medium text-gray-800 text-[14px]">
                          Giảm {v.Loai_giamgia === 'Phần trăm' ? `${v.gia_trigiam}%` : formatCurrency(v.gia_trigiam)}
                          {v.giam_toida ? ` tối đa ${formatCurrency(v.giam_toida)}` : ''}
                        </span>
                      </div>
                    </div>
                    {v.don_toithieu > 0 && (
                      <p className="text-gray-500 text-[13px] m-0 mb-3">Đơn tối thiểu {formatCurrency(v.don_toithieu)}</p>
                    )}
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-gray-500 text-[13px]">HSD: {formatDate(v.ngayketthucchuongtrinh)}</span>
                      {isApplied ? (
                        <span className="text-green-600 font-medium text-[14px]">Đã áp dụng</span>
                      ) : (
                        <button 
                          onClick={() => handleApplyClick(v)}
                          className={`bg-transparent border-none font-medium text-[14px] cursor-pointer ${isValid ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                        >
                          Áp dụng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {vouchers.length === 0 && (
              <p className="text-gray-500 italic text-[14px]">Hiện không có mã giảm giá nào.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
          <button 
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
