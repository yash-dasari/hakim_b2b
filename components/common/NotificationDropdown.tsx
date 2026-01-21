import React from 'react';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export interface NotificationItem {
    id: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    referenceId?: string;
}

interface NotificationDropdownProps {
    notifications: NotificationItem[];
    isOpen: boolean;
    onClose: () => void;
    onClearAll: () => void;
}

import { useRouter } from 'next/router';

export default function NotificationDropdown({ notifications, isOpen, onClose, onClearAll }: NotificationDropdownProps) {
    const router = useRouter();
    const t = useTranslations('common');

    if (!isOpen) return null;

    const handleNotificationClick = (notification: NotificationItem) => {
        let message = notification.message;
        let referenceId = '';

        try {
            const data = JSON.parse(notification.message);
            if (data && typeof data === 'object') {
                message = data.message || message;
                referenceId = data.reference_id || notification.referenceId || '';
            }
        } catch (e) {
            // Not JSON, use as is
            referenceId = notification.referenceId || '';
        }

        console.log('Notification Clicked:', {
            id: notification.id,
            message: message,
            reference_id: referenceId,
            raw: notification.message
        });

        // Navigation Logic
        if (referenceId.startsWith('SR-') || message.toLowerCase().includes('service') || message.toLowerCase().includes('quotation')) {
            router.push('/b2b/services/requests');
        }

        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-[30vw] min-w-[320px] bg-white rounded-xl shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top-right transition-all">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-sm font-bold text-[#0F172A]">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-[#64748B] hover:text-red-500 transition-colors font-medium"
                    >
                        {t('notifications.clearAll')}
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-3">
                            <FaBell className="text-[#F59E0B] text-lg" />
                        </div>
                        <p className="text-sm text-[#64748B] font-medium">No notifications yet</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-2 bg-gray-50/50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 rounded-lg border shadow-sm transition-all flex gap-3 cursor-pointer relative group bg-white hover:shadow-md ${notification.read ? 'border-gray-100 opacity-75' : 'border-yellow-200 ring-1 ring-yellow-100'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {notification.type === 'success' ? (
                                        <FaCheckCircle className="text-green-500" />
                                    ) : notification.type === 'warning' ? (
                                        <FaExclamationCircle className="text-yellow-500" />
                                    ) : (
                                        <div className="bg-[#FEF3C7] p-1.5 rounded-full">
                                            <FaInfoCircle className="text-[#F59E0B] text-xs" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    {notification.referenceId && (
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-[#F59E0B] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FEF3C7]">
                                                {notification.referenceId}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                    <p className={`text-sm text-[#0F172A] leading-relaxed ${!notification.read ? 'font-medium' : ''}`}>
                                        {notification.message}
                                    </p>
                                    {!notification.referenceId && (
                                        <span className="text-[10px] text-[#94A3B8] mt-1 block font-medium">
                                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                {!notification.read && (
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
