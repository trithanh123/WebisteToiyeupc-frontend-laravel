import React from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import pc1 from "../../../../assets/images/pc1.jpg";
import pc2 from "../../../../assets/images/pc2.png";
import pc3 from "../../../../assets/images/pc3.png";
import pc4 from "../../../../assets/images/pc4.png";
import pc6 from "../../../../assets/images/pc6.png";
import pc7 from "../../../../assets/images/pc7.png";
import pc8 from "../../../../assets/images/pc8.png";
import pc9 from "../../../../assets/images/pc9.png";

const products = [
  { id: 1, img: pc1, name: "PC LENOVO THINKCENTRE NEO 50S GEN 4 I5-13400", price: 20490000 },
  { id: 2, img: pc2, name: "PC DELL OPTIPLEX 3000 SFF CORE I5-12500T", price: 18990000 },
  { id: 3, img: pc3, name: "PC ASUS EXPERTCENTER D500SD I5-12400", price: 17490000 },
  { id: 4, img: pc4, name: "PC HP PRODESK 400 G9 SFF I5-12500", price: 19290000 },
  { id: 5, img: pc6, name: "PC LENOVO THINKCENTRE M70S GEN 3 I7-12700", price: 24990000 },
  { id: 6, img: pc7, name: "PC DELL OPTIPLEX 7010 SFF I7-13700", price: 26490000 },
  { id: 7, img: pc8, name: "PC ASUS EXPERTCENTER D700SD I7-12700K", price: 28990000 },
  { id: 8, img: pc9, name: "PC HP ELITEDESK 800 G9 SFF I7-12700", price: 30490000 },
];

const formatPrice = (price) =>
  price.toLocaleString("vi-VN") + " đ";

const TopProducts = () => {
  return (
    <section className="top-products">
      <div className="top-products__inner">
        <div className="section-header">
          <h2 className="section-header__title">TOP PC BÁN CHẠY</h2>
          <p className="section-header__sub">
            Những sản phẩm máy tính bán chạy nhất tại ToiYeuPC
          </p>
        </div>
        <div className="top-products__grid">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`${ROUTERS.CLIENT.PRODUCTS}/${p.id}`}
              className="product-card"
            >
              <div className="product-card__img-wrap">
                <img src={p.img} alt={p.name} />
              </div>
              <div className="product-card__info">
                <p className="product-card__name">{p.name}</p>
                <p className="product-card__price">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopProducts;
