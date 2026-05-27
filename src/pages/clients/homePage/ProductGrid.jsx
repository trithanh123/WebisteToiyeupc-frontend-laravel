import React from "react";
import SectionTitle from "../../../components/SectionTitle";
import ProductCard from "../../../components/ProductCard";
import pc1 from "../../../assets/images/pc1 1.png";
import pc2 from "../../../assets/images/pc2 1.png";
import pc3 from "../../../assets/images/pc3.png";
import pc4 from "../../../assets/images/pc5 1.png";
import pc6 from "../../../assets/images/pc6 1.png";
import pc7 from "../../../assets/images/pc7 1.png";
import pc8 from "../../../assets/images/pc8 1.png";
import pc9 from "../../../assets/images/pc9 1.png";

const products = [
  { id: 1, img: pc1, name: "PC LENOVO THINKCENTRE NEO 50S GEN 4 I5-13400", price: 20490000 },
  { id: 2, img: pc2, name: "PC DELL OPTIPLEX 3000 SFF CORE I5-12500T",      price: 18990000 },
  { id: 3, img: pc3, name: "PC ASUS EXPERTCENTER D500SD I5-12400",           price: 17490000 },
  { id: 4, img: pc4, name: "PC HP PRODESK 400 G9 SFF I5-12500",             price: 19290000 },
  { id: 5, img: pc6, name: "PC LENOVO THINKCENTRE M70S GEN 3 I7-12700",     price: 24990000 },
  { id: 6, img: pc7, name: "PC DELL OPTIPLEX 7010 SFF I7-13700",            price: 26490000 },
  { id: 7, img: pc8, name: "PC ASUS EXPERTCENTER D700SD I7-12700K",         price: 28990000 },
  { id: 8, img: pc9, name: "PC HP ELITEDESK 800 G9 SFF I7-12700",           price: 30490000 },
];

const ProductGrid = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1280px] mx-auto px-4">
        <SectionTitle
          title="TOP PC BÁN CHẠY"
          subtitle="Những sản phẩm máy tính bán chạy nhất tại ToiYeuPC"
        />
        <div className="grid grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
