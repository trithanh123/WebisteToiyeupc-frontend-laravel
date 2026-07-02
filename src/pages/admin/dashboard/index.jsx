import React, { useState, useEffect } from "react";
import AdminMasterLayout from "../theme/masterLayout";
import StatCard from "./components/StatCard";
import TopProducts from "./components/TopProducts";
import LowStock from "./components/LowStock";

import iconRevenue from "../../../assets/icons/icons8-revenue-24.png";
import iconPurchase from "../../../assets/icons/icons8-purchase-order-50.png";
import iconCustomer from "../../../assets/icons/icons8-customer-50.png";
import iconEmergency from "../../../assets/icons/icons8-emergency-50.png";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("admin_access_token") || localStorage.getItem('admin_token');
      const response = await fetch(`http://127.0.0.1:8000/api/admin/dashboard?month=${month}&year=${year}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setData(result.data);
      } else {
        setError(result.message || "Lỗi khi lấy dữ liệu thống kê");
      }
    } catch (err) {
      setError("Không thể kết nối đến server");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <AdminMasterLayout title="Admin – Thống Kê Tổng Quan">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            Bảng Điều Khiển
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tổng quan tình hình kinh doanh và kho hàng</p>
        </div>

        {}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 pl-2">Tháng:</span>
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>Tháng {i+1}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Năm:</span>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 outline-none cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard 
              title="Tổng Doanh Thu" 
              value={formatCurrency(data.tong_doanh_thu)} 
              subtitle={`Trong tháng ${month}/${year}`}
              colorClass="bg-blue-100 text-blue-600"
              icon={<img src={iconRevenue} alt="Revenue" className="w-8 h-8 object-contain" />}
            />
            <StatCard 
              title="Đơn Hàng Thành Công" 
              value={data.tong_don_hang} 
              subtitle={`Trong tháng ${month}/${year}`}
              colorClass="bg-emerald-100 text-emerald-600"
              icon={<img src={iconPurchase} alt="Orders" className="w-8 h-8 object-contain" />}
            />
            <StatCard 
              title="Khách Hàng Mới" 
              value={data.khach_hang_moi} 
              subtitle={`Tài khoản đăng ký mới`}
              colorClass="bg-purple-100 text-purple-600"
              icon={<img src={iconCustomer} alt="Customers" className="w-8 h-8 object-contain" />}
            />
            <StatCard 
              title="Sản phẩm khẩn cấp" 
              value={data.sap_het_hang?.length || 0} 
              subtitle="Cần nhập kho thêm"
              colorClass="bg-red-100 text-red-600"
              icon={<img src={iconEmergency} alt="Emergency" className="w-8 h-8 object-contain" />}
            />
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            {}
            <div className="lg:col-span-2">
              <TopProducts products={data.top_san_pham} />
            </div>

            {}
            <div className="lg:col-span-1 h-full">
              <LowStock items={data.sap_het_hang} />
            </div>
          </div>
        </div>
      ) : null}
    </AdminMasterLayout>
  );
};

export default AdminDashboard;
