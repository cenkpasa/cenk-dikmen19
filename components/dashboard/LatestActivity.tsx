
import React from 'react';
import { useNotificationCenter } from '@/contexts/NotificationCenterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Notification, Page } from '@/types';
import { useNavigate } from 'react-router-dom';

const LatestActivity = () => {
    const { t } = useLanguage();
    const { notifications, markAsRead } = useNotificationCenter();
    const navigate = useNavigate();

    const latestActivities = notifications.slice(0, 5);

    const getIconForType = (type: Notification['type']) => {
        const iconMap = {
            customer: { icon: 'fa-user-plus', color: 'text-blue-500' },
            appointment: { icon: 'fa-calendar-check', color: 'text-green-500' },
            offer: { icon: 'fa-file-invoice-dollar', color: 'text-purple-500' },
            interview: { icon: 'fa-file-signature', color: 'text-orange-500' },
            system: { icon: 'fa-cog', color: 'text-slate-500' },
            reconciliation: { icon: 'fa-handshake', color: 'text-teal-500' },
        };
        return iconMap[type] || iconMap.system;
    };

    // Fix: Add map from Page type to router path
    const pageToPathMap: Record<Page, string> = {
        'dashboard': '/',
        'customers': '/customers',
        'email': '/email',
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

    const handleActivityClick = (notification: Notification) => {
        if (notification.link) {
            if (!notification.isRead) {
                markAsRead(notification.id);
            }
            // Fix: Navigate using react-router-dom
            const basePath = pageToPathMap[notification.link.page] || '/';
            const path = notification.link.id ? `${basePath}/${notification.link.id}` : basePath;
            navigate(path);
        }
    };

    return (
        <div className="bg-cnk-panel-light p-5 rounded-cnk-card border border-cnk-border-light h-full">
            <h3 className="font-semibold text-cnk-txt-primary-light mb-4">{t('latestActivityTitle')}</h3>
            {latestActivities.length > 0 ? (
                <ul className="space-y-4">
                    {latestActivities.map((activity) => {
                        const iconInfo = getIconForType(activity.type);
                        const isClickable = !!activity.link;
                        return (
                            <li 
                                key={activity.id} 
                                onClick={() => isClickable && handleActivityClick(activity)}
                                className={`flex items-start ${isClickable ? 'cursor-pointer group' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0 ${iconInfo.color}`}>
                                    <i className={`fas ${iconInfo.icon}`}></i>
                                </div>
                                <div className="flex-grow">
                                    <p className={`text-sm text-cnk-txt-secondary-light ${isClickable ? 'group-hover:text-cnk-accent-primary' : ''}`}>
                                        {t(activity.messageKey, activity.replacements)}
                                    </p>
                                    <p className="text-xs text-cnk-txt-muted-light">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-sm text-cnk-txt-muted-light text-center mt-8">{t('noRecentActivity')}</p>
            )}
        </div>
    );
};

export default LatestActivity;
