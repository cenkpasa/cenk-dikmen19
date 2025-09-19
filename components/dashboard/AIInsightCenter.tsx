
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotificationCenter } from '@/contexts/NotificationCenterContext';
import { Notification, Page } from '@/types';
import { useNavigate } from 'react-router-dom';

interface InsightCardProps {
    insight: Notification;
}

const InsightCard = ({ insight }: InsightCardProps) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    
    const iconMap = {
        offer: 'fas fa-lightbulb',
        customer: 'fas fa-exclamation-triangle',
        appointment: 'fas fa-calendar-check',
        interview: 'fas fa-comments',
        system: 'fas fa-cog'
    };
    
    const colorMap = {
        offer: 'border-green-500 bg-green-500/10 text-green-700',
        customer: 'border-amber-500 bg-amber-500/10 text-amber-700',
        default: 'border-blue-500 bg-blue-500/10 text-blue-700'
    };

    const cardColor = colorMap[insight.type as keyof typeof colorMap] || colorMap.default;

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

    const handleAction = () => {
        if (insight.link) {
            // Fix: Navigate using react-router-dom
            const basePath = pageToPathMap[insight.link.page] || '/';
            const path = insight.link.id ? `${basePath}/${insight.link.id}` : basePath;
            navigate(path);
        }
    };

    return (
        <div className={`p-4 rounded-cnk-element border-l-4 ${cardColor} flex items-start gap-4`}>
            <div className="text-xl mt-1">
                <i className={iconMap[insight.type]}></i>
            </div>
            <div className="flex-grow">
                <p className="text-sm text-cnk-txt-secondary-light">{t(insight.messageKey, insight.replacements)}</p>
                {insight.link && (
                    <button onClick={handleAction} className="text-xs font-bold text-cnk-accent-primary hover:underline mt-1">
                        {t('viewDetails')} <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                )}
            </div>
        </div>
    );
};


const AIInsightCenter = () => {
    const { t } = useLanguage();
    const { notifications } = useNotificationCenter();
    const aiInsights = notifications.filter(n => !n.isRead);

    return (
        <div className="bg-cnk-panel-light p-6 rounded-cnk-card border border-cnk-border-light h-full flex flex-col">
            <h3 className="font-bold text-lg text-cnk-txt-primary-light mb-4">
                <i className="fas fa-robot mr-2 text-cnk-accent-primary"></i>
                {t('aiAnalysisCenter')}
            </h3>
            {aiInsights.length > 0 ? (
                <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                    {aiInsights.map(insight => (
                        <InsightCard key={insight.id} insight={insight} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-sm text-cnk-txt-muted-light flex-grow flex flex-col justify-center items-center">
                    <i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i>
                    <p>{t('aiNoInsights')}</p>
                </div>
            )}
        </div>
    );
};

export default AIInsightCenter;
