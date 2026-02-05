import { useState } from 'react';
import { FaFileInvoiceDollar, FaTruck, FaWrench, FaShieldAlt, FaTimes, FaCheckCircle, FaCalculator, FaClock } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface QuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    quotationData?: {
        reference_id?: string;
        booking_id?: string;
        created_at?: string;
        status?: string; // Added status
        currency?: string; // Added currency
        services?: Array<{
            quotation_service_id?: string;
            service_name?: string;
            name?: string;
            quantity?: number;
            discount_amount?: number;
            total_amount?: number;
            price?: number;
            quotation_addons?: Array<{ name?: string; price?: number }>;
        }>;
        parts?: Array<{
            id?: string;
            name?: string;
            quantity?: number;
            total_amount?: number;
        }>;
        service_price?: string;
        base_price?: string;
        service_catalog?: {
            base_price?: string;
            name?: string;
            description_structured?: Array<{ description?: string }>;
            warranty_info?: string;
        };
        transportation_cost?: string;
        total_amount?: string;
        [key: string]: unknown;
    };
    onAccept?: () => Promise<void> | void;
    onPayLater?: () => Promise<void> | void;
    onReject?: () => Promise<void> | void;
    acceptLabel?: string;
    rejectLabel?: string;
}

export default function QuotationModal({ isOpen, onClose, quotationData, onAccept, onPayLater, onReject, acceptLabel, rejectLabel }: QuotationModalProps) {
    const [processingAction, setProcessingAction] = useState<'accept' | 'reject' | 'payLater' | null>(null);
    const t = useTranslations('modals.quotation');

    const handleAction = async (action: 'accept' | 'reject' | 'payLater', handler?: () => Promise<void> | void) => {
        if (!handler) return;
        setProcessingAction(action);
        try {
            await handler();
        } finally {
            setProcessingAction(null);
        }
    };

    if (!isOpen || !quotationData) return null;

    const currencySymbol = quotationData.currency || ''; // Use provided currency or empty

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 my-8">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 end-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>

                    {/* Header Section - Yellow */}
                    <div className="bg-[#FCD34D] p-8 pb-10 relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="flex items-baseline gap-3 mb-1">
                                    <h2 className="text-2xl font-black text-gray-900">{t('title')}</h2>
                                    {quotationData.status === 'approved_by_customer' && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1 transform -translate-y-0.5">
                                            <FaCheckCircle /> {t('status.approved')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-800/70">{t('subtitle')}</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#FCD34D]">
                                <FaFileInvoiceDollar className="text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 -mt-6 bg-white rounded-t-3xl relative">

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('info.quotationId')}</p>
                                <p className="font-bold text-gray-900">{quotationData?.reference_id || quotationData?.booking_id?.substring(0, 8) || t('fallback.na')}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('info.dateIssued')}</p>
                                <p className="font-bold text-gray-900">
                                    {quotationData?.created_at
                                        ? new Date(quotationData.created_at).toLocaleDateString()
                                        : t('fallback.na')}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('info.validUntil')}</p>
                                <p className="font-bold text-gray-900">
                                    {quotationData?.created_at
                                        ? (() => {
                                            const date = new Date(quotationData.created_at);
                                            date.setDate(date.getDate() + 7);
                                            return date.toLocaleDateString();
                                        })()
                                        : t('fallback.na')}
                                </p>
                            </div>
                        </div>



                        {/* Fees Breakdown */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FaFileInvoiceDollar className="text-[#FCD34D]" /> {t('fees.title')}
                            </h3>

                            <div className="space-y-4">
                                {(() => {
                                    const services = quotationData?.services || [];
                                    const parts = quotationData?.parts || [];

                                    // If we have the new array structure, iterate
                                    if (services.length > 0 || parts.length > 0) {
                                        return (
                                            <>
                                                {/* Services */}
                                                {services.map((svc, idx: number) => (
                                                    <div key={svc.quotation_service_id || idx} className="py-2 border-b border-gray-50 last:border-0 border-dashed">
                                                        <div className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-[#FCD34D] group-hover:text-gray-900 transition-colors">
                                                                    <FaWrench className="text-sm" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">
                                                                        {svc.service_name || svc.name || t('fees.serviceItem', { index: services.length > 1 ? idx + 1 : '' })}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {t('fees.quantity', { count: svc.quantity ?? 0 })} {Number(svc.discount_amount) > 0 && <span className="text-green-600 ms-2">{t('fees.discount', { currency: currencySymbol, amount: svc.discount_amount ?? 0 })}</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="font-bold text-gray-900 block">
                                                                    {currencySymbol} {Number(svc.total_amount).toFixed(2)}
                                                                </span>
                                                                {Number(svc.discount_amount) > 0 && (
                                                                    <span className="text-xs text-gray-400 line-through">
                                                                        {currencySymbol} {Number(svc.price).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Addons */}
                                                        {svc.quotation_addons && svc.quotation_addons.length > 0 && (
                                                            <div className="mt-2 ps-14 pe-0 space-y-1">
                                                                {svc.quotation_addons.map((addon, aIdx: number) => (
                                                                    <div key={aIdx} className="flex justify-between text-xs text-gray-500">
                                                                        <span>+ {addon.name || t('fees.addOn')}</span>
                                                                        <span> {currencySymbol} {Number(addon.price || 0).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Parts */}
                                                {parts.map((part, idx: number) => (
                                                    <div key={part.id || idx} className="flex items-center justify-between group py-2 border-b border-gray-50 last:border-0 border-dashed">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 group-hover:text-blue-900 transition-colors">
                                                                <FaWrench className="text-sm" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {part.name || t('fees.replacementPart')}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {t('fees.qty', { count: part.quantity ?? 0 })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-gray-900">
                                                            {currencySymbol} {Number(part.total_amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </>
                                        );
                                    }

                                    // Fallback to old logic
                                    const servicePrice = Number(quotationData?.service_price) || Number(quotationData?.base_price) || Number(quotationData?.service_catalog?.base_price) || 0;
                                    const transportCost = Number(quotationData?.transportation_cost) || 0;

                                    return (
                                        <>
                                            {/* Service Cost */}
                                            <div className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-[#FCD34D] group-hover:text-gray-900 transition-colors">
                                                        <FaWrench className="text-sm" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {quotationData?.service_catalog?.name || t('fees.service')}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {quotationData?.service_catalog?.description_structured?.[0]?.description || t('fees.serviceCharges')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    {currencySymbol} {servicePrice.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Transportation Cost */}
                                            {transportCost > 0 && (
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-[#FCD34D] group-hover:text-gray-900 transition-colors">
                                                            <FaTruck className="text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{t('fees.transportation')}</p>
                                                            <p className="text-xs text-gray-500">{t('fees.transportationFees')}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-gray-900">
                                                        {currencySymbol} {transportCost.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-[#FEF3C7] p-5 rounded-xl flex items-center justify-between mb-8 border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-[#FCD34D]">
                                    <FaCalculator />
                                </div>
                                <span className="font-bold text-gray-900">{t('total.title')}</span>
                            </div>
                            <span className="text-2xl font-black text-gray-900">
                                {(() => {
                                    const servicePrice = Number(quotationData?.service_price) || Number(quotationData?.base_price) || Number(quotationData?.service_catalog?.base_price) || 0;
                                    const transportCost = Number(quotationData?.transportation_cost) || 0;
                                    const apiTotal = Number(quotationData?.total_amount) || 0;
                                    const displayTotal = apiTotal > 0 ? apiTotal : (servicePrice + transportCost);
                                    return `${currencySymbol} ${displayTotal.toFixed(2)}`;
                                })()}
                            </span>
                        </div>

                        {/* Warranty Details */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FaShieldAlt className="text-[#FCD34D]" /> {t('warranty.title')}
                            </h3>
                            <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex gap-4">
                                <div className="w-10 h-10 bg-[#22C55E] rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 mb-1">
                                        {quotationData?.service_catalog?.warranty_info || t('warranty.standard')}
                                    </p>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {t('warranty.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Only show if handlers provided */}
                        {/* Action Buttons - Only show if handlers provided AND NOT photo actions (which are shown above) */}
                        {(onAccept || onReject) && !acceptLabel?.toLowerCase().includes('photos') && !rejectLabel?.toLowerCase().includes('photos') && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                {onAccept && (
                                    <>
                                        <button
                                            onClick={() => handleAction('accept', onAccept)}
                                            disabled={processingAction !== null}
                                            className={`flex-1 py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group ${processingAction === 'accept' ? 'opacity-100' : (processingAction ? 'opacity-50 cursor-not-allowed' : '')}`}
                                        >
                                            {processingAction === 'accept' ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <FaCheckCircle className="text-white group-hover:scale-110 transition-transform" />
                                            )}
                                            {acceptLabel || t('actions.acceptPayNow')}
                                        </button>
                                        {onPayLater && (
                                            <button
                                                onClick={() => handleAction('payLater', onPayLater)}
                                                disabled={processingAction !== null}
                                                className={`flex-1 py-3.5 px-4 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${processingAction === 'payLater' ? 'opacity-100' : (processingAction ? 'opacity-50 cursor-not-allowed' : '')}`}
                                            >
                                                {processingAction === 'payLater' ? (
                                                    <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : <FaClock className="text-gray-900" />}
                                                {t('actions.acceptPayLater')}
                                            </button>
                                        )}
                                    </>
                                )}
                                {onReject && (
                                    <button
                                        onClick={() => handleAction('reject', onReject)}
                                        disabled={processingAction !== null}
                                        className={`flex-1 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${processingAction === 'reject' ? 'opacity-100' : (processingAction ? 'opacity-50 cursor-not-allowed' : '')}`}
                                    >
                                        {processingAction === 'reject' ? (
                                            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : <FaTimes className="text-gray-400" />}
                                        {rejectLabel || t('actions.reject')}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="mt-6 flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-blue-500 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] text-blue-600 leading-normal">
                                {t('disclaimer')}
                            </p>
                        </div>

                    </div>
                </div >
            </div >
        </div >
    );
}
