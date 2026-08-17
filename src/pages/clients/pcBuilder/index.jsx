import React, { useState } from 'react';
import MasterLayout from '../theme/masterLayout';
import { formatCurrency } from '../../../utils/formatter';
import ComponentSelectModal from './ComponentSelectModal';
import { getImageUrl } from '../../../utils/getImageUrl';

const BUILD_SLOTS = [
    { id: 'cpu', label: 'Vi xử lý (CPU)', type: 'CPU' },
    { id: 'mainboard', label: 'Bo mạch chủ (Mainboard)', type: 'Mainboard' },
    { id: 'ram', label: 'Bộ nhớ RAM', type: 'RAM' },
    { id: 'vga', label: 'Card màn hình (VGA)', type: 'VGA' },
    { id: 'ssd', label: 'Ổ cứng SSD', type: 'SSD' },
    { id: 'psu', label: 'Nguồn (PSU)', type: 'PSU' },
    { id: 'case', label: 'Vỏ Case', type: 'Case' }
];

const PcBuilder = () => {
    const [selectedComponents, setSelectedComponents] = useState({});
    const [activeSlot, setActiveSlot] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSelectComponent = (slotId, component) => {
        // Validate TC-36: Incompatible components
        if (slotId === 'cpu' && selectedComponents['mainboard']) {
            if (component.specifications?.socket !== selectedComponents['mainboard'].specifications?.socket) {
                setErrorMsg('Linh kiện không tương thích! CPU và Mainboard khác Socket.');
                return false;
            }
        }
        if (slotId === 'mainboard' && selectedComponents['cpu']) {
            if (component.specifications?.socket !== selectedComponents['cpu'].specifications?.socket) {
                setErrorMsg('Linh kiện không tương thích! CPU và Mainboard khác Socket.');
                return false;
            }
        }

        setSelectedComponents(prev => ({ ...prev, [slotId]: component }));
        setErrorMsg('');
        setModalOpen(false);
        return true;
    };

    const handleRemoveComponent = (slotId) => {
        setSelectedComponents(prev => {
            const next = { ...prev };
            delete next[slotId];
            return next;
        });
        setErrorMsg('');
    };

    const openModal = (slot) => {
        setActiveSlot(slot);
        setModalOpen(true);
        setErrorMsg('');
    };

    const totalPrice = Object.values(selectedComponents).reduce((sum, item) => sum + (item?.gia || 0), 0);

    // Tính toán công suất
    const psuWattMatch = selectedComponents['psu']?.tensp?.match(/(\d+)W/i);
    const psuWatt = psuWattMatch ? parseInt(psuWattMatch[1]) : 0;
    
    let requiredPower = 0;
    if (selectedComponents['vga'] && selectedComponents['vga'].specifications?.power) {
        requiredPower = parseInt(selectedComponents['vga'].specifications.power.replace('W', '')) || 0;
    } else if (selectedComponents['cpu']) {
        requiredPower = 200; // Default minimum if no VGA
    }

    const isPowerInsufficient = selectedComponents['psu'] && psuWatt < requiredPower;

    const missingEssentials = [];
    if (!selectedComponents['cpu']) missingEssentials.push('CPU');
    if (!selectedComponents['mainboard']) missingEssentials.push('Mainboard');
    if (!selectedComponents['ram']) missingEssentials.push('RAM');
    if (!selectedComponents['psu']) missingEssentials.push('Nguồn (PSU)');

    const handleCompleteBuild = () => {
        if (missingEssentials.length > 0) {
            setErrorMsg(`Bạn chưa chọn đủ các linh kiện thiết yếu: ${missingEssentials.join(', ')}`);
            return;
        }
        if (isPowerInsufficient) {
            setErrorMsg('Nguồn không đủ công suất để hệ thống hoạt động ổn định! Vui lòng chọn nguồn cao hơn.');
            return;
        }
        alert('Cấu hình hợp lệ! (Có thể chuyển tới trang thanh toán ở bước tiếp theo)');
    };

    return (
        <MasterLayout title="Tự Build PC - ToiYeuPC">
            <div className="container mx-auto px-4 py-8" style={{ minHeight: '60vh' }}>
                <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Tự Build PC</h1>
                
                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center max-w-4xl mx-auto mb-6 font-semibold shadow-sm">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Cấu Hình Của Bạn</h2>
                        <div className="text-xl font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                            Tổng cộng: {formatCurrency(totalPrice)}
                        </div>
                    </div>
                    
                    <div className="p-0">
                        {BUILD_SLOTS.map(slot => {
                            const selected = selectedComponents[slot.id];
                            return (
                                <div key={slot.id} className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="w-full md:w-1/4 font-semibold text-gray-700 mb-2 md:mb-0">
                                        {slot.label}
                                    </div>
                                    <div className="w-full md:w-2/4 px-2 mb-3 md:mb-0 flex items-center justify-center md:justify-start">
                                        {selected ? (
                                            <div className="flex items-center gap-4 w-full">
                                                <img src={getImageUrl(selected.thumbail)} alt="" className="w-16 h-16 object-contain rounded border border-gray-200 bg-white shadow-sm flex-shrink-0" />
                                                <div className="flex-grow">
                                                    <div className="font-bold text-gray-800 line-clamp-2">{selected.tensp}</div>
                                                    <div className="text-red-600 font-semibold">{formatCurrency(selected.gia)}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 italic">Chưa chọn linh kiện</div>
                                        )}
                                    </div>
                                    <div className="w-full md:w-1/4 flex justify-end gap-2">
                                        {selected ? (
                                            <>
                                                <button onClick={() => openModal(slot)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium text-sm">
                                                    Đổi
                                                </button>
                                                <button onClick={() => handleRemoveComponent(slot.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium text-sm">
                                                    Xóa
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => openModal(slot)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm w-full md:w-auto">
                                                + Chọn {slot.type}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {isPowerInsufficient && (
                    <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative text-center max-w-4xl mx-auto mb-6 font-bold shadow-md">
                        ⚠️ Nguồn không đủ công suất! (Tổng điện yêu cầu: {requiredPower}W, Nguồn: {psuWatt}W)
                    </div>
                )}

                <div className="max-w-4xl mx-auto flex justify-end">
                    <button 
                        onClick={handleCompleteBuild}
                        disabled={missingEssentials.length > 0}
                        className={`px-8 py-3 rounded-lg font-bold text-lg text-white transition-all shadow-md ${missingEssentials.length > 0 ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-700'}`}
                        title={missingEssentials.length > 0 ? `Thiếu: ${missingEssentials.join(', ')}` : ''}
                    >
                        Hoàn tất bộ máy
                    </button>
                </div>
            </div>

            {modalOpen && activeSlot && (
                <ComponentSelectModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    slotType={activeSlot.type}
                    slotId={activeSlot.id}
                    onSelect={(comp) => handleSelectComponent(activeSlot.id, comp)}
                    currentBuild={selectedComponents}
                />
            )}
        </MasterLayout>
    );
};

export default PcBuilder;
