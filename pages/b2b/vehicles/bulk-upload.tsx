import React from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { FaDownload, FaFileUpload, FaExclamationTriangle } from 'react-icons/fa';
import { AiFillClockCircle } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { vehiclesAPI } from '../../../services/api/vehicles.api';

interface ImportedVehicle {
    id: string;
    makeModelYear: string;
    plateNumber: string;
    vin: string;
    status: 'Ready' | 'Error';
}

export default function BulkUploadPage() {
    const router = useRouter();
    const { user, company } = useSelector((state: RootState) => state.auth);
    const [isDownloading, setIsDownloading] = React.useState(false);

    console.log('🔍 Auth State Debug:', { user, company });

    const handleDownloadTemplate = async () => {
        if (!company?.id) {
            console.error('Company ID not found', { company });
            return;
        }

        try {
            setIsDownloading(true);
            const blob = await vehiclesAPI.downloadTemplate(company.id);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'vehicle_upload_template.xlsx');
            document.body.appendChild(link);
            link.click();

            // Cleanup
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download template', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const importedData: ImportedVehicle[] = [
        { id: '1', makeModelYear: 'Toyota Camry 2022', plateNumber: 'ABC-123', vin: '1HGBH41JXMN109186', status: 'Ready' },
        { id: '2', makeModelYear: 'Honda Accord 2021', plateNumber: 'DEF-456', vin: '1HGCV1F30KA123456', status: 'Ready' },
        { id: '3', makeModelYear: 'BMW X5 2023', plateNumber: 'GHI-789', vin: 'WBAFW31040P123456', status: 'Error' },
        { id: '4', makeModelYear: 'Mercedes C-Class 2022', plateNumber: 'JKL-012', vin: 'WDDGF4HB1CR123456', status: 'Ready' },
        { id: '5', makeModelYear: 'Audi A4 2021', plateNumber: 'MNO-345', vin: 'WAUFFAFL5CA123456', status: 'Ready' },
        { id: '6', makeModelYear: 'Ford Explorer 2020', plateNumber: 'PQR-678', vin: '1FM5K8F84LGA12345', status: 'Error' },
    ];

    return (
        <AdminLayout
            title="Bulk Car Addition"
            subtitle="Upload multiple vehicles using Excel template"
            showBackButton={true}
            onBackClick={() => router.back()}
        >
            <div className="space-y-6">

                {/* Upload Box */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Upload Vehicle Data</h2>
                    <p className="text-xs text-gray-500 mb-6">Download the template, fill it with vehicle information, and upload it back</p>

                    <div className="flex gap-4">
                        <button
                            onClick={handleDownloadTemplate}
                            disabled={isDownloading}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 transition-colors ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FaDownload className="text-gray-400" /> {isDownloading ? 'Downloading...' : 'Download Template'}
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-sm font-bold text-gray-900 transition-colors shadow-sm">
                            <FaFileUpload className="text-gray-800" /> Upload Excel File
                        </button>
                    </div>
                </div>

                {/* Imported Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-base font-bold text-gray-900">Imported Vehicle Data</h2>
                        <div className="flex gap-4 text-xs font-medium">
                            <span className="text-gray-500">Total: <span className="font-bold text-gray-900">12 vehicles</span></span>
                            <span className="text-blue-600">Ready to Add: <span className="font-bold">10</span></span>
                            <span className="text-red-500">Errors: <span className="font-bold">2</span></span>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                <th className="px-6 py-4">Make/Model/Year</th>
                                <th className="px-6 py-4">Plate Number</th>
                                <th className="px-6 py-4">VIN Number</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {importedData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-medium text-gray-700">{item.makeModelYear}</td>
                                    <td className="px-6 py-4 text-xs text-gray-600">{item.plateNumber}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{item.vin}</td>
                                    <td className="px-6 py-4">
                                        {item.status === 'Ready' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                                                <AiFillClockCircle className="text-[10px]" /> Ready to Add
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100">
                                                <FaExclamationTriangle className="text-[10px]" /> Wrong Input
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.status === 'Ready' ? (
                                            <button className="px-3 py-1 bg-[#FCD34D] text-gray-900 text-[10px] font-bold rounded hover:bg-[#FBBF24]">Add</button>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer / Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
                        <p className="text-xs text-gray-400">Showing 6 of 12 entries</p>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 text-xs font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50">Previous</button>
                            <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-900 bg-[#FCD34D] rounded shadow-sm">1</button>
                            <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700">2</button>
                            <button className="px-3 py-1 text-xs font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
                        Discard All
                    </button>
                    <button className="px-6 py-2.5 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                        Add 10 Vehicles
                    </button>
                </div>

            </div>
        </AdminLayout>
    );
}
