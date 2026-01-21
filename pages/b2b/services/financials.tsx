import React, { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/AdminLayout';
import {
    FaCreditCard,
    FaFileInvoiceDollar,
    FaSearch,
    FaDownload,
    FaChartLine,
    FaMoneyBillWave,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';

// Mock Data for Transactions
const transactions = [
    {
        id: '#TXN001247',
        bookingId: '#BK001247',
        customerName: 'Ahmed Hassan',
        paymentType: 'FIB',
        serviceCategory: 'AC Repair',
        totalAmount: 150.00,
        hakimFee: 15.00,
        netAmount: 135.00,
        status: 'Paid',
        paymentDate: 'Dec 8, 2024 2:30 PM',
        paidTo: 'HAKIM Service Center',
        receiptId: '#RCP001247'
    },
    {
        id: '#TXN001246',
        bookingId: '#BK001246',
        customerName: 'Fatima Al-Zahra',
        paymentType: 'FastPay',
        serviceCategory: 'Plumbing',
        totalAmount: 85.00,
        hakimFee: 8.50,
        netAmount: 76.50,
        status: 'Pending',
        paymentDate: 'Dec 8, 2024 1:15 PM',
        paidTo: 'Service Center',
        receiptId: '#RCP001246'
    },
    {
        id: '#TXN001245',
        bookingId: '#BK001245',
        customerName: 'Mohammed Ali',
        paymentType: 'Cash',
        serviceCategory: 'Electrical',
        totalAmount: 200.00,
        hakimFee: 20.00,
        netAmount: 180.00,
        status: 'Paid',
        paymentDate: 'Dec 7, 2024 4:45 PM',
        paidTo: 'HAKIM Service Center',
        receiptId: '#RCP001245'
    }
];

// Mock Data for Settlements
const settlements = [
    {
        id: '#STL-2024-001',
        period: 'Jan 1 - Jan 31, 2024',
        bookings: 45,
        totalRevenue: 8450,
        collectedByHakim: 6760,
        collectedBySC: 1690,
        netBalance: 6083,
        commission: 677,
        payoutMethod: 'Bank Transfer',
        payoutDate: 'Feb 5, 2024',
        status: 'Paid'
    },
    {
        id: '#STL-2024-002',
        period: 'Feb 1 - Feb 29, 2024',
        bookings: 52,
        totalRevenue: 9680,
        collectedByHakim: 7744,
        collectedBySC: 1936,
        netBalance: 6972,
        commission: 772,
        payoutMethod: 'Bank Transfer',
        payoutDate: 'Mar 5, 2024',
        status: 'Paid'
    },
    {
        id: '#STL-2024-003',
        period: 'Mar 1 - Mar 31, 2024',
        bookings: 38,
        totalRevenue: 7220,
        collectedByHakim: 5776,
        collectedBySC: 1444,
        netBalance: 5198,
        commission: 578,
        payoutMethod: 'Bank Transfer',
        payoutDate: 'Pending',
        status: 'Pending'
    }
];

export default function FinancialsPage() {
    const [activeTab, setActiveTab] = useState('Transactions');

    return (
        <AdminLayout
            title="Financials & Settlements"
            subtitle="Overview of financial transactions and settlements"
            showWelcomeMessage={false}
        >
            <Head>
                <title>Financials & Settlements | HAKIM Service Center</title>
            </Head>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Number of Requests */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Number of Requests</div>
                        <div className="text-3xl font-bold text-gray-900">1,247</div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                            <span>+12.5%</span>
                            <span className="text-gray-400 font-medium">from last month</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <FaFileInvoiceDollar className="w-6 h-6" />
                    </div>
                </div>

                {/* Net Revenue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Net Revenue</div>
                        <div className="text-3xl font-bold text-gray-900">$48,573</div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                            <span>+8.3%</span>
                            <span className="text-gray-400 font-medium">from last month</span>
                        </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <FaChartLine className="w-6 h-6" />
                    </div>
                </div>

                {/* Net Balance */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Net Balance</div>
                        <div className="text-3xl font-bold text-gray-900">$12,456</div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-orange-500 mt-2">
                            <FaCreditCard className="w-3 h-3" />
                            <span className="font-medium">Pending settlement</span>
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
                        <FaMoneyBillWave className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('Transactions')}
                            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'Transactions'
                                ? 'border-yellow-400 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('Settlement')}
                            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'Settlement'
                                ? 'border-yellow-400 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Settlement
                        </button>
                    </div>
                </div>

                {/* Transactions Tab Content */}
                {activeTab === 'Transactions' && (
                    <div className="p-6">

                        {/* Table Header: Title + Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full md:w-64"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm">
                                    <FaDownload className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-2 font-semibold">Transaction ID</th>
                                        <th className="py-3 px-2 font-semibold text-blue-600">Booking ID</th>
                                        <th className="py-3 px-2 font-semibold">Customer Name</th>
                                        <th className="py-3 px-2 font-semibold">Payment Type</th>
                                        <th className="py-3 px-2 font-semibold">Service Category</th>
                                        <th className="py-3 px-2 font-semibold">Total Amount</th>
                                        <th className="py-3 px-2 font-semibold">Hakim Fee</th>
                                        <th className="py-3 px-2 font-semibold">Net Amount</th>
                                        <th className="py-3 px-2 font-semibold">Status</th>
                                        <th className="py-3 px-2 font-semibold">Payment Date</th>
                                        <th className="py-3 px-2 font-semibold">Paid To</th>
                                        <th className="py-3 px-2 font-semibold">Receipt ID</th>
                                        <th className="py-3 px-2 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {transactions.map((txn, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-2 font-medium text-gray-900">{txn.id}</td>
                                            <td className="py-4 px-2 font-medium text-blue-600 hover:underline cursor-pointer">{txn.bookingId}</td>
                                            <td className="py-4 px-2">
                                                <div className="font-medium text-gray-900">{txn.customerName}</div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                          ${txn.paymentType === 'FIB' ? 'bg-green-100 text-green-800' :
                                                        txn.paymentType === 'FastPay' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }
                        `}>
                                                    {txn.paymentType}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-gray-600">{txn.serviceCategory}</td>
                                            <td className="py-4 px-2 font-bold text-gray-900">${txn.totalAmount.toFixed(2)}</td>
                                            <td className="py-4 px-2 font-bold text-gray-900">${txn.hakimFee.toFixed(2)}</td>
                                            <td className="py-4 px-2 font-bold text-gray-900">${txn.netAmount.toFixed(2)}</td>
                                            <td className="py-4 px-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                          ${txn.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                          uppercase
                        `}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-gray-500 text-xs">
                                                <div className="flex flex-col">
                                                    <span>{txn.paymentDate.split(',')[0]}</span>
                                                    <span>{txn.paymentDate.split(',')[1]}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-gray-600 text-xs max-w-[120px]">{txn.paidTo}</td>
                                            <td className="py-4 px-2 text-gray-600 text-xs">{txn.receiptId}</td>
                                            <td className="py-4 px-2 text-center">
                                                <button className="text-yellow-500 hover:text-yellow-600 p-1">
                                                    <FaDownload className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                Showing 1-10 of 247 transactions
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-md text-sm font-bold">1</button>
                                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">2</button>
                                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">3</button>
                                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                        </div>

                    </div>
                )}

                {/* Settlement Tab Content */}
                {activeTab === 'Settlement' && (
                    <div className="p-6">
                        {/* Table Header: Title + Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Settlement History</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search settlements..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full md:w-64"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-sm">
                                    <FaDownload className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="py-3 px-2 font-semibold">Settlement ID</th>
                                        <th className="py-3 px-2 font-semibold">Period</th>
                                        <th className="py-3 px-2 font-semibold">Bookings</th>
                                        <th className="py-3 px-2 font-semibold">Total Revenue</th>
                                        <th className="py-3 px-2 font-semibold">Collected by Hakim</th>
                                        <th className="py-3 px-2 font-semibold">Collected by SC</th>
                                        <th className="py-3 px-2 font-semibold">Net Balance</th>
                                        <th className="py-3 px-2 font-semibold">Commission</th>
                                        <th className="py-3 px-2 font-semibold">Payout Method</th>
                                        <th className="py-3 px-2 font-semibold">Payout Date</th>
                                        <th className="py-3 px-2 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {settlements.map((settlement, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-2 font-bold text-gray-900">{settlement.id}</td>
                                            <td className="py-4 px-2 text-gray-600 max-w-[140px]">{settlement.period}</td>
                                            <td className="py-4 px-2 text-gray-600">{settlement.bookings}</td>
                                            <td className="py-4 px-2 font-bold text-gray-900">${settlement.totalRevenue.toLocaleString()}</td>
                                            <td className="py-4 px-2 text-gray-600">${settlement.collectedByHakim.toLocaleString()}</td>
                                            <td className="py-4 px-2 text-gray-600">${settlement.collectedBySC.toLocaleString()}</td>
                                            <td className="py-4 px-2 font-bold text-green-600">${settlement.netBalance.toLocaleString()}</td>
                                            <td className="py-4 px-2 text-gray-600">${settlement.commission.toLocaleString()}</td>
                                            <td className="py-4 px-2 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{settlement.payoutMethod}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`font-medium ${settlement.status === 'Pending' ? 'text-orange-500' : 'text-gray-900'}`}>
                                                    {settlement.payoutDate}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <button
                                                    disabled={settlement.payoutDate === 'Pending'}
                                                    className={`p-1 ${settlement.payoutDate === 'Pending' ? 'text-gray-300 cursor-not-allowed' : 'text-yellow-500 hover:text-yellow-600'}`}
                                                >
                                                    <FaDownload className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                Showing 3 of 12 settlements
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-400">
                                    <FaChevronLeft className="w-3 h-3" />
                                </button>
                                <button className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-md text-sm font-bold">1</button>
                                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">2</button>
                                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">3</button>
                                <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
                                    <FaChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
