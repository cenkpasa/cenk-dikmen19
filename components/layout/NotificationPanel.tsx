
import React from 'react';
import { useNotificationCenter } from '@/contexts/NotificationCenterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Notification, Page } from '@/types';
import Button from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
    const { notifications, markAsRead, markAllAsRead } = useNotificationCenter();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Fix: Add map from Page type to router path
    const pageToPathMap: Record<Page, string> = {
        'dashboard': '/',
        'customers': '/customers',
        'email': '/email', // Assuming a route, though not present in App.tsx
        'appointments': '/appointments',
        'gorusme-formu': '/interviews',
        'teklif-yaz': '/offers',
        'personnel': '/personnel',
        'hesaplama-araclari': '/calculators',
        'profile': '/profile',
        'yapay-zeka': '/ai-hub',
        'konum-takip': '/location-tracking',
        'erp-entegrasyonu': '/erp',
        'ai-ayarlari': '/ai-settings',
        'raporlar': '/reports',
        'email-taslaklari': '/email-drafts',
        'mutabakat': '/reconciliations',
        'audit-log': '/audit-log',
        'teknik-talepler': '/technical-inquiries',
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            // Fix: Navigate using react-router-dom
            const basePath = pageToPathMap[notification.link.page] || '/';
            const path = notification.link.id ? `${basePath}/${notification.link.id}` : basePath;
            navigate(path);
        }
        onClose();
    };


    const getIconForType = (type: Notification['type']) => {
        const iconMap = {
            customer: 'fa-user-plus',
            appointment: 'fa-calendar-check',
            offer: 'fa-file-invoice-dollar',
            interview: 'fa-file-signature',
            system: 'fa-cog',
            reconciliation: 'fa-handshake',
        };
        return iconMap[type] || 'fa-info-circle';
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50">
            <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold">Bildirimler</h3>
                <Button size="sm" variant="secondary" onClick={markAllAsRead}>{t('markAllAsRead')}</Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`flex items-start gap-3 p-3 border-b hover:bg-slate-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <i className={`fas ${getIconForType(notif.type)} text-slate-500`}></i>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-cnk-txt-secondary-light">{t(notif.messageKey, notif.replacements)}</p>
                                <p className="text-xs text-slate-400">{new Date(notif.timestamp).toLocaleString()}</p>
                            </div>
                            {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>}
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-sm text-slate-500">Yeni bildirim yok.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
