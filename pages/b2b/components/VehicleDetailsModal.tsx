import React from 'react';
import { FaTimes, FaCar, FaBarcode, FaRoad, FaCalendarAlt, FaIdCard } from 'react-icons/fa';

interface VehicleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: {
        make?: string;
        model?: string;
        year?: number;
        color?: string;
        plateNumber?: string;
        vin?: string;
        mileage?: number;
        isOngoing?: boolean;
        lastServiceDate?: string;
        vehicleId?: string;
        id?: string;
        [key: string]: unknown;
    };
}

export default function VehicleDetailsModal({ isOpen, onClose, vehicle }: VehicleDetailsModalProps) {
    if (!isOpen || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl transform transition-all animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FCD34D]/20 rounded-xl flex items-center justify-center text-[#F59E0B]">
                            <FaCar className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</h2>
                            <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Vehicle Information</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FaIdCard className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">License Plate</p>
                                    <p className="font-bold text-gray-900 text-lg">{vehicle.plateNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaBarcode className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">VIN Number</p>
                                    <p className="font-medium text-gray-900 font-mono">{vehicle.vin || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaRoad className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">Mileage</p>
                                    <p className="font-medium text-gray-900">{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status & Service */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Service Status</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full ${vehicle.isOngoing ? 'bg-orange-500' : 'bg-green-500'}`} />
                                <div>
                                    <p className="text-xs text-gray-500">Current Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${vehicle.isOngoing
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                        {vehicle.isOngoing ? 'Ongoing Service' : 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaCalendarAlt className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">Last Service Date</p>
                                    <p className="font-medium text-gray-900">{vehicle.lastServiceDate}</p>
                                </div>
                            </div>

                            {/* Internal ID */}
                            <div className="flex items-start gap-3">
                                <div className="text-xs text-gray-300 font-mono mt-1">ID</div>
                                <div>
                                    <p className="text-xs text-gray-500">System ID</p>
                                    <p className="text-xs text-gray-400 font-mono">{vehicle.vehicleId || vehicle.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
