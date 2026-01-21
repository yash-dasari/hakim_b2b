import { useState, useEffect } from 'react';
import {
    FaTimes,
    FaPlus,
    FaTrash,
    FaPaperPlane,
    FaSave
} from 'react-icons/fa';
import apiClient from '../../../config/api.config';
import { BookingListItem, ServiceCategory } from '../../../services/api/services.api';
import { useTranslations } from 'next-intl';

interface ServiceItem {
    id: number;
    type: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    cost: number;
    warranty: string;
    total: number;
}

interface PartItem {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    cost: number;
    warranty: string;
    total: number;
}

interface QuotationBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceRequest: BookingListItem;
    existingQuotation?: Record<string, unknown>;
    onSave?: (quotation: Record<string, unknown>) => void;
    onSend?: (quotation: Record<string, unknown>) => void;
}

export default function QuotationBuilderModal({
    isOpen,
    onClose,
    serviceRequest,
    existingQuotation,
    onSave,
    onSend
}: QuotationBuilderModalProps) {
    const [services, setServices] = useState<ServiceItem[]>([
        { id: 1, type: '', quantity: 1, unitPrice: 0, discount: 0, cost: 0, warranty: '3 Months', total: 0 }
    ]);
    const [parts, setParts] = useState<PartItem[]>([
        { id: 1, name: '', quantity: 1, unitPrice: 0, discount: 0, cost: 0, warranty: '6 Months', total: 0 }
    ]);
    const [validUntil, setValidUntil] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [_errorMessage, _setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const t = useTranslations('modals.quotationBuilder');
    const tCommon = useTranslations('common');

    // Fetch service categories
    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const response = await apiClient.get('/services/v1/catalog/categories');
                    if (response.data && response.data.success) {
                        setServiceCategories(response.data.data || []);
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    // Initialize with existing quotation if available
    useEffect(() => {
        if (existingQuotation) {
            // Map existing quotation data to state
            // For now, simpler implementation
        }
    }, [existingQuotation]);

    // Calculate totals
    const calculateTotals = () => {
        const servicesSubtotal = services.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        const partsSubtotal = parts.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        const inspectionFees = 0; // Fixed for now
        const subtotal = servicesSubtotal + partsSubtotal + inspectionFees;
        const totalAmount = subtotal; // Tax?

        return { servicesSubtotal, partsSubtotal, inspectionFees, subtotal, totalAmount };
    };

    const totals = calculateTotals();

    // Handlers
    const addService = () => {
        setServices([...services, { id: Date.now(), type: '', quantity: 1, unitPrice: 0, discount: 0, cost: 0, warranty: '3 Months', total: 0 }]);
    };

    const removeService = (id: number) => {
        setServices(services.filter(s => s.id !== id));
    };

    const updateService = (id: number, field: string, value: string | number) => {
        setServices(services.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                // Recalculate total if price/qty/discount changes
                if (['quantity', 'unitPrice', 'discount'].includes(field)) {
                    const qty = field === 'quantity' ? Number(value) : Number(s.quantity);
                    const price = field === 'unitPrice' ? Number(value) : Number(s.unitPrice);
                    const discount = field === 'discount' ? Number(value) : Number(s.discount);
                    updated.cost = (qty * price);
                    updated.total = Math.max(0, updated.cost - discount);
                }
                return updated;
            }
            return s;
        }));
    };

    const addPart = () => {
        setParts([...parts, { id: Date.now(), name: '', quantity: 1, unitPrice: 0, discount: 0, cost: 0, warranty: '6 Months', total: 0 }]);
    };

    const removePart = (id: number) => {
        setParts(parts.filter(p => p.id !== id));
    };

    const updatePart = (id: number, field: string, value: string | number) => {
        setParts(parts.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };
                if (['quantity', 'unitPrice', 'discount'].includes(field)) {
                    const qty = field === 'quantity' ? Number(value) : Number(p.quantity);
                    const price = field === 'unitPrice' ? Number(value) : Number(p.unitPrice);
                    const discount = field === 'discount' ? Number(value) : Number(p.discount);
                    updated.cost = (qty * price);
                    updated.total = Math.max(0, updated.cost - discount);
                }
                return updated;
            }
            return p;
        }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSuccessMessage(t('alerts.saved'));
            setIsSubmitting(false);
            if (onSave) onSave({ services, parts, totals, validUntil, internalNotes });
        }, 1000);
    };

    const handleSend = async () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSuccessMessage(t('alerts.sent'));
            setIsSubmitting(false);
            if (onSend) onSend({ services, parts, totals, validUntil, internalNotes });
        }, 1000);
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-[90vw] h-[90vh] flex flex-col overflow-hidden">

                {/* Header - Yellow */}
                <div className="bg-yellow-400 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
                        <div className="text-sm font-medium text-gray-800 mt-1 opacity-90">
                            {t('header', {
                                id: serviceRequest?.booking_id || serviceRequest?.reference_id || 'SR-2024-001',
                                category: serviceRequest?.category || t('serviceFallback'),
                                plate: serviceRequest?.plate_number || t('fallback.na')
                            })}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-yellow-500 rounded-lg transition-colors text-gray-900">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Builder */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Services Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">{t('services.title')}</h3>
                                <button onClick={addService} className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm flex items-center gap-2">
                                    <FaPlus className="w-3 h-3" /> {t('services.add')}
                                </button>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-4">{t('services.columns.service')}</div>
                                <div className="col-span-1">{t('services.columns.qty')}</div>
                                <div className="col-span-1">{t('services.columns.price')}</div>
                                <div className="col-span-1">{t('services.columns.discount')}</div>
                                <div className="col-span-1">{t('services.columns.cost')}</div>
                                <div className="col-span-2">{t('services.columns.warranty')}</div>
                                <div className="col-span-1">{t('services.columns.total')}</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="space-y-3">
                                {services.map((service) => (
                                    <div key={service.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="col-span-4">
                                            <select
                                                value={service.type}
                                                onChange={(e) => updateService(service.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            >
                                                <option value="">{t('services.select')}</option>
                                                {serviceCategories.map((cat) => (
                                                    <option key={cat.category_id || cat.name} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={service.quantity}
                                                onChange={(e) => updateService(service.id, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={service.unitPrice}
                                                onChange={(e) => updateService(service.id, 'unitPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={service.discount}
                                                onChange={(e) => updateService(service.id, 'discount', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center font-medium text-gray-700 text-sm">
                                            {service.cost}
                                        </div>
                                        <div className="col-span-2">
                                            <select
                                                value={service.warranty}
                                                onChange={(e) => updateService(service.id, 'warranty', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                            >
                                                <option value="No Warranty">{t('warranty.none')}</option>
                                                <option value="1 Month">{t('warranty.oneMonth')}</option>
                                                <option value="3 Months">{t('warranty.threeMonths')}</option>
                                                <option value="6 Months">{t('warranty.sixMonths')}</option>
                                                <option value="1 Year">{t('warranty.oneYear')}</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 text-center font-bold text-gray-900 text-sm">
                                            {service.total}
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button onClick={() => removeService(service.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Parts Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">{t('parts.title')}</h3>
                                <button onClick={addPart} className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm flex items-center gap-2">
                                    <FaPlus className="w-3 h-3" /> {t('parts.add')}
                                </button>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-4">{t('parts.columns.part')}</div>
                                <div className="col-span-1">{t('parts.columns.qty')}</div>
                                <div className="col-span-1">{t('parts.columns.price')}</div>
                                <div className="col-span-1">{t('parts.columns.discount')}</div>
                                <div className="col-span-1">{t('parts.columns.cost')}</div>
                                <div className="col-span-2">{t('parts.columns.warranty')}</div>
                                <div className="col-span-1">{t('parts.columns.total')}</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="space-y-3">
                                {parts.map((part) => (
                                    <div key={part.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="col-span-4">
                                            <input
                                                type="text"
                                                value={part.name}
                                                onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                                                placeholder={t('parts.namePlaceholder')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={part.quantity}
                                                onChange={(e) => updatePart(part.id, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={part.unitPrice}
                                                onChange={(e) => updatePart(part.id, 'unitPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={part.discount}
                                                onChange={(e) => updatePart(part.id, 'discount', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center font-medium text-gray-700 text-sm">
                                            {part.cost}
                                        </div>
                                        <div className="col-span-2">
                                            <select
                                                value={part.warranty}
                                                onChange={(e) => updatePart(part.id, 'warranty', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                            >
                                                <option value="No Warranty">{t('warranty.none')}</option>
                                                <option value="1 Month">{t('warranty.oneMonth')}</option>
                                                <option value="3 Months">{t('warranty.threeMonths')}</option>
                                                <option value="6 Months">{t('warranty.sixMonths')}</option>
                                                <option value="1 Year">{t('warranty.oneYear')}</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 text-center font-bold text-gray-900 text-sm">
                                            {part.total}
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button onClick={() => removePart(part.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Summary & Actions */}
                    <div className="w-[350px] bg-white border-l border-gray-200 p-6 overflow-y-auto hidden lg:flex flex-col gap-6">

                        {/* Quote Summary */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('summary.title')}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('summary.servicesSubtotal')}</span>
                                    <span className="font-bold text-gray-900">{totals.servicesSubtotal} IQD</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('summary.partsSubtotal')}</span>
                                    <span className="font-bold text-gray-900">{totals.partsSubtotal} IQD</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('summary.inspectionFees')}</span>
                                    <span className="font-bold text-gray-900">{totals.inspectionFees} IQD</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                                    <span>{t('summary.subtotal')}</span>
                                    <span className="font-bold text-gray-900">{totals.subtotal} IQD</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                                    <span className="font-extrabold text-gray-900 text-lg">{t('summary.total')}</span>
                                    <span className="font-extrabold text-gray-900 text-xl">{totals.totalAmount} IQD</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</label>
                                    <p className="font-bold text-gray-900 text-sm">{serviceRequest?.customer?.name || 'Ahmad Ali'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                                    <p className="font-bold text-gray-900 text-sm">{serviceRequest?.customer?.phone || '+964 751 385 5366'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Vehicle</label>
                                    <p className="font-bold text-gray-900 text-sm">{serviceRequest?.vehicle?.year} {serviceRequest?.vehicle?.make} {serviceRequest?.vehicle?.model}</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">License Plate</label>
                                    <p className="font-bold text-gray-900 text-sm">{serviceRequest?.vehicle?.plate || 'ABC 1234'}</p>
                                </div>
                            </div>
                        </div> */}

                        {/* Quote Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('actions.title')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('actions.validUntil')}</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={validUntil}
                                            onChange={(e) => setValidUntil(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('actions.internalNotes')}</label>
                                    <textarea
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        rows={3}
                                        placeholder={t('actions.internalNotesPlaceholder')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-yellow-400 resize-none"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={handleSend}
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaPaperPlane className="w-4 h-4" /> {t('actions.send')}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaSave className="w-4 h-4" /> {t('actions.saveDraft')}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTimes className="w-4 h-4" /> {tCommon('actions.cancel')}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
