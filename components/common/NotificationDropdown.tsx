import React from 'react';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export interface NotificationItem {
    id: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
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
                referenceId = data.reference_id || '';
            }
        } catch (e) {
            // Not JSON, use as is
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
        <div className="absolute end-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform ltr:origin-top-right rtl:origin-top-left transition-all">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900">{t('notifications.title')}</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                        {t('notifications.clearAll')}
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FaBell className="text-gray-400 text-lg" />
                        </div>
                        <p className="text-sm">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => {
                            // Parse message for display
                            let displayMessage = notification.message;
                            try {
                                const data = JSON.parse(notification.message);
                                if (data && typeof data === 'object') {
                                    displayMessage = data.message || displayMessage;
                                }
                            } catch (e) {
                                // Ignore json parse errors for display
                            }

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${notification.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {notification.type === 'success' ? (
                                            <FaCheckCircle className="text-green-500" />
                                        ) : notification.type === 'warning' ? (
                                            <FaExclamationCircle className="text-yellow-500" />
                                        ) : (
                                            <FaInfoCircle className="text-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 leading-snug">{displayMessage}</p>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
