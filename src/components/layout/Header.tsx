
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import NotificationBell from './NotificationBell';
import { useLocation } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
    onToggleLeftSidebar: () => void;
}

const Header = ({ onToggleLeftSidebar }: HeaderProps) => {
    const { t } = useLanguage();
    const location = useLocation();

    const PAGE_TITLES: Record<string, string> = {
        '/': 'dashboard',
        '/customers': 'customerList',
        '/appointments': 'appointmentsTitle',
        '/interviews': 'interviewFormsTitle',
        '/offers': 'offerManagement',
        '/personnel': 'personnelManagement',
        '/calculators': 'calculationTools',
        '/profile': 'profileTitle',
        '/ai-hub': 'aiHubTitle',
        '/location-tracking': 'locationTracking',
        '/erp': 'erpIntegration',
        '/ai-settings': 'aiSettings',
        '/reports': 'reports',
        '/email-drafts': 'emailDrafts',
        '/reconciliations': 'reconciliation',
        '/audit-log': 'auditLog',
        '/technical-inquiries': 'technicalInquiries',
    };
    
    // Match base path, e.g., /interviews/123 should match /interviews
    const pagePath = '/' + location.pathname.split('/')[1];
    const pageTitleKey = PAGE_TITLES[pagePath] || 'dashboard';

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-cnk-border-light bg-cnk-panel-light px-4 md:px-6 gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={onToggleLeftSidebar} className="text-2xl text-cnk-txt-muted-light md:hidden">
                    <i className="fas fa-bars"></i>
                </button>
                <div className="hidden md:block">
                    <h1 className="text-xl font-semibold text-cnk-txt-primary-light">{t(pageTitleKey)}</h1>
                </div>
            </div>
            
            {/* Center Section: Search */}
            <div className="flex-grow flex justify-start md:justify-center items-center min-w-0 px-4">
                 <GlobalSearch />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <NotificationBell />
            </div>
        </header>
    );
};

export default Header;