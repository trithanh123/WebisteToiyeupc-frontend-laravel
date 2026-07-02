import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MasterLayout from '../theme/masterLayout';
import { getImageUrl } from '../../../utils/getImageUrl';
import { BranchContext } from '../../../context/BranchContext';

const API = 'http://127.0.0.1:8000/api';

const formatPrice = (price) => {
  if (!price && price !== 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

import { parseSpecs, SpecIcon } from '../../../utils/specHelper';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const price    = product.gia || 0;

  const oldPrice = product.gia_goc || Math.round(price * 1.07 / 1000) * 1000;
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const specs = parseSpecs(product.specifications);

  return (
    <div
      className="gvn-card"
      id={`product-card-${product.id_sanpham}`}
      onClick={() => navigate(`/san-pham/${product.id_sanpham}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {}
      <div className="gvn-card__img-wrap">
        {}
        {discount > 0 && (
          <span className="gvn-card__discount-badge" id={`badge-${product.id_sanpham}`}>
            -{discount}%
          </span>
        )}
        {product.thumbail ? (
          <img
            className="gvn-card__img"
            src={getImageUrl(product.thumbail)}
            alt={product.tensp}
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

      {}
      <div className="gvn-card__body">
        {}
        <p className="gvn-card__name">{product.tensp}</p>

        {}
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

        {}
        <div className="gvn-card__price-block">
          <div className="gvn-card__price-old-wrap">
            {discount > 0 ? (
              <span className="gvn-card__price-old">{formatPrice(oldPrice)}</span>
            ) : <span>&nbsp;</span>}
          </div>
          <div className="gvn-card__price-row">
            <span className="gvn-card__price">{formatPrice(price)}</span>
            {discount > 0 && (
              <span className="gvn-card__pct-badge">-{discount}%</span>
            )}
          </div>
        </div>

        {}
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
          onClick={e => { e.stopPropagation(); }}
          id={`add-cart-${product.id_sanpham}`}
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

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="gvn-skeleton">
    <div className="gvn-skeleton__img" />
    <div className="gvn-skeleton__body">
      <div className="gvn-skeleton__line gvn-skeleton__line--title" />
      <div className="gvn-skeleton__line gvn-skeleton__line--title" style={{ width: '70%' }} />
      <div className="gvn-skeleton__specs">
        {[1,2,3].map(i => <div key={i} className="gvn-skeleton__chip" />)}
      </div>
      <div className="gvn-skeleton__line gvn-skeleton__line--price" />
      <div className="gvn-skeleton__line gvn-skeleton__line--sub" />
    </div>
  </div>
);

// ── Pagination ────────────────────────────────────────────────
const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;
  const pages = [];
  const delta = 2;
  const left  = Math.max(1, currentPage - delta);
  const right = Math.min(lastPage, currentPage + delta);
  if (left > 1)     { pages.push(1); if (left > 2) pages.push('...'); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < lastPage) { if (right < lastPage - 1) pages.push('...'); pages.push(lastPage); }

  return (
    <div className="product-pagination" id="pagination-bar">
      <button className="product-pagination__btn" disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)} id="pagination-prev">‹</button>
      {pages.map((p, idx) =>
        p === '...'
          ? <span key={`e-${idx}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
          : <button key={p} id={`pagination-page-${p}`}
              className={`product-pagination__btn${p === currentPage ? ' product-pagination__btn--active' : ''}`}
              onClick={() => onPageChange(p)}>{p}</button>
      )}
      <button className="product-pagination__btn" disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)} id="pagination-next">›</button>
    </div>
  );
};

const SORT_OPTIONS = [
  { key: 'newest',     label: 'Mới nhất' },
  { key: 'price_asc',  label: 'Giá tăng dần' },
  { key: 'price_desc', label: 'Giá giảm dần' },
  { key: 'oldest',     label: 'Cũ nhất' },
];
const MAX_PRICE = 100_000_000;

const ProductPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get('danh-muc') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const sortParam = searchParams.get('sort') || 'newest';

  const { activeBranch } = useContext(BranchContext);

  const [products,      setProducts]      = useState([]);
  const [category,      setCategory]      = useState(null);
  const [breadcrumb,    setBreadcrumb]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [totalItems,    setTotalItems]    = useState(0);
  const [lastPage,      setLastPage]      = useState(1);
  const [currentPage,   setCurrentPage]   = useState(pageParam);
  const [sort,          setSort]          = useState(sortParam);
  const [minPrice,      setMinPrice]      = useState(0);
  const [maxPrice,      setMaxPrice]      = useState(MAX_PRICE);
  const [appliedMin,    setAppliedMin]    = useState(0);
  const [appliedMax,    setAppliedMax]    = useState(MAX_PRICE);
  const [allCategories, setAllCategories] = useState([]);

  const [selectedFilters, setSelectedFilters] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  const fetchRef = useRef(0);

  useEffect(() => {
    axios.get(`${API}/categories`)
      .then(res => { if (res.data.status === 'success') setAllCategories(res.data.data || []); })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (page, sortKey, minP, maxP, filters = {}) => {
    const id = ++fetchRef.current;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (slugParam) q.set('danh-muc', slugParam);
      q.set('sort', sortKey); q.set('min_price', minP);
      q.set('max_price', maxP); q.set('page', page); q.set('per_page', 16);

      Object.entries(filters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          q.set(key, values.join(','));
        }
      });

      if (activeBranch && activeBranch.id_chinhanh) {
        q.set('branch_id', activeBranch.id_chinhanh);
      }

      const res = await axios.get(`${API}/products/by-category?${q}`);
      if (id !== fetchRef.current) return;
      if (res.data.status === 'success') {
        setProducts(res.data.data || []);
        setCategory(res.data.category);
        setBreadcrumb(res.data.breadcrumb || []);
        setTotalItems(res.data.total);
        setLastPage(res.data.last_page);
        setCurrentPage(res.data.current_page);
      }
    } catch { if (id === fetchRef.current) setProducts([]); }
    finally  { if (id === fetchRef.current) setLoading(false); }
  }, [slugParam, activeBranch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts(pageParam, sortParam, appliedMin, appliedMax, selectedFilters);
    setSort(sortParam); setCurrentPage(pageParam);

  }, [slugParam, sortParam, pageParam, activeBranch]);

  const handleSort = key => setSearchParams(prev => {
    const p = new URLSearchParams(prev); p.set('sort', key); p.set('page', '1'); return p;
  });
  const handlePage = page => {
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', page); return p; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleApplyPrice = () => {
    setAppliedMin(minPrice); setAppliedMax(maxPrice);
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', '1'); return p; });
    fetchProducts(1, sort, minPrice, maxPrice, selectedFilters);
  };
  const handleResetPrice = () => {
    setMinPrice(0); setMaxPrice(MAX_PRICE); setAppliedMin(0); setAppliedMax(MAX_PRICE);
    fetchProducts(1, sort, 0, MAX_PRICE, selectedFilters);
  };

  const handleToggleFilter = (groupId, option) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(option) ? current.filter(item => item !== option) : [...current, option];
      const newFilters = { ...prev, [groupId]: updated };
      setSearchParams(p => { const sp = new URLSearchParams(p); sp.set('page', '1'); return sp; });
      fetchProducts(1, sort, appliedMin, appliedMax, newFilters);
      return newFilters;
    });
  };

  const handleRemoveFilter = (groupId, option) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev, [groupId]: (prev[groupId] || []).filter(item => item !== option) };
      setSearchParams(p => { const sp = new URLSearchParams(p); sp.set('page', '1'); return sp; });
      fetchProducts(1, sort, appliedMin, appliedMax, newFilters);
      return newFilters;
    });
  };

  const handleClearAllFilters = () => {
    setSelectedFilters({});
    setSearchParams(p => { const sp = new URLSearchParams(p); sp.set('page', '1'); return sp; });
    fetchProducts(1, sort, appliedMin, appliedMax, {});
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: prev[groupId] === undefined ? false : !prev[groupId] }));
  };

  const categoryName = category?.ten_danhmuc || 'Tất cả sản phẩm';

  const filterMap = new Map();
  let rootCategoriesToProcess = [];

  if (breadcrumb && breadcrumb.length > 0) {
    const rootId = breadcrumb[0].id_danhmuc;
    const rootCat = allCategories.find(c => c.id_danhmuc === rootId);
    if (rootCat) rootCategoriesToProcess = [rootCat];
  } else if (slugParam) {
    const rootCat = allCategories.find(c => c.slug === slugParam || String(c.id_danhmuc) === slugParam);
    if (rootCat) rootCategoriesToProcess = [rootCat];
  }

  rootCategoriesToProcess.forEach(l1 => {
    if (l1.danh_muc_con && l1.danh_muc_con.length > 0) {
      l1.danh_muc_con.forEach(l2 => {
        if (l2.danh_muc_con && l2.danh_muc_con.length > 0) {
          const key = l2.ten_danhmuc;
          if (!filterMap.has(key)) {
            filterMap.set(key, {
              id: l2.slug || l2.id_danhmuc.toString(),
              label: l2.ten_danhmuc,
              options: []
            });
          }
          const group = filterMap.get(key);
          l2.danh_muc_con.forEach(l3 => {
            if (!group.options.find(o => o.value === (l3.slug || l3.id_danhmuc.toString()))) {
              group.options.push({
                label: l3.ten_danhmuc,
                value: l3.slug || l3.id_danhmuc.toString()
              });
            }
          });
        }
      });
    }
  });
  const dynamicFilterGroups = Array.from(filterMap.values());

  return (
    <MasterLayout title={`${categoryName} – ToiYeuPC`}>

      {}
      <nav className="product-page__breadcrumb" aria-label="breadcrumb">
        <Link to="/">Trang chủ</Link>
        {breadcrumb && breadcrumb.length > 0 ? (
          breadcrumb.map((b, idx) => (
            <React.Fragment key={b.id_danhmuc}>
              <span className="sep">›</span>
              {idx === breadcrumb.length - 1 ? (
                <span className="current">{b.ten_danhmuc}</span>
              ) : (
                <Link to={`/san-pham?danh-muc=${b.slug}`}>{b.ten_danhmuc}</Link>
              )}
            </React.Fragment>
          ))
        ) : (
          <>
            <span className="sep">›</span>
            <span className="current">{categoryName}</span>
          </>
        )}
      </nav>

      <div className="product-page">
        <div className="product-page__inner">

          {}
          <aside className="product-sidebar" id="product-sidebar">

            {}
            <div className="product-sidebar__box">

              {}
              {Object.values(selectedFilters).flat().length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px', fontWeight: 600 }}>Bộ lọc đã dùng</h3>
                  <div className="product-sidebar__applied-filters">
                    {Object.entries(selectedFilters).map(([groupId, options]) => 
                      options.map(opt => {
                        const groupInfo = dynamicFilterGroups.find(g => g.id === groupId);
                        const optInfo = groupInfo?.options.find(o => o.value === opt);
                        const displayOpt = optInfo ? optInfo.label : opt;
                        return (
                          <span key={`${groupId}-${opt}`} className="product-sidebar__applied-tag">
                            {displayOpt}
                            <button onClick={() => handleRemoveFilter(groupId, opt)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                  <button 
                    onClick={handleClearAllFilters} 
                    style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}

              {}
              <div className="product-sidebar__filter-group">
                <div className="product-sidebar__filter-header">Khoảng giá</div>
                <div className="product-sidebar__price-display">
                  <span>{formatPrice(minPrice)}</span>
                  <span>{formatPrice(maxPrice)}</span>
                </div>
                <div className="product-sidebar__range-wrap">
                  <input id="range-min" type="range" min={0} max={MAX_PRICE} step={500_000} value={minPrice}
                    onChange={e => setMinPrice(Math.min(+e.target.value, maxPrice - 500_000))} />
                </div>
                <div className="product-sidebar__range-wrap">
                  <input id="range-max" type="range" min={0} max={MAX_PRICE} step={500_000} value={maxPrice}
                    onChange={e => setMaxPrice(Math.max(+e.target.value, minPrice + 500_000))} />
                </div>
                <button id="apply-price-filter" className="product-sidebar__apply-btn" onClick={handleApplyPrice}>
                  Áp dụng
                </button>
                {(appliedMin > 0 || appliedMax < MAX_PRICE) && (
                  <button id="reset-price-filter" className="product-sidebar__apply-btn"
                    style={{ marginTop: 6, background: '#6b7280' }} onClick={handleResetPrice}>
                    Xóa khoảng giá
                  </button>
                )}
              </div>

              {}
              {dynamicFilterGroups.map(group => {
                const isOpen = expandedGroups[group.id] !== false; 
                const selectedSet = new Set(selectedFilters[group.id] || []);
                return (
                  <div key={group.id} className="product-sidebar__filter-group">
                    <div 
                      className={`product-sidebar__filter-header ${isOpen ? 'is-open' : ''}`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      {group.label}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {isOpen && (
                      <div className="product-sidebar__filter-body">
                        <div className="product-sidebar__filter-grid">
                          {group.options.map(opt => (
                            <label key={opt.value} className="product-sidebar__checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={selectedSet.has(opt.value)} 
                                onChange={() => handleToggleFilter(group.id, opt.value)}
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </aside>

          {}
          <main className="product-main" id="product-main">
            <div className="product-main__header">
              <div className="product-main__title-wrap">
                <h1>{categoryName}</h1>
                <span>{loading ? 'Đang tải...' : `${totalItems.toLocaleString('vi-VN')} sản phẩm`}</span>
              </div>
              <div className="sort-bar" id="sort-bar">
                <span className="sort-bar__label">Sắp xếp:</span>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.key} id={`sort-${opt.key}`}
                    className={`sort-bar__btn${sort === opt.key ? ' sort-bar__btn--active' : ''}`}
                    onClick={() => handleSort(opt.key)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="product-grid" id="product-grid">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              ) : products.length === 0 ? (
                <div className="product-empty">
                  <div className="product-empty__icon">📦</div>
                  <p className="product-empty__title">Không tìm thấy sản phẩm</p>
                  <p className="product-empty__desc">Thử thay đổi bộ lọc hoặc chọn danh mục khác.</p>
                </div>
              ) : (
                products.map(p => <ProductCard key={p.id_sanpham} product={p} />)
              )}
            </div>

            {!loading && lastPage > 1 && (
              <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePage} />
            )}
          </main>
        </div>
      </div>
    </MasterLayout>
  );
};

export default ProductPage;
