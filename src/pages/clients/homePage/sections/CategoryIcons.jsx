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
  { icon: iconPC,       label: "PC",        link: "/san-pham?danh-muc=pc-toiyeupc" },
  { icon: iconLaptop,   label: "Laptop",    link: "/san-pham?danh-muc=laptop" },
  { icon: iconScreen,   label: "Màn Hình",  link: "/san-pham?danh-muc=man-hinh" },
  { icon: iconMainboard,label: "Mainboard", link: "/san-pham?danh-muc=main-cpu-vga" },
  { icon: iconCPU,      label: "CPU",       link: "/san-pham?danh-muc=main-cpu-vga" },
  { icon: iconVGA,      label: "VGA",       link: "/san-pham?danh-muc=main-cpu-vga" },
  { icon: iconRAM,      label: "RAM",       link: "/san-pham?danh-muc=o-cung-ram-the-nho" },
  { icon: iconMouse,    label: "Chuột",     link: "/san-pham?danh-muc=chuot" },
  { icon: iconPSU,      label: "Nguồn",     link: "/san-pham?danh-muc=case-nguon-tan" },
  { icon: iconKeyboard, label: "Bàn Phím",  link: "/san-pham?danh-muc=ban-phim" },
  { icon: iconCase,     label: "Case",      link: "/san-pham?danh-muc=case-nguon-tan" },
  { icon: iconHDD,      label: "Ổ Cứng",    link: "/san-pham?danh-muc=o-cung-ram-the-nho" },
];

const CategoryIcons = () => {
  return (
      <div className="w-full bg-white">

      <section className="max-w-[1280px] mx-auto bg-white border-b-2 border-blue-500 shadow-sm">

        {}
        <div className="bg-blue-500 py-2 px-4">
          <span className="text-white text-[18px] font-bold uppercase tracking-[0.5px]">
            Danh Mục Sản Phẩm
          </span>
        </div>

        {}
        <div className="px-4 py-3 flex items-center justify-between flex-nowrap overflow-x-auto gap-10">
          {items.map((item, i) => (
            <Link
              key={i}
              to={item.link || ROUTERS.CLIENT.PRODUCTS}
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
