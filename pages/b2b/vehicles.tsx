import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import AddCarModal from './components/AddCarModal';
import { useRouter } from 'next/router';
import { FaCar, FaWrench, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { vehiclesAPI } from '../../services/api/vehicles.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Swal from 'sweetalert2';
import VehicleDetailsModal from './components/VehicleDetailsModal';
import { useTranslations } from 'next-intl';

interface Vehicle {
    id: string;
    vehicleId: string;
    make: string;
    model: string;
    year: string;
    color: string;
    plateNumber: string;
    vin: string;
    mileage?: string; // Added mileage
    brandId?: string; // Optional ID for robust editing
    modelId?: string; // Optional ID for robust editing
    lastServiceDate: string;
    isOngoing?: boolean;
}

export default function B2BVehicles() {
    const [isAddCarModalOpen, setIsAddCarModalOpen] = React.useState(false);
    const t = useTranslations('vehicles');

    // View Modal State
    const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState<string | undefined>(undefined);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalVehicles, setTotalVehicles] = React.useState(0);

    const router = useRouter();
    const { company } = useSelector((state: RootState) => state.auth);

    // Debounce search term
    const [debouncedSearch, setDebouncedSearch] = React.useState(search);

    console.log('🔍 B2BVehicles Debug:', { company, debouncedSearch, status, page });

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page on filter change
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status]);

    React.useEffect(() => {
        const fetchVehicles = async () => {
            console.log('🔄 Effect triggered. Company ID:', company?.id);

            if (company?.id) {
                try {
                    setLoading(true);
                    console.log('🚀 Fetching vehicles...');
                    const response = await vehiclesAPI.getVehicles(company.id, {
                        search: debouncedSearch || undefined,
                        status: status,
                        page: page,
                        per_page: 10
                    });

                    if (response.success && response.data?.vehicles) {
                        const data = response.data.vehicles;

                        // Map API response to UI model
                        const mappedVehicles: Vehicle[] = data
                            .map((v: { id?: string; vehicle_id?: string; vehicle_reference_id?: string; make?: string; model?: string; year?: string; color?: string; license_plate?: string; vin?: string; mileage_number?: string; brand_id?: string; model_id?: string; last_service_date?: string; status?: string }): Vehicle => ({
                                id: v.id || v.vehicle_id || '', // Fallback if id is missing
                                vehicleId: v.vehicle_reference_id || '', // Ensure it's always a string
                                make: v.make || t('fallback.unknown'),
                                model: v.model || t('fallback.unknown'),
                                year: v.year || '',
                                color: v.color || '',
                                plateNumber: v.license_plate || '',
                                vin: v.vin || '',
                                mileage: v.mileage_number, // Map mileage (optional)
                                brandId: v.brand_id, // Capture ID if available
                                modelId: v.model_id, // Capture ID if available
                                lastServiceDate: v.last_service_date || t('fallback.na'),
                                isOngoing: v.status === 'ongoing' // Example logic
                            }))
                            .filter((v) => !!v.id && !!v.vehicleId) as Vehicle[]; // Filter out vehicles without IDs
                        setVehicles(mappedVehicles);
                        setTotalVehicles(response.data.total || 0);
                        setTotalPages(Math.ceil((response.data.total || 0) / 10));
                    } else {
                        console.error("Failed to fetch vehicles: Unsuccessful response", response);
                        setVehicles([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch vehicles", error);
                    setVehicles([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchVehicles();
    }, [company, debouncedSearch, status, page, t]);

    const handleDelete = async (vehicleId: string) => {
        const result = await Swal.fire({
            title: t('alerts.delete.title'),
            text: t('alerts.delete.text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: t('alerts.delete.confirm')
        });

        if (result.isConfirmed) {
            try {
                const response = await vehiclesAPI.deleteVehicle(vehicleId);

                if (response.success || response.message === 'Vehicle deleted successfully') {
                    // Remove from UI immediately
                    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
                    setTotalVehicles(prev => Math.max(0, prev - 1));

                    Swal.fire(
                        t('alerts.deleted.title'),
                        t('alerts.deleted.text'),
                        'success'
                    );
                } else {
                    throw new Error(response.message || t('alerts.deleted.failed'));
                }

            } catch (error: unknown) {
                console.error('Delete failed', error);
                const errorObj = error as { response?: { data?: { message?: string } } };
                Swal.fire(
                    t('alerts.error.title'),
                    errorObj?.response?.data?.message || t('alerts.error.deleteFailed'),
                    'error'
                );
            }
        }
    };

    const handleView = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsViewModalOpen(true);
    };

    return (
        <AdminLayout
            title={t('title')}
            subtitle={t('subtitle')}
            headerActions={
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/b2b/services/create')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                    >
                        <FaWrench className="text-gray-400 text-xs" /> {t('actions.requestService')}
                    </button>
                    <button
                        onClick={() => setIsAddCarModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FCD34D] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#FBBF24] shadow-sm"
                    >
                        <span className="text-lg leading-none">+</span> {t('actions.addCar')}
                    </button>
                </div>
            }
        >
            <div className="space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Number of Cars */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-2">{t('stats.numberOfCars')}</p>
                            <h3 className="text-4xl font-black text-gray-900 mb-2">{totalVehicles}</h3>
                            {/* <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block">Active Fleet</p> */}
                        </div>
                        <div className="w-12 h-12 bg-[#FCD34D] rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
                            <FaCar className="text-xl" />
                        </div>
                    </div>

                    {/* Active Services */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-2">{t('stats.activeServices')}</p>
                            <h3 className="text-4xl font-black text-gray-900 mb-2">7</h3>
                            <p className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded inline-block">{t('stats.scheduledThisWeek', { count: 3 })}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#FCD34D] rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
                            <FaWrench className="text-xl" />
                        </div>
                    </div>
                </div>

                {/* Section */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 pt-6 pb-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('fleet.title')}</h2>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder={t('fleet.searchPlaceholder')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full ps-9 pe-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent bg-white"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStatus(undefined)}
                                    className={`px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-bold min-w-[120px] ${!status ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {t('filters.allStatus')}
                                </button>
                                <button
                                    onClick={() => setStatus('Ongoing')}
                                    className={`px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-bold min-w-[120px] ${status === 'Ongoing' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {t('filters.ongoing')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                                    <th className="px-6 py-4">{t('table.vehicleId')}</th>
                                    <th className="px-6 py-4">{t('table.makeModelYear')}</th>
                                    <th className="px-6 py-4">{t('table.plateNumber')}</th>
                                    <th className="px-6 py-4">{t('table.vinNumber')}</th>
                                    <th className="px-6 py-4">{t('table.lastServiceDate')}</th>
                                    <th className="px-6 py-4 text-end">{t('table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                ) : vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">{t('table.empty')}</td>
                                    </tr>
                                ) : (
                                    vehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5 text-sm font-bold text-gray-900">{vehicle.vehicleId}</td>
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                {vehicle.make} {vehicle.model} <span className="text-gray-400 ms-1">{vehicle.year}</span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">{vehicle.plateNumber}</td>
                                            <td className="px-6 py-5 text-sm text-gray-500 font-mono tracking-tight">{vehicle.vin}</td>
                                            <td className="px-6 py-5">
                                                {vehicle.isOngoing ? (
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                                                        {t('status.ongoing')}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-600">{vehicle.lastServiceDate}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end items-center gap-3">
                                                    <button
                                                        onClick={() => handleView(vehicle)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <FaEye className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push({
                                                            pathname: '/b2b/vehicles/edit',
                                                            query: {
                                                                id: vehicle.id,
                                                                make: vehicle.make,
                                                                model: vehicle.model,
                                                                makeId: vehicle.brandId, // Pass ID
                                                                modelId: vehicle.modelId, // Pass ID
                                                                year: vehicle.year,
                                                                color: vehicle.color,
                                                                plate: vehicle.plateNumber,
                                                                vin: vehicle.vin,
                                                                mileage: (vehicle as Vehicle & { mileage_number?: string }).mileage_number
                                                            }
                                                        })}
                                                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(vehicle.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
                            <p className="text-xs text-gray-500">
                                {t('pagination.showing', {
                                    start: vehicles.length > 0 ? (page - 1) * 10 + 1 : 0,
                                    end: Math.min(page * 10, totalVehicles),
                                    total: totalVehicles
                                })}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`px-3 py-1 text-xs font-bold border border-gray-200 rounded ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {t('pagination.previous')}
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show pages around current page could be more complex, 
                                    // but keeping it simple for now or showing first 5
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && page > 3) {
                                        pageNum = page - 2 + i;
                                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded shadow-sm ${page === pageNum ? 'bg-[#FCD34D] text-gray-900' : 'text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || totalPages === 0}
                                    className={`px-3 py-1 text-xs font-bold border border-gray-200 rounded ${page === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {t('pagination.next')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddCarModal
                isOpen={isAddCarModalOpen}
                onClose={() => setIsAddCarModalOpen(false)}
            />
            {selectedVehicle && (
                <VehicleDetailsModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    vehicle={{
                        ...selectedVehicle,
                        year: selectedVehicle.year ? (isNaN(Number(selectedVehicle.year)) ? undefined : Number(selectedVehicle.year)) : undefined,
                        mileage: selectedVehicle.mileage ? (isNaN(Number(selectedVehicle.mileage)) ? undefined : Number(selectedVehicle.mileage)) : undefined
                    }}
                />
            )}
        </AdminLayout>
    );
}
