import React, { useState } from "react";
import StaffMasterLayout from "../theme/masterLayout";

const initialOrders = [
  { id: "#DH001", customer: "Nguyễn Văn A", product: "PC LENOVO I5-13400",  total: "20.490.000 đ", status: "Chờ xác nhận", date: "23/05/2024" },
  { id: "#DH002", customer: "Trần Thị B",   product: "LAPTOP DELL XPS 15",  total: "35.990.000 đ", status: "Đang xử lý",   date: "23/05/2024" },
  { id: "#DH003", customer: "Lê Văn C",     product: "PC ASUS I7-12700K",   total: "28.990.000 đ", status: "Đã giao",      date: "22/05/2024" },
  { id: "#DH004", customer: "Phạm Thị D",   product: "MÀN HÌNH ASUS 27\"",  total: "8.490.000 đ",  status: "Đã giao",      date: "22/05/2024" },
  { id: "#DH005", customer: "Hoàng Văn E",  product: "PC HP ELITEDESK I7",  total: "30.490.000 đ", status: "Chờ xác nhận", date: "21/05/2024" },
];

const statusColor = {
  "Đã giao":       "#38a169",
  "Đang xử lý":   "#3182ce",
  "Chờ xác nhận": "#d69e2e",
};

const StaffOrders = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const filtered = initialOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <StaffMasterLayout title="Quản Lý Đơn Hàng">
      {/* Filter bar */}
      <div className="staff-filter">
        <input
          type="text"
          placeholder="Tìm theo mã đơn hoặc tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="staff-filter__input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="staff-filter__select"
        >
          {["Tất cả", "Chờ xác nhận", "Đang xử lý", "Đã giao"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Ngày</th>
              <th>Khách Hàng</th>
              <th>Sản Phẩm</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.date}</td>
                <td>{o.customer}</td>
                <td>{o.product}</td>
                <td>{o.total}</td>
                <td>
                  <span
                    className="admin-table__badge"
                    style={{ background: statusColor[o.status] }}
                  >
                    {o.status}
                  </span>
                </td>
                <td>
                  <button className="admin-table__action-btn">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="admin-table__empty">Không tìm thấy đơn hàng nào.</p>
        )}
      </div>
    </StaffMasterLayout>
  );
};

export default StaffOrders;
