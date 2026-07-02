import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTERS } from "../../utils/route";
import { formatCurrency } from "../../utils/formatter";
import { getImageUrl } from "../../utils/getImageUrl";
import { parseSpecs, SpecIcon } from "../../utils/specHelper";
import { CartContext } from "../../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = React.useContext(CartContext);

  const id = product.id || product.ID_SanPham;
  const img = product.img || product.Thumbail;
  const name = product.name || product.TenSP;
  const price = product.price || product.Gia || 0;
  const oldPrice = product.oldPrice || product.Gia_goc || (price ? Math.round(price * 1.07 / 1000) * 1000 : 0);
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const specifications = product.specifications;
  const rawSpecs = parseSpecs(specifications);
  const desiredTypes = ['cpu', 'gpu', 'mainboard', 'ram', 'storage', 'screen', 'psu', 'case', 'cooler', 'battery', 'weight', 'keyboard', 'ports', 'audio'];
  const specs = rawSpecs
    .filter(s => desiredTypes.includes(s.type))
    .sort((a, b) => desiredTypes.indexOf(a.type) - desiredTypes.indexOf(b.type))
    .slice(0, 8);

  return (
    <div
      className="gvn-card"
      id={`product-card-${id}`}
      onClick={() => navigate(`${ROUTERS.CLIENT.PRODUCTS}/${id}`)}
    >
      {/* ── Image area ── */}
      <div className="gvn-card__img-wrap">
        {/* ── Discount badge ── */}
        {discount > 0 && (
          <span className="gvn-card__discount-badge" id={`badge-${id}`}>
            -{discount}%
          </span>
        )}
        {img ? (
          <img
            className="gvn-card__img"
            src={getImageUrl(img)}
            alt={name}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="gvn-card__img-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="gvn-card__body">
        {/* Tên sản phẩm */}
        <p className="gvn-card__name">{name}</p>

        {/* Spec chips – GearVN style: grid xám */}
        {specs.length > 0 && (
          <div className="gvn-card__specs">
            {specs.map(({ type, short }, idx) => (
              <span className="gvn-card__spec" key={idx} title={type}>
                <span className="gvn-card__spec-icon">
                  <SpecIcon type={type} />
                </span>
                <span className="gvn-card__spec-val">{short}</span>
              </span>
            ))}
          </div>
        )}

        {/* Giá */}
        <div className="gvn-card__price-block">
          <div className="gvn-card__price-old-wrap">
            {discount > 0 ? (
              <span className="gvn-card__price-old">{formatCurrency(oldPrice)}</span>
            ) : <span>&nbsp;</span>}
          </div>
          <div className="gvn-card__price-row">
            <span className="gvn-card__price">{formatCurrency(price)}</span>
            {discount > 0 && (
              <span className="gvn-card__pct-badge">-{discount}%</span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="gvn-card__rating">
          <span className="gvn-card__stars">
            {'★★★★★'.split('').map((star, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < 4 ? "#f59e0b" : "#d1d5db"} xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </span>
          <span className="gvn-card__review-count">(0 đánh giá)</span>
        </div>
        
        {/* ── Add to cart btn ── */}
        <button
          className="gvn-card__add-btn"
          onClick={e => { 
            e.stopPropagation(); 
            addToCart(product, 1);
          }}
          id={`add-cart-${id}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
