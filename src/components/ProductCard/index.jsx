import React from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../utils/route";
import { formatCurrency } from "../../utils/formatter";

const ProductCard = ({ product }) => {
  const { id, img, name, price, oldPrice } = product;

  return (
    <Link
      to={`${ROUTERS.CLIENT.PRODUCTS}/${id}`}
      className="border border-gray-200 rounded-xl p-4 block bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      <div className="bg-gray-50 border border-gray-100 rounded-lg h-[160px] flex items-center justify-center overflow-hidden mb-3">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="h-[140px] object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>
      <p className="text-[11px] font-bold text-gray-600 uppercase leading-snug line-clamp-2 mb-2">
        {name}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-bold text-red-600">{formatCurrency(price)}</span>
        {oldPrice && (
          <span className="text-[12px] text-gray-400 line-through">{formatCurrency(oldPrice)}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
