import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaExchangeAlt, FaExclamationTriangle, FaFilter, FaSearch, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function FinancePage() {
    const t = useTranslations('finance');
    const transactions = [
        { id: '#TXN001', date: 'Jan 15, 2024', bookingId: '#BK001', vehicleId: 'VH001', makeModel: 'Toyota Camry 2022', service: 'Oil Change', cost: '$45.00', status: 'Done', method: 'FIB' },
        { id: '#TXN002', date: 'Jan 14, 2024', bookingId: '#BK002', vehicleId: 'VH002', makeModel: 'Honda Accord 2021', service: 'Brake Service', cost: '$120.00', status: 'Pending', method: 'FastPay' },
        { id: '#TXN003', date: 'Jan 13, 2024', bookingId: '#BK003', vehicleId: 'VH003', makeModel: 'Ford F-150 2020', service: 'Tire Rotation', cost: '$35.00', status: 'Done', method: 'Cash' },
        { id: '#TXN004', date: 'Jan 12, 2024', bookingId: '#BK004', vehicleId: 'VH004', makeModel: 'BMW X3 2023', service: 'Full Service', cost: '$280.00', status: 'Pending', method: 'FIB' },
        { id: '#TXN005', date: 'Jan 11, 2024', bookingId: '#BK005', vehicleId: 'VH005', makeModel: 'Mercedes C-Class 2022', service: 'AC Repair', cost: '$150.00', status: 'Done', method: 'FastPay' },
    ];

    return (
        <AdminLayout
            title={t('title')}
            subtitle={t('subtitle')}
        >
            <div className="space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1">{t('stats.totalTransactions')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">1,247</h3>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                            <FaExchangeAlt />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1">{t('stats.totalOutstanding')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">$24,580</h3>
                        </div>
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                            <FaExclamationTriangle />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <div className="flex gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{t('stats.month')}</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{t('stats.year')}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-0.5">{t('stats.outstandingPerMonth')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">$8,420</h3>
                        </div>
                        <div className="w-10 h-10 bg-[#FEF3C7] text-[#D97706] rounded-lg flex items-center justify-center">
                            <FaFilter />
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-gray-900">{t('history.title')}</h2>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-xs font-bold text-gray-900 shadow-sm transition-colors">
                            <FaDownload /> {t('history.exportAll')}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-[200px] relative">
                            <FaSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder={t('filters.searchPlaceholder')}
                                className="w-full ps-9 pe-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#FCD34D]"
                            />
                        </div>
                        <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 min-w-[100px]">
                            {t('filters.allStatus')}
                        </button>
                        <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 min-w-[100px]">
                            {t('filters.allMethods')}
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-start">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                    <th className="px-4 py-3">{t('table.transactionId')}</th>
                                    <th className="px-4 py-3">{t('table.date')}</th>
                                    <th className="px-4 py-3">{t('table.bookingId')}</th>
                                    <th className="px-4 py-3">{t('table.vehicleId')}</th>
                                    <th className="px-4 py-3">{t('table.makeModelYear')}</th>
                                    <th className="px-4 py-3">{t('table.serviceType')}</th>
                                    <th className="px-4 py-3">{t('table.serviceCost')}</th>
                                    <th className="px-4 py-3">{t('table.paymentStatus')}</th>
                                    <th className="px-4 py-3">{t('table.paymentMethod')}</th>
                                    <th className="px-4 py-3 text-end">{t('table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((txn, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                                        <td className="px-4 py-4 font-bold">{txn.id}</td>
                                        <td className="px-4 py-4 text-gray-500">{txn.date}</td>
                                        <td className="px-4 py-4 text-blue-500">{txn.bookingId}</td>
                                        <td className="px-4 py-4">{txn.vehicleId}</td>
                                        <td className="px-4 py-4 font-bold text-xs">{txn.makeModel}</td>
                                        <td className="px-4 py-4 text-xs">{txn.service}</td>
                                        <td className="px-4 py-4 font-bold">{txn.cost}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${txn.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-[#FEF3C7] text-[#D97706]'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs">{txn.method}</td>
                                        <td className="px-4 py-4 text-end">
                                            <button className="text-[10px] font-bold text-[#FCD34D] hover:text-[#FBBF24] flex items-center justify-end gap-1 w-full">
                                                <FaDownload /> {t('table.invoice')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400">{t('pagination.showing')}</p>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><FaChevronLeft className="text-xs rtl:rotate-180" /></button>
                            <button className="w-8 h-8 rounded bg-[#FCD34D] flex items-center justify-center text-xs font-bold text-gray-900">1</button>
                            <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-50">3</button>
                            <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><FaChevronRight className="text-xs rtl:rotate-180" /></button>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
