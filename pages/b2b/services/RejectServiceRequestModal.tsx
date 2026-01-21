import { useState, useEffect } from 'react';
import { FaTimesCircle, FaCheck } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface RejectServiceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export default function RejectServiceRequestModal({
    isOpen,
    onClose,
    onConfirm
}: RejectServiceRequestModalProps) {
    const [reason, setReason] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const t = useTranslations('modals.rejectService');
    const tCommon = useTranslations('common');

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200); // Animation duration
    };

    const handleConfirm = () => {
        if (reason) {
            onConfirm(reason);
            handleClose();
        }
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
                <div className="p-6">
                    {/* Header with Icon */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <FaTimesCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                {t('title')}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Reason Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('reasonLabel')}
                        </label>
                        <div className="relative">
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none cursor-pointer transition-all"
                            >
                                <option value="" disabled>{t('placeholder')}</option>
                                <option value="Technician not available">{t('reasons.technician')}</option>
                                <option value="Location out of service area">{t('reasons.location')}</option>
                                <option value="Duplicate request">{t('reasons.duplicate')}</option>
                                <option value="Incomplete information">{t('reasons.incomplete')}</option>
                                <option value="Other">{t('reasons.other')}</option>
                            </select>
                            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            {tCommon('actions.cancel')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!reason}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-gray-900 text-sm font-bold rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <FaCheck className="w-4 h-4" />
                            {t('confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
