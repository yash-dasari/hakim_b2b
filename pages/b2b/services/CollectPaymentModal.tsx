import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaInfoCircle, FaTools } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface CollectPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    request: { service?: { type?: string }; customer?: { name?: string }; booking_id?: string; [key: string]: unknown };
}

export default function CollectPaymentModal({
    isOpen,
    onClose,
    onConfirm,
    request
}: CollectPaymentModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const t = useTranslations('modals.collectPayment');
    const tCommon = useTranslations('common');

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-200 ${isClosing ? 'scale-95' : 'scale-100'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Service Info */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FaTools className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 leading-tight mb-0.5">
                                {request?.service?.type || t('serviceFallback')}
                            </h3>
                            <p className="text-sm text-gray-500 leading-tight">
                                {t('customerLabel', { name: request?.customer?.name || t('customerUnknown') })}
                            </p>
                        </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('breakdown.serviceFee')}</span>
                            <span className="font-medium text-gray-900">$120.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('breakdown.parts')}</span>
                            <span className="font-medium text-gray-900">$25.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('breakdown.inspection')}</span>
                            <span className="font-medium text-gray-900">$5.00</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-900">{t('breakdown.total')}</span>
                            <span className="text-xl font-bold text-gray-900">150.00 IQD</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-6">
                        <FaInfoCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800 mb-1">
                                {t('confirmation.title')}
                            </p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                {t('confirmation.message')}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            {tCommon('actions.cancel')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-3 bg-yellow-400 text-gray-900 text-sm font-bold rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaCheck className="w-3 h-3" />
                            {t('actions.received')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
