import { useState } from 'react';
import { FaMoneyBillWave, FaTimes, FaUniversity, FaBolt, FaBriefcase, FaInfoCircle } from 'react-icons/fa';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: string) => void;
    amount: string;
}

export default function PaymentModal({ isOpen, onClose, onConfirm, amount: _amount }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = () => {
        if (!selectedMethod) return;

        setIsProcessing(true);
        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false);
            onConfirm(selectedMethod);
        }, 1500);
    };

    const paymentMethods = [
        {
            id: 'FIB',
            name: 'FIB',
            icon: <FaUniversity className="w-6 h-6 text-blue-600" />,
            description: 'First Iraqi Bank - Instant transfer',
            iconBg: 'bg-blue-100'
        },
        {
            id: 'FastPay',
            name: 'FastPay',
            icon: <FaBolt className="w-6 h-6 text-purple-600" />,
            description: 'Quick and secure digital payment',
            iconBg: 'bg-purple-100'
        },
        {
            id: 'Cash',
            name: 'Cash',
            icon: <FaMoneyBillWave className="w-6 h-6 text-green-600" />,
            description: 'Pay with cash on delivery or pickup',
            iconBg: 'bg-green-100'
        }
    ];

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header - Yellow */}
                <div className="bg-[#FCD34D] px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <FaBriefcase className="text-gray-900 text-lg" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">HAKIM for Business</h2>
                            <p className="text-xs text-gray-800/80 font-medium">Select Payment Method</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-900 hover:text-gray-700 transition-colors"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">

                    <div className="mb-6">
                        <h3 className="text-base font-bold text-gray-900 mb-1">Choose your preferred payment method</h3>
                        <p className="text-sm text-gray-500">Select one option below to continue with your payment</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3 mb-6">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group
                  ${selectedMethod === method.id
                                        ? 'border-yellow-400 bg-white ring-1 ring-yellow-400'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }
                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg ${method.iconBg} flex items-center justify-center`}>
                                        {method.icon}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-gray-900">{method.name}</h4>
                                        <p className="text-xs text-gray-500">{method.description}</p>
                                    </div>
                                </div>

                                {/* Radio Circle */}
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                    ${selectedMethod === method.id
                                        ? 'border-yellow-400'
                                        : 'border-gray-300'
                                    }
                `}>
                                    {selectedMethod === method.id && (
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mb-8">
                        <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            <span className="font-bold">Note:</span> Your payment will be processed securely. You will receive a confirmation once the transaction is complete.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end items-center pt-2 border-t border-gray-50">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={!selectedMethod || isProcessing}
                            className={`px-8 py-2.5 font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-sm min-w-[120px]
                ${!selectedMethod || isProcessing
                                    ? 'bg-yellow-200 text-yellow-700/50 cursor-not-allowed shadow-none'
                                    : 'bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900'
                                }
              `}
                        >
                            {isProcessing ? 'Processing...' : 'Continue'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
