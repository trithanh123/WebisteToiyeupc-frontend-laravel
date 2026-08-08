import React, { useState } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../../utils/formatter';
import ProductCard from '../../../components/ProductCard';
import MasterLayout from '../theme/masterLayout';

const AiPcBuilder = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('https://webistetoiyeupc-backend-laravel.onrender.com/api/products/build-pc', { query });
            const data = response.data;
            // Recalculate total from fresh MySQL prices to avoid showing stale Qdrant total
            if (data.build && Array.isArray(data.build)) {
                data.total_price = data.build.reduce((sum, item) => sum + (item.gia || 0), 0);
            }
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi gọi AI Builder.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MasterLayout>
            <div className="container mx-auto px-4 py-12" style={{ minHeight: '60vh' }}>
                <h1 className="text-3xl font-bold text-center mb-4 text-blue-600">Build PC Bằng Trí Tuệ Nhân Tạo (AI)</h1>
                <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
                    Nhập nhu cầu sử dụng và ngân sách của bạn, AI sẽ tự động phân tích và đưa ra cấu hình máy tính tối ưu nhất!
                </p>

                <div className="flex justify-center mb-10">
                    <div className="w-full max-w-3xl">
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 shadow-lg p-6 rounded-lg bg-white border border-gray-100">
                            <input
                                type="text"
                                placeholder="Ví dụ: máy tính chơi game pubg với card rtx 3060 giá tiền 21 triệu..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            />
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition-colors whitespace-nowrap min-w-[150px] flex justify-center items-center"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Tạo Cấu Hình'}
                            </button>
                        </form>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center max-w-3xl mx-auto mb-8" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {result && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-6 border-b pb-2">Cấu Hình Đề Xuất (Tổng: <span className="text-red-600">{formatCurrency(result.total_price)}</span>)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {result.build.map((item, index) => {
                                // Laravel MySQL model: primary key is 'id_sanpham', also has 'tensp', 'gia' (fresh price)
                                // Python fallback: Qdrant payload with 'id_sanpham' (numeric point id) and 'gia' (may be stale)
                                // A MySQL product has 'ma_danhmuc' field; Qdrant payload has 'specifications'
                                const isFullProduct = item.ma_danhmuc !== undefined || (item.id_sanpham !== undefined && item.masp !== undefined);
                                const name = item.tensp || item.ten_sanpham || 'Linh Kiện';
                                const price = item.gia;  // Always use 'gia' — MySQL fresh or Qdrant stale
                                const category = item.specifications?.loai || item.ten_danhmuc || 'Linh Kiện';
                                return (
                                <div key={index} className="flex h-full">
                                    {isFullProduct ? (
                                        <div className="w-full">
                                            <ProductCard product={item} />
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col w-full h-full p-4">
                                            <div className="text-sm text-gray-500 mb-2 font-medium">{category}</div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-2 flex-grow">{name}</h4>
                                            <div className="text-red-600 font-bold text-xl mt-auto">
                                                {formatCurrency(price)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </MasterLayout>
    );
};

export default AiPcBuilder;
