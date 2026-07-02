import React from 'react';

const ProfileModal = ({ isOpen, onClose, personnel }) => {
  if (!isOpen || !personnel) return null;

  const user = personnel.nguoi_dung || {};
  const branch = personnel.chi_nhanh || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            Hồ sơ Nhân viên
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white focus:outline-none bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto bg-gray-50/50">

          {}
          <div className="flex items-start gap-5 mb-8 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase shrink-0 border-4 border-white shadow-sm">
              {user.ten ? user.ten.charAt(0) : '?'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">{user.ten}</h3>
              <p className="text-blue-600 font-medium mb-2">{personnel.chucvu} — {branch.Ten_ChiNhanh}</p>

              <div className="flex gap-2">
                {user.phanquyen === -1 ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">Đã nghỉ việc</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Đang làm việc</span>
                )}
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">Mã NV: NV-{personnel.id_nhanvien}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">

            {}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Thông tin cá nhân
              </h4>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại</span>
                  <span className="font-semibold text-gray-800">{user.sdt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email (Tài khoản)</span>
                  <span className="font-semibold text-gray-800">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày gia nhập</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(personnel.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
