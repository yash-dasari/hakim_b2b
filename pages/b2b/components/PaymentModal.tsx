import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCheck, FaInfoCircle, FaTools, FaQrcode, FaMoneyBillWave, FaUniversity, FaWallet, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { servicesAPI } from '../../../services/api/services.api';
import Swal from 'sweetalert2';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    request: {
        service?: { type?: string };
        customer?: { name?: string };
        booking_id?: string;
        service_cost?: string | number;
        [key: string]: unknown
    };
    amount?: string; // Legacy prop support
}

export default function PaymentModal({
    isOpen,
    onClose,
    onConfirm,
    request
}: PaymentModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'fib' | 'fastpay' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | null>(null);
    const [personalAppLink, setPersonalAppLink] = useState<string | null>(null);
    const [transactionDetails, setTransactionDetails] = useState<{ amount: string, currency: string } | null>(null);

    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const t = useTranslations('modals.collectPayment');
    const tCommon = useTranslations('common');

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setPaymentMethod(null);
            setQrCode(null);
            setRedirectUrl(null);
            setPaymentStatus(null);
            setTransactionDetails(null);
            setIsLoading(false);
        } else {
            // Cleanup on close
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleCashConfirm = () => {
        onConfirm();
        handleClose();
    };

    const handleInitiatePayment = async (provider: 'fib' | 'fastpay') => {
        if (!request?.booking_id) return;

        try {
            setIsLoading(true);
            setQrCode(null);
            setRedirectUrl(null);

            // Clean the cost string: remove currency symbols, commas, spaces
            // Keep digits and decimal point
            const cleanCost = String(request.service_cost || '').replace(/[^0-9.]/g, '');
            const amount = parseFloat(cleanCost) || 0;

            if (amount <= 0) {
                Swal.fire({
                    title: 'Invalid Amount',
                    text: 'Service cost is invalid or zero.',
                    icon: 'error'
                });
                setIsLoading(false);
                return;
            }

            // Initiate Payment
            const response = await servicesAPI.initiatePayment({
                booking_id: request.booking_id,
                amount: amount,
                currency: 'IQD',
                provider: provider
            });

            if (response && response.data) {
                setTransactionDetails({
                    amount: response.data.amount,
                    currency: response.data.currency
                });

                if (response.data.qr_code) {
                    setQrCode(response.data.qr_code);
                    setPersonalAppLink(response.data.personal_app_link);
                }

                if (response.data.redirect_url) {
                    setRedirectUrl(response.data.redirect_url);
                }

                setPaymentStatus('pending');
                startPolling(request.booking_id);
            } else {
                console.error('Invalid Response:', response);
                throw new Error('Failed to initiate payment');
            }
        } catch (error) {
            console.error(`${provider} Payment Error:`, error);
            Swal.fire({
                title: 'Error',
                text: `Failed to initiate ${provider === 'fib' ? 'FIB' : 'FastPay'} payment. Please try again.`,
                icon: 'error'
            });
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Alias for backward compatibility if needed, using the generic handler
    const handleInitiateFibPayment = () => handleInitiatePayment('fib');

    const startPolling = (bookingId: string) => {
        if (pollInterval.current) clearInterval(pollInterval.current);

        pollInterval.current = setInterval(async () => {
            try {
                const statusRes = await servicesAPI.checkPaymentStatus(bookingId);
                const statusData = statusRes?.data || statusRes;
                console.log('Poll Status:', statusRes);

                if (statusData?.payment_status === 'paid') {
                    setPaymentStatus('paid');
                    if (pollInterval.current) clearInterval(pollInterval.current);

                    Swal.fire({
                        title: 'Payment Successful',
                        text: 'FIB payment received successfully!',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    setTimeout(() => {
                        onConfirm();
                        handleClose();
                    }, 2000);
                } else if (statusData?.payment_status === 'failed') {
                    setPaymentStatus('failed');
                    if (pollInterval.current) clearInterval(pollInterval.current);
                }
            } catch (err) {
                console.warn('Polling error:', err);
            }
        }, 3000); // Poll every 3 seconds
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
                    {/* Service Info - Compact */}
                    <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FaTools className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                {request?.service?.type || t('serviceFallback')}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {t('customerLabel', { name: request?.customer?.name || t('customerUnknown') })}
                            </p>
                        </div>
                        <div className="ml-auto font-bold text-lg text-gray-900">
                            {transactionDetails ? (
                                `${transactionDetails.amount} ${transactionDetails.currency}`
                            ) : request?.service_cost ? (
                                `${String(request.service_cost).replace(/[^0-9.]/g, '')} IQD`
                            ) : (
                                <span className="text-red-500 text-sm">Cost Pending</span>
                            )}
                        </div>
                    </div>

                    {!request?.service_cost || request.service_cost === '0' || request.service_cost === 0 ? (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 text-red-600 mb-6">
                            <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                            <p className="text-sm">
                                Service cost is not available yet. You cannot proceed with payment until the cost is finalized.
                            </p>
                        </div>
                    ) : !paymentMethod ? (
                        // Method Selection
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 font-medium">Select Payment Method</p>

                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Cash Payment</div>
                                    <div className="text-xs text-gray-500">Confirm cash receipt manually</div>
                                </div>
                                <FaCheck className="ml-auto text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <button
                                onClick={() => {
                                    setPaymentMethod('fib');
                                    handleInitiatePayment('fib');
                                }}
                                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <FaUniversity className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">FIB (QR Code)</div>
                                    <div className="text-xs text-gray-500">Scan via FIB App</div>
                                </div>
                                <FaQrcode className="ml-auto text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <button
                                onClick={() => {
                                    setPaymentMethod('fastpay');
                                    handleInitiatePayment('fastpay');
                                }}
                                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <FaWallet className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">FastPay</div>
                                    <div className="text-xs text-gray-500">Pay via FastPay Wallet</div>
                                </div>
                                <FaExternalLinkAlt className="ml-auto text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    ) : paymentMethod === 'cash' ? (
                        // Cash Confirmation View
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 text-green-800">
                                <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Confirm Cash Receipt</p>
                                    <p className="text-xs opacity-80">Please ensure you have collected the full amount of <span className="font-bold">{request?.service_cost ? `${String(request.service_cost).replace(/[^0-9.]/g, '')} IQD` : 'Pending'}</span> from the customer.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPaymentMethod(null)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCashConfirm}
                                    className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                                >
                                    <FaCheck /> Confirm Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Digital Payment View (FIB or FastPay)
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
                            {isLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                    <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3 ${paymentMethod === 'fastpay' ? 'border-purple-500' : 'border-blue-500'}`}></div>
                                    <p className="text-sm font-medium">Initiating {paymentMethod === 'fastpay' ? 'FastPay' : 'FIB'} Payment...</p>
                                </div>
                            ) : (
                                <>
                                    {paymentMethod === 'fib' && qrCode && (
                                        <>
                                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mx-auto relative group">
                                                <img src={qrCode} alt="FIB QR Code" className="w-48 h-48 object-contain" />

                                                {paymentStatus === 'paid' && (
                                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm transition-all">
                                                        <div className="bg-green-100 p-3 rounded-full">
                                                            <FaCheck className="w-8 h-8 text-green-600" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-gray-900">Scan with FIB App</p>
                                                <p className="text-xs text-gray-500">Waiting for payment confirmation...</p>
                                                {personalAppLink && (
                                                    <a href={personalAppLink} target="_blank" rel="noreferrer" className="inline-block text-xs text-blue-600 hover:underline mt-2">
                                                        Open in FIB App
                                                    </a>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {paymentMethod === 'fastpay' && redirectUrl && (
                                        <div className="py-6 space-y-6">
                                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                                <FaWallet className="w-10 h-10 text-purple-600" />
                                            </div>

                                            <div>
                                                <p className="text-lg font-bold text-gray-900 mb-2">Continue to FastPay</p>
                                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                                    Please complete the payment on the FastPay secure gateway. We will automatically detect when you are done.
                                                </p>
                                            </div>

                                            {paymentStatus === 'paid' ? (
                                                <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                                    <FaCheck /> Payment Successful!
                                                </div>
                                            ) : (
                                                <a
                                                    href={redirectUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                >
                                                    <FaExternalLinkAlt /> Pay with FastPay
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Common Status/Cancel */}
                                    {!paymentStatus && !qrCode && !redirectUrl && (
                                        <div className="py-8 text-red-500">
                                            <p>Failed to initialize payment.</p>
                                            <button onClick={() => handleInitiatePayment(paymentMethod as 'fib' | 'fastpay')} className="mt-2 text-sm font-bold underline">Retry</button>
                                        </div>
                                    )}

                                    {(qrCode || redirectUrl) && (
                                        <div className="space-y-4">
                                            <div className={`text-xs p-3 rounded-lg flex items-center gap-2 justify-center ${paymentMethod === 'fastpay' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${paymentMethod === 'fastpay' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                                Waiting for payment confirmation...
                                            </div>

                                            <button
                                                onClick={() => setPaymentMethod(null)}
                                                className="text-gray-400 text-sm hover:text-gray-600 underline"
                                            >
                                                Cancel / Change Method
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
