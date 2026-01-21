import React from 'react';
import { FaTimes, FaHandshake, FaCar, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface ConfirmCarReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmCarReceiptModal({ isOpen, onClose, onConfirm }: ConfirmCarReceiptModalProps) {
    const t = useTranslations('modals.confirmReceipt');
    const tCommon = useTranslations('common');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">

                {/* Header */}
                <div className="bg-[#FCD34D] px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-gray-900">
                            <FaCar />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-sm">{t('brand')}</h3>
                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{t('brandSuffix')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-800 hover:text-black transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">

                    {/* Handshake Icon */}
                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-[#FCD34D] text-3xl mb-6">
                        <FaHandshake />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t('title')}</h2>
                    <p className="text-sm text-gray-500 mb-8 max-w-[280px]">
                        {t('message')}
                        <br />
                        <span className="text-xs text-gray-400 mt-1 block">{t('warning')}</span>
                    </p>

                    {/* Vehicle Card */}
                    <div className="w-full bg-gray-50 rounded-xl p-4 flex items-center gap-4 mb-6 border border-gray-100 text-start">
                        <div className="w-10 h-10 bg-[#FCD34D] rounded-lg flex items-center justify-center text-gray-900 flex-shrink-0">
                            <FaCar />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">{t('vehicle.placeholderTitle')}</h4>
                            <p className="text-xs text-gray-500">{t('vehicle.license', { value: t('vehicle.placeholderLicense') })}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{t('vehicle.bookingId', { value: t('vehicle.placeholderBooking') })}</p>
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div className="w-full bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 text-start mb-8">
                        <FaExclamationTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h5 className="text-xs font-bold text-orange-800 mb-1">{t('notice.title')}</h5>
                            <p className="text-[10px] text-orange-700 leading-relaxed">
                                {t('notice.message')}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FaTimes className="text-xs" /> {tCommon('actions.cancel')}
                            </span>
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 font-bold rounded-xl transition-colors text-sm shadow-sm"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FaCheck className="text-xs" /> {t('actions.confirm')}
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
