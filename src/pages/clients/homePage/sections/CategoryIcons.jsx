import React from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import iconPC from "../../../../assets/icons/icons8-pc-64.png";
import iconLaptop from "../../../../assets/icons/icons8-laptop-50.png";
import iconScreen from "../../../../assets/icons/icons8-screen-50.png";
import iconMainboard from "../../../../assets/icons/icons8-mainboard-32.png";
import iconCPU from "../../../../assets/icons/icons8-cpu-50.png";
import iconVGA from "../../../../assets/icons/icons8-vga-50.png";
import iconRAM from "../../../../assets/icons/icons8-ram-64.png";
import iconMouse from "../../../../assets/icons/icons8-mouse-50.png";
import iconPSU from "../../../../assets/icons/icons8-power-supply-64.png";
import iconKeyboard from "../../../../assets/icons/icons8-keyboard-32.png";
import iconCase from "../../../../assets/icons/icons8-case-64.png";
import iconHDD from "../../../../assets/icons/icons8-hdd-50.png";

const items = [
  { icon: iconPC,       label: "PC" },
  { icon: iconLaptop,   label: "Laptop" },
  { icon: iconScreen,   label: "Màn Hình" },
  { icon: iconMainboard,label: "Mainboard" },
  { icon: iconCPU,      label: "CPU" },
  { icon: iconVGA,      label: "VGA" },
  { icon: iconRAM,      label: "RAM" },
  { icon: iconMouse,    label: "Chuột" },
  { icon: iconPSU,      label: "Nguồn" },
  { icon: iconKeyboard, label: "Bàn Phím" },
  { icon: iconCase,     label: "Case" },
  { icon: iconHDD,      label: "Ổ Cứng" },
];

const CategoryIcons = () => {
  return (
  /* LỚP SƠN TRẮNG PHỦ TRÀN VIỀN: Che đi màu xám của trang web */
    <div className="w-full bg-white">
        
      <section className="max-w-[1280px] mx-auto bg-white border-b-2 border-blue-500 shadow-sm">
        
        {/* Blue header bar */}
        <div className="bg-blue-500 py-2 px-4">
          <span className="text-white text-[18px] font-bold uppercase tracking-[0.5px]">
            Danh Mục Sản Phẩm
          </span>
        </div>
        
        {/* Icon grid */}
        <div className="px-4 py-3 flex items-center justify-between flex-nowrap overflow-x-auto gap-10">
          {items.map((item, i) => (
            <Link
              key={i}
              to={ROUTERS.CLIENT.PRODUCTS}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors group shrink-0"
            >
              <img src={item.icon} alt={item.label} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap group-hover:text-red-600 transition-colors text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        
      </section>
      
    </div>
  );
};

export default CategoryIcons;
