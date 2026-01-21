import { useState, useEffect } from 'react';
import {
    FaTimes,
    FaTruck,
    FaCalendarAlt,
    FaExclamationCircle,
    FaCheckCircle
} from 'react-icons/fa';
import apiClient from '../../../config/api.config';
import QuotationBuilderModal from './QuotationBuilderModal';
import { BookingListItem } from '../../../services/api/services.api';
import { useTranslations } from 'next-intl';

interface ServiceRequestDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceRequest: BookingListItem;
    onRefresh?: () => void;
}

export default function ServiceRequestDetailModal({
    isOpen,
    onClose,
    serviceRequest,
    onRefresh: _onRefresh
}: ServiceRequestDetailModalProps) {
    const [currentStatus, setCurrentStatus] = useState('');
    const [quoteStatus, setQuoteStatus] = useState('');
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [bookingDetails, setBookingDetails] = useState<Record<string, unknown> | null>(null);
    const [_loadingBookingDetails, setLoadingBookingDetails] = useState(false);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [quotations, setQuotations] = useState<Array<Record<string, unknown>>>([]);
    const t = useTranslations('modals.serviceRequestDetail');

    // Toast states
    const [cancelMessage, setCancelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [quoteStatusMessage, setQuoteStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch booking details when modal opens
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (isOpen && serviceRequest?.booking_id) {
                setLoadingBookingDetails(true);
                try {
                    const response = await apiClient.get(`/bookings/v1/bookings/${serviceRequest.booking_id}`);
                    if (response.data && response.data.success && response.data.data) {
                        setBookingDetails(response.data.data);

                        if (response.data.data.scheduled_at) {
                            const scheduledDate = new Date(response.data.data.scheduled_at);
                            const formattedDate = scheduledDate.toISOString().slice(0, 16);
                            setScheduledDateTime(formattedDate);
                        }

                        if (response.data.data.overall_status) {
                            setCurrentStatus(response.data.data.overall_status);
                        }

                        if (response.data.data.quote_status) {
                            setQuoteStatus(response.data.data.quote_status);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching booking details:', error);
                } finally {
                    setLoadingBookingDetails(false);
                }
            }
        };

        fetchBookingDetails();
    }, [isOpen, serviceRequest?.booking_id]);

    // Fetch quotations
    useEffect(() => {
        const fetchQuotations = async () => {
            if (isOpen && serviceRequest?.booking_id) {
                try {
                    const response = await apiClient.get(`/bookings/v1/quotations?booking_id=${serviceRequest.booking_id}`);
                    if (response.data && response.data.success && response.data.data) {
                        setQuotations(response.data.data.quotations || []);
                    }
                } catch (error) {
                    console.error('Error fetching quotations:', error);
                }
            }
        };
        fetchQuotations();
    }, [isOpen, serviceRequest?.booking_id]);

    // Handle Edit Quote (commented out in UI but kept for potential future use)
    // const handleEditQuote = () => {
    //     setIsQuotationModalOpen(true);
    // };

    // Merge booking details with service request for display
    const displayData = bookingDetails ? { ...serviceRequest, ...bookingDetails } : serviceRequest;

    if (!isOpen || !serviceRequest) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Toast Messages */}
            {(cancelMessage || quoteStatusMessage) && (
                <div className={`fixed top-4 end-4 z-[70] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md ${(cancelMessage?.type === 'success' || quoteStatusMessage?.type === 'success')
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-red-50 border-2 border-red-500'
                    }`}>
                    {(cancelMessage?.type === 'success' || quoteStatusMessage?.type === 'success') ? (
                        <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                    ) : (
                        <FaExclamationCircle className="text-red-600 text-xl flex-shrink-0" />
                    )}
                    <p className="font-medium text-gray-800">
                        {cancelMessage?.text || quoteStatusMessage?.text}
                    </p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header - Yellow */}
                <div className="bg-yellow-400 px-5 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-yellow-300 rounded-lg">
                            <FaTruck className="h-5 w-5 text-gray-900" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {t('title', { id: displayData.booking_id || displayData.reference_id || '--' })}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-gray-800">
                                <span className="bg-yellow-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                                    {((displayData as unknown) as { service_type_title?: string; service_name?: string; service_type?: string; [key: string]: unknown }).service_type_title || ((displayData as unknown) as { service_type_title?: string; service_name?: string; service_type?: string; [key: string]: unknown }).service_name || ((displayData as unknown) as { service_type_title?: string; service_name?: string; service_type?: string; [key: string]: unknown }).service_type || t('serviceFallback')}
                                </span>
                                <span className="opacity-75">
                                    {t('createdLabel')} {new Date((((displayData as unknown) as { created_at?: string; scheduled_at?: string; [key: string]: unknown }).created_at || ((displayData as unknown) as { created_at?: string; scheduled_at?: string; [key: string]: unknown }).scheduled_at || Date.now())).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-yellow-500 rounded-lg transition-colors text-gray-900"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                {/* Control Bar */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-6">
                        {/* Current Status */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                                {t('status.current')}
                            </label>
                            <div className="bg-white border border-gray-200 text-gray-900 px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm inline-block min-w-[100px] text-center">
                                {currentStatus || t('status.inProgress')}
                            </div>
                        </div>

                        {/* Quote Status */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                                {t('quoteStatus.label')}
                            </label>
                            <div className="bg-white border border-gray-200 text-gray-900 px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm inline-block min-w-[100px] text-center">
                                {quoteStatus || t('quoteStatus.pending')}
                            </div>
                        </div>

                        {/* Scheduled Date */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                                {t('scheduled.label')}
                            </label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    value={scheduledDateTime}
                                    readOnly
                                    className="bg-white border border-gray-200 text-gray-900 ps-3 pe-8 py-1.5 rounded-lg font-medium text-xs shadow-sm outline-none"
                                />
                                <FaCalendarAlt className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="flex items-center gap-2">
                        <button
                            onClick={handleEditQuote}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm text-xs"
                        >
                            <FaClipboardCheck className="w-3 h-3" />
                            Quotation
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm text-xs">
                            <FaTimesCircle className="w-3 h-3" />
                            Cancel
                        </button>
                    </div> */}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">

                        {/* Left Column: Info Cards */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Customer Information */}
                            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Customer Information</h3>
                                <div className="flex items-start gap-4">
                                    <img
                                        src={displayData.customer?.avatar || 'https://via.placeholder.com/64'}
                                        alt="Customer"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                                    />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{displayData.customer?.name || 'Unknown Request'}</h4>
                                        <p className="text-gray-500 text-xs mt-0.5">{displayData.customer?.phone || '--'}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">VIP Customer</span>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                            {/* Vehicle Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">{t('vehicle.title')}</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('vehicle.makeModel')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { vehicle?: { make?: string; model?: string; year?: number; [key: string]: unknown } | string; [key: string]: unknown };
                                                if (typeof data.vehicle === 'object' && data.vehicle) {
                                                    const vehicle = data.vehicle as { make?: string; model?: string; year?: number; [key: string]: unknown };
                                                    return `${vehicle.make || '--'} ${vehicle.model || '--'} ${vehicle.year || ''}`;
                                                } else if (typeof data.vehicle === 'string') {
                                                    return data.vehicle;
                                                }
                                                return '--';
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('vehicle.vin')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { vehicle?: { vin?: string; [key: string]: unknown } | string; [key: string]: unknown };
                                                if (typeof data.vehicle === 'object' && data.vehicle) {
                                                    const vehicle = data.vehicle as { vin?: string; [key: string]: unknown };
                                                    return vehicle.vin || '--';
                                                }
                                                return '--';
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('vehicle.plate')}</label>
                                        <p className="font-bold text-gray-900 text-xs">{((displayData as unknown) as { plate_number?: string; [key: string]: unknown }).plate_number || '--'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('vehicle.mileage')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { vehicle?: { mileage?: number; [key: string]: unknown } | string; [key: string]: unknown };
                                                if (typeof data.vehicle === 'object' && data.vehicle) {
                                                    const vehicle = data.vehicle as { mileage?: number; [key: string]: unknown };
                                                    if (vehicle.mileage) {
                                                        return t('vehicle.mileageValue', { value: vehicle.mileage });
                                                    }
                                                }
                                                return '--';
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('vehicle.color')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { vehicle?: { color?: string; [key: string]: unknown } | string; [key: string]: unknown };
                                                if (typeof data.vehicle === 'object' && data.vehicle) {
                                                    const vehicle = data.vehicle as { color?: string; [key: string]: unknown };
                                                    return vehicle.color || '--';
                                                }
                                                return '--';
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('vehicle.engine')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { vehicle?: { engine?: string; [key: string]: unknown } | string; [key: string]: unknown };
                                                if (typeof data.vehicle === 'object' && data.vehicle) {
                                                    const vehicle = data.vehicle as { engine?: string; [key: string]: unknown };
                                                    return vehicle.engine || '--';
                                                }
                                                return '--';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">{t('service.title')}</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('service.type')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { service?: { type?: string; [key: string]: unknown }; service_type_title?: string; service_type?: string; [key: string]: unknown };
                                                return data.service?.type || data.service_type_title || data.service_type || '--';
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('service.destination')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { dropoff_location?: { name?: string; [key: string]: unknown }; dropoff_address?: string; [key: string]: unknown };
                                                return data.dropoff_location?.name || data.dropoff_address || t('service.autoServiceCenter');
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('service.requestedDate')}</label>
                                        <p className="font-bold text-gray-900 text-xs">
                                            {(() => {
                                                const data = (displayData as unknown) as { created_at?: string; scheduled_at?: string; [key: string]: unknown };
                                                const created_at = data.created_at || data.scheduled_at || new Date().toISOString();
                                                const date = new Date(created_at);
                                                return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('service.distance')}</label>
                                        <p className="font-bold text-gray-900 text-xs">{t('service.distanceValue', { value: 8.5 })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Cost Breakdown */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-900">{t('cost.title')}</h3>
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                        {quoteStatus || t('quoteStatus.pending')}
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {/* Mock items for now, ideally map from quotations */}
                                    <div className="flex justify-between text-xs py-1.5 border-b border-dashed border-gray-100">
                                        <span className="text-gray-600">{t('cost.baseTow')}</span>
                                        <span className="font-bold text-gray-900">$85.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs py-1.5 border-b border-dashed border-gray-100">
                                        <span className="text-gray-600">{t('cost.addOns')}</span>
                                        <span className="font-bold text-gray-900">$25.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs py-1.5 border-b border-dashed border-gray-100">
                                        <span className="text-gray-600">{t('cost.transportation')}</span>
                                        <span className="font-bold text-gray-900">$17.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs py-1.5 border-b border-dashed border-gray-100">
                                        <span className="text-gray-600">{t('cost.inspection')}</span>
                                        <span className="font-bold text-gray-900">$10.16</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                        <span className="font-bold text-gray-900 text-xs">{t('cost.total')}</span>
                                        <span className="text-lg font-bold text-yellow-500">$137.16</span>
                                    </div>
                                </div>

                                {/* <div className="mt-6">
                                    <button
                                        onClick={handleEditQuote}
                                        className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors text-xs"
                                    >
                                        <FaEdit className="w-3 h-3" />
                                        Edit Quote
                                    </button>
                                </div> */}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Quotation Builder Modal */}
            {isQuotationModalOpen && (
                <QuotationBuilderModal
                    isOpen={isQuotationModalOpen}
                    onClose={() => setIsQuotationModalOpen(false)}
                    serviceRequest={serviceRequest}
                    existingQuotation={quotations.length > 0 ? quotations[0] : undefined}
                    onSave={async (_q) => {
                        setIsQuotationModalOpen(false);
                    }}
                    onSend={async (_q) => {
                        setIsQuotationModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
