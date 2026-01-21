import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaCar, FaTimes, FaPlus, FaFileUpload } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface AddCarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AddMethod = 'single' | 'bulk';

export default function AddCarModal({ isOpen, onClose }: AddCarModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<AddMethod>('single');
    const router = useRouter();
    const t = useTranslations('modals.addCar');
    const tCommon = useTranslations('common');

    const handleContinue = () => {
        if (selectedMethod === 'single') {
            router.push('/b2b/vehicles/add');
            onClose();
        } else if (selectedMethod === 'bulk') {
            router.push('/b2b/vehicles/bulk-upload');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">

                    {/* Header */}
                    <div className="p-8 pb-4 flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-[#FCD34D] rounded-xl flex items-center justify-center text-gray-900 shadow-sm shrink-0">
                                <FaCar className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
                                <p className="text-sm text-gray-500">{t('brand')}</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="px-8 pb-4">
                        <p className="text-sm text-gray-600">{t('subtitle')}</p>
                    </div>

                    {/* Options */}
                    <div className="px-8 space-y-4 mb-8">

                        {/* Single Car Option */}
                        <div
                            onClick={() => setSelectedMethod('single')}
                            className={`p-4 rounded-xl border-2 flex items-start gap-4 cursor-pointer transition-all ${selectedMethod === 'single'
                                ? 'border-blue-100 bg-blue-50/30'
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                <FaPlus />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{t('single.title')}</h3>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMethod === 'single'
                                        ? 'border-blue-500 text-blue-500'
                                        : 'border-gray-300'
                                        }`}>
                                        {selectedMethod === 'single' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                    {t('single.description')}
                                </p>
                            </div>
                        </div>

                        {/* Bulk Upload Option */}
                        <div
                            onClick={() => setSelectedMethod('bulk')}
                            className={`p-4 rounded-xl border-2 flex items-start gap-4 cursor-pointer transition-all ${selectedMethod === 'bulk'
                                ? 'border-green-100 bg-green-50/30'
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-lg flex items-center justify-center shrink-0">
                                <FaFileUpload />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{t('bulk.title')}</h3>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMethod === 'bulk'
                                        ? 'border-green-500 text-green-500' // Using green for bulk upload as per icon color, usually blue in figma but let's match icon
                                        : 'border-gray-300'
                                        }`}>
                                        {selectedMethod === 'bulk' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-[90%]">
                                    {t('bulk.description')}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {tCommon('actions.cancel')}
                        </button>
                        <button
                            onClick={handleContinue}
                            className="px-8 py-2.5 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 text-sm font-bold rounded-lg shadow-sm transition-colors"
                        >
                            {t('continue')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
