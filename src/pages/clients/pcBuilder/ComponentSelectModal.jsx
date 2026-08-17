import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { formatCurrency } from '../../../utils/formatter';
import { getImageUrl } from '../../../utils/getImageUrl';
import { BranchContext } from '../../../context/BranchContext';

const API = "https://webistetoiyeupc-backend-laravel.onrender.com/api";

const ComponentSelectModal = ({ isOpen, onClose, slotType, slotId, onSelect, currentBuild }) => {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { activeBranch } = useContext(BranchContext);

    useEffect(() => {
        if (!isOpen) return;
        const fetchComponents = async () => {
            setLoading(true);
            try {
                // Prepare params
                const params = {
                    type: slotType,
                    branch_id: activeBranch?.id_chinhanh || null
                };

                // Validate TC-35: Logic lọc theo Socket
                if (slotId === 'mainboard' && currentBuild['cpu']) {
                    const cpuSocket = currentBuild['cpu'].specifications?.socket;
                    if (cpuSocket) {
                        params.socket = cpuSocket;
                    }
                } else if (slotId === 'cpu' && currentBuild['mainboard']) {
                    const mainSocket = currentBuild['mainboard'].specifications?.socket;
                    if (mainSocket) {
                        params.socket = mainSocket;
                    }
                }

                // Gọi API builder-components vừa được thêm vào backend
                // Để test ở máy local bạn có thể tạm đổi API thành http://localhost:8000/api
                const res = await axios.get(`${API}/products/builder-components`, { params });
                if (res.data && res.data.status === 'success') {
                    setComponents(res.data.data);
                } else {
                    setComponents([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải linh kiện:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComponents();
    }, [isOpen, slotType, slotId, activeBranch, currentBuild]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="text-xl font-bold text-gray-800">Chọn {slotType}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : components.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {components.map(comp => (
                                <div key={comp.id_sanpham} className="border border-gray-200 rounded-lg p-3 flex flex-col hover:shadow-md transition-shadow bg-white">
                                    <div className="h-32 mb-3 flex items-center justify-center">
                                        <img src={getImageUrl(comp.thumbail)} alt={comp.tensp} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2" title={comp.tensp}>{comp.tensp}</h4>
                                    
                                    <div className="text-xs text-gray-500 mb-2 flex-grow">
                                        {comp.specifications?.socket && <div>Socket: <strong>{comp.specifications.socket}</strong></div>}
                                        {comp.specifications?.power && <div>Công suất: <strong>{comp.specifications.power}</strong></div>}
                                        {comp.specifications?.brand && <div>Thương hiệu: <strong>{comp.specifications.brand}</strong></div>}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-red-600 font-bold">{formatCurrency(comp.gia)}</span>
                                        <button 
                                            onClick={() => onSelect(comp)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Chọn
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            <p className="text-lg">Không tìm thấy linh kiện phù hợp nào!</p>
                            <p className="text-sm mt-2">Gợi ý: Hệ thống chỉ hiển thị các linh kiện tương thích với cấu hình hiện tại của bạn.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentSelectModal;
