import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionTitle from "../../../components/SectionTitle";
import ProductCard from "../../../components/ProductCard";

const API = 'http://127.0.0.1:8000/api';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get(`${API}/products`);
        // If API returns paginated data (res.data.data) or simple array (res.data)
        const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        // Get the first 8 products for "TOP PC BÁN CHẠY"
        setProducts(data.slice(0, 8));
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm bán chạy", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  return (
    <section className="bg-white py-12">
      <div className="max-w-[1280px] mx-auto px-4">
        <SectionTitle
          title="TOP PC BÁN CHẠY"
          subtitle="Những sản phẩm máy tính bán chạy nhất tại ToiYeuPC"
        />
        {loading ? (
          <div className="text-center py-10">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id || p.ID_SanPham} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
