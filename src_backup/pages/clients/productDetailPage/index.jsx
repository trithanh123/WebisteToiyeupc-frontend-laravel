import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MasterLayout from '../theme/masterLayout';
import ProductCard from '../../../components/ProductCard';
import { getImageUrl } from '../../../utils/getImageUrl';
import { parseSpecs, SpecIcon } from '../../../utils/specHelper';
import { formatCurrency } from '../../../utils/formatter';
import icon1 from '../../../assets/icons/1.png';
import icon2 from '../../../assets/icons/2.png';
import icon3 from '../../../assets/icons/3.png';
import icon4 from '../../../assets/icons/4.png';
import { CartContext } from '../../../context/CartContext';

const API = 'http://127.0.0.1:8000/api';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'desc'
  const [vouchers, setVouchers] = useState([]);
  

  const [branchOpen, setBranchOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState(null);
  const branchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { addToCart, closeModal } = React.useContext(CartContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(`${API}/vouchers/active`);
        if (res.data.status === 'success') {
          setVouchers(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch vouchers", err);
      }
    };

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${id}`);
        if (res.data.status === 'success') {
          const prodData = res.data.data;
          setProduct(prodData);
          setBreadcrumb(res.data.breadcrumb || []);
          if (prodData.ton_kho && prodData.ton_kho.length > 0) {
            const inStockBranches = prodData.ton_kho.filter(tk => tk.Soluongtonkho > 0);
            if (inStockBranches.length > 0) {
                setActiveBranch(inStockBranches[0]);
            }
          }
          
          // Fetch related products (same category)
          if (prodData.Ma_DanhMuc) {
            const relRes = await axios.get(`${API}/products/by-category?danh-muc=${prodData.Ma_DanhMuc}&per_page=5`);
            if (relRes.data.status === 'success') {
               // Exclude current product
               setRelatedProducts(relRes.data.data.filter(p => String(p.ID_SanPham) !== String(id)).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <MasterLayout>
        <div className="container mx-auto px-4 py-20 text-center text-gray-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
          <p>Đang tải dữ liệu sản phẩm...</p>
        </div>
      </MasterLayout>
    );
  }

  if (!product) {
    return (
      <MasterLayout>
        <div className="container mx-auto px-4 py-20 text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">404 - Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/" className="inline-block mt-4 text-blue-500 hover:underline">Quay về trang chủ</Link>
        </div>
      </MasterLayout>
    );
  }

  const price = product.Gia || 0;
  const oldPrice = product.Gia_goc || Math.round(price * 1.07 / 1000) * 1000;
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const specs = parseSpecs(product.specifications);


  return (
    <MasterLayout>
      <div className="bg-[#f1f5f9] min-h-screen pb-10 pt-4">
        <div className="container mx-auto px-4 max-w-[1200px]">
          
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-4 whitespace-nowrap overflow-x-auto pb-2 hide-scrollbar">
            <Link to="/" className="hover:text-red-600 shrink-0 transition-colors">Trang chủ</Link>
            <span className="mx-2 shrink-0 text-gray-400">›</span>
            {breadcrumb.map((cat, idx) => (
              <React.Fragment key={idx}>
                <Link to={`/san-pham?danh-muc=${cat.slug}`} className="hover:text-red-600 shrink-0 transition-colors">
                  {cat.Ten_DanhMuc}
                </Link>
                <span className="mx-2 shrink-0 text-gray-400">›</span>
              </React.Fragment>
            ))}
            <span className="text-gray-800 font-semibold shrink-0 truncate max-w-[300px]">{product.TenSP}</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 md:p-6 mb-6 flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Left: Images */}
            <div className="lg:w-5/12 flex flex-col">
               <div className="border border-gray-100 rounded-[12px] p-4 flex items-center justify-center h-[300px] md:h-[400px] mb-4 bg-white relative group">
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm z-10">
                      GIẢM {discount}%
                    </span>
                  )}
                  <img src={getImageUrl(product.Thumbail)} alt={product.TenSP} className="max-h-full object-contain transition-transform duration-300 hover:scale-[1.02]" />
               </div>
            </div>

            {/* Right: Info */}
            <div className="lg:w-7/12 flex flex-col">
               <h1 className="text-[22px] md:text-2xl font-bold text-gray-800 mb-2 leading-[1.3]">{product.TenSP}</h1>
               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5">
                  <span className="font-medium text-gray-600">Thương hiệu: <span className="text-blue-600 font-bold">{product.TenSP.split(' ')[0] || 'Unknown'}</span></span>
                  <span className="hidden md:inline text-gray-300">|</span>
                  <span>SKU: <span className="font-medium text-gray-700">{product.MaSP}</span></span>
                  <span className="hidden md:inline text-gray-300">|</span>
                  <span className="flex items-center text-[#fbbf24]">★★★★★ <span className="text-gray-400 ml-1.5">(0 đánh giá)</span></span>
               </div>

               {/* Price Box */}
               <div className="bg-[#f8fafc] rounded-xl p-4 md:p-5 mb-6 border border-[#e2e8f0]">
                 <div className="flex flex-wrap items-end gap-3 md:gap-4">
                   <span className="text-[28px] md:text-[32px] font-bold text-red-600 leading-none">{formatCurrency(price)}</span>
                   {discount > 0 && (
                     <>
                       <span className="text-[15px] text-gray-400 line-through mb-1">{formatCurrency(oldPrice)}</span>
                     </>
                   )}
                 </div>
               </div>

               {/* Promotions */}
               <div className="border border-blue-200 rounded-xl mb-6 overflow-hidden bg-white">
                 <div className="bg-gradient-to-r from-blue-50 to-white text-blue-700 font-bold px-4 py-2.5 border-b border-blue-100 flex items-center gap-2 text-sm uppercase">
                   <span className="text-lg">🎁</span> Khuyến mãi & Quà tặng
                 </div>
                 <div className="p-4 text-[13.5px] text-gray-700 space-y-2.5">
                   {vouchers.length > 0 ? (
                     vouchers.map((voucher) => (
                       <p key={voucher.id_khuyenmai} className="flex items-start gap-2.5">
                         <span className="text-green-500 mt-[1px] bg-green-100 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span> 
                         <span>
                           Nhập mã <strong className="text-red-600">{voucher.Ma_voucher}</strong>: Giảm {voucher.Loai_giamgia === 'Phần trăm' ? `${voucher.gia_trigiam}%` : `${formatCurrency(voucher.gia_trigiam)}`}
                           {voucher.giam_toida ? ` (tối đa ${formatCurrency(voucher.giam_toida)})` : ''} 
                           {voucher.don_toithieu > 0 ? ` cho đơn từ ${formatCurrency(voucher.don_toithieu)}` : ''}.
                         </span>
                       </p>
                     ))
                   ) : (
                     <p className="text-gray-500 italic">Hiện chưa có chương trình khuyến mãi nào.</p>
                   )}
                 </div>
               </div>

               {/* Quick Specs */}
               {specs.length > 0 && (
                 <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
                   <div className="bg-[#da251d] text-white font-bold px-4 py-3 uppercase text-[15px]">
                     Điểm nổi bật
                   </div>
                   <table className="w-full text-[13.5px] text-left">
                     <tbody>
                       {specs.map(({ type, value, key }, idx) => (
                         <tr key={type || key} className="border-b border-gray-100 last:border-0">
                           <td className="py-3 px-4 bg-gray-50/50 w-2/5 font-semibold text-gray-800 capitalize border-r border-gray-100">
                             {key ? key.replace(/_/g, ' ') : type}
                           </td>
                           <td className="py-3 px-4 text-gray-700">{value}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   <div className="p-3 text-center border-t border-gray-100">
                     <button 
                       onClick={() => {
                         setActiveTab('specs');
                         const el = document.getElementById('details-section');
                         if (el) {
                           window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
                         }
                       }} 
                       className="text-blue-600 hover:text-blue-700 text-[14px] font-medium inline-flex items-center gap-1 border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50 transition-colors"
                     >
                       Xem cấu hình chi tiết <span className="text-xs">▶</span>
                     </button>
                   </div>
                 </div>
               )}

               {/* Branch Availability Label */}
               <div className="mb-4 relative" ref={branchRef}>
                 <p className="text-sm font-bold text-gray-800 mb-2">📍 Chi nhánh có sản phẩm:</p>
                 <button
                   onClick={() => setBranchOpen(!branchOpen)}
                   className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 hover:border-red-500 transition-colors bg-white shadow-sm"
                 >
                   <div className="flex items-center gap-2">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0">
                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                       <circle cx="12" cy="10" r="3"/>
                     </svg>
                     <span className="truncate max-w-[200px] md:max-w-[300px] text-left">
                       {activeBranch ? activeBranch.chi_nhanh?.Ten_ChiNhanh : (product.ton_kho && product.ton_kho.some(tk => tk.Soluongtonkho > 0) ? "Chọn chi nhánh" : "Tạm hết hàng")}
                     </span>
                   </div>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 shrink-0">
                     <polyline points="6 9 12 15 18 9"/>
                   </svg>
                 </button>
                 
                 {branchOpen && (
                   <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-[100] max-h-[300px] overflow-y-auto">
                     {product.ton_kho && product.ton_kho.filter(tk => tk.Soluongtonkho > 0).length > 0 ? (
                       product.ton_kho.filter(tk => tk.Soluongtonkho > 0).map((tk, idx) => (
                         <li key={idx}>
                           <button
                             className={`w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-0 ${activeBranch?.ID_Khoton === tk.ID_Khoton ? 'bg-red-50/50' : ''}`}
                             onClick={() => { setActiveBranch(tk); setBranchOpen(false); }}
                           >
                             <div className="font-bold text-[14px] text-gray-800 flex justify-between items-center mb-1">
                               <span>{tk.chi_nhanh?.Ten_ChiNhanh}</span>
                               <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span>
                                 Có hàng
                               </span>
                             </div>
                             <div className="text-[12px] text-gray-500 line-clamp-1 leading-relaxed">
                               {tk.chi_nhanh?.diachi_chitiet}
                             </div>
                           </button>
                         </li>
                       ))
                     ) : (
                       <li className="px-4 py-6 text-sm text-gray-500 text-center flex flex-col items-center gap-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Sản phẩm hiện đang tạm hết hàng.
                       </li>
                     )}
                   </ul>
                 )}
               </div>

               {/* Actions */}
               <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                 <button 
                   onClick={() => {
                     addToCart(product, 1, vouchers.length > 0 ? vouchers[0] : null);
                     closeModal();
                     navigate('/thanh-toan', { state: { selectedItems: [product.id || product.ID_SanPham] } });
                   }}
                   className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_12px_rgba(220,38,38,0.25)] flex flex-col items-center justify-center hover:-translate-y-0.5"
                 >
                   <span className="text-[16px] uppercase">Mua ngay</span>
                   <span className="text-[11px] font-normal opacity-90 mt-0.5">Giao hàng miễn phí tận nơi</span>
                 </button>
                 <button 
                   onClick={() => addToCart(product, 1, vouchers.length > 0 ? vouchers[0] : null)}
                   className="sm:w-[220px] border-[1.5px] border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3.5 px-6 rounded-xl transition-colors flex flex-col items-center justify-center group"
                 >
                   <span className="text-[15px] uppercase">Thêm vào giỏ</span>
                   <span className="text-[11px] font-normal opacity-80 mt-0.5 group-hover:opacity-100">Mua sau cũng được</span>
                 </button>
               </div>
            </div>
          </div>

          {/* Details & Specs Tabs Section */}
          <div id="details-section" className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="lg:w-2/3 bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
               {/* Tabs Header */}
               <div className="flex border-b border-gray-200">
                 <button 
                   onClick={() => setActiveTab('specs')}
                   className={`flex-1 py-4 text-[15px] font-bold text-center transition-all ${activeTab === 'specs' ? 'text-red-600 border-b-[3px] border-red-600 bg-red-50/20' : 'text-gray-500 hover:text-red-500 hover:bg-gray-50 border-b-[3px] border-transparent'}`}
                 >
                   THÔNG SỐ KỸ THUẬT
                 </button>
                 <button 
                   onClick={() => setActiveTab('desc')}
                   className={`flex-1 py-4 text-[15px] font-bold text-center transition-all ${activeTab === 'desc' ? 'text-red-600 border-b-[3px] border-red-600 bg-red-50/20' : 'text-gray-500 hover:text-red-500 hover:bg-gray-50 border-b-[3px] border-transparent'}`}
                 >
                   CHI TIẾT SẢN PHẨM
                 </button>
               </div>
               
               {/* Tabs Content */}
               <div className="p-5 md:p-7">
                 {activeTab === 'specs' && (
                   <div className="overflow-hidden rounded-lg border border-gray-100">
                     <table className="w-full text-[14px] text-left">
                       <tbody>
                         {/* Extract specifications to a full table */}
                         {(() => {
                           let parsed = product.specifications;
                           if (typeof parsed === 'string') {
                             try { parsed = JSON.parse(parsed); } catch(e) { parsed = []; }
                           }
                           const rows = [];
                           const flatten = (obj, prefix = '') => {
                             if (Array.isArray(obj)) {
                               obj.forEach(item => flatten(item.value, item.key || item.name || item.type || ''));
                             } else if (typeof obj === 'object' && obj !== null) {
                               Object.entries(obj).forEach(([k, v]) => flatten(v, k));
                             } else {
                               rows.push({ key: prefix, value: String(obj || '') });
                             }
                           };
                           flatten(parsed);

                           if (rows.length === 0) {
                             return <tr><td className="py-8 text-center text-gray-500 italic">Chưa có thông số kỹ thuật chi tiết.</td></tr>;
                           }

                           return rows.map((row, idx) => (
                             <tr key={idx} className="bg-white">
                               <td className="py-3.5 px-5 font-semibold text-[#0066cc] w-1/4 border-b border-gray-100 capitalize">{row.key.replace(/_/g, ' ')}</td>
                               <td className="py-3.5 px-5 text-gray-800 border-b border-gray-100">{row.value}</td>
                             </tr>
                           ));
                         })()}
                       </tbody>
                     </table>
                   </div>
                 )}
                 {activeTab === 'desc' && (
                   <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                     {product.Motasanpham ? (
                       <div dangerouslySetInnerHTML={{ __html: product.Motasanpham }} className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed" />
                     ) : (
                       <p className="text-gray-400 text-center py-12 italic">Đang cập nhật bài viết chi tiết cho sản phẩm này.</p>
                     )}
                   </div>
                 )}
               </div>
            </div>

            {/* Right: Warranty & Services (Sticky) */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 sticky top-[90px]">
                <h3 className="font-bold text-[16px] text-gray-800 mb-4 pb-3 border-b border-gray-100 uppercase">Dịch vụ & Tiện ích</h3>
                <ul className="space-y-4 text-[13.5px] text-gray-700">
                  <li className="flex items-start gap-3">
                    <img src={icon3} alt="Bảo hành" className="w-5 h-5 object-contain shrink-0 mt-0.5" />
                    <span>Bảo hành chính hãng 24 tháng. Hỗ trợ giao nhận bảo hành tận nhà miễn phí.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <img src={icon1} alt="Đổi mới" className="w-5 h-5 object-contain shrink-0 mt-0.5" />
                    <span>Lỗi là đổi mới trong 30 ngày tận nhà đối với lỗi nhà sản xuất.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <img src={icon2} alt="Giao hàng" className="w-5 h-5 object-contain shrink-0 mt-0.5" />
                    <span>Giao hàng thần tốc 2h. Miễn phí giao hàng toàn quốc.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <img src={icon4} alt="Thanh toán" className="w-5 h-5 object-contain shrink-0 mt-0.5" />
                    <span>Thanh toán tiện lợi qua thẻ Visa, Mastercard, VNPay. Hỗ trợ trả góp 0% qua thẻ tín dụng.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 md:p-6">
              <h2 className="text-[18px] md:text-xl font-bold text-gray-800 mb-6 uppercase border-l-4 border-red-600 pl-3">Sản phẩm liên quan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {relatedProducts.map(rp => (
                  <ProductCard key={rp.ID_SanPham} product={rp} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </MasterLayout>
  );
};

export default ProductDetailPage;
