import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Page, UserRole } from '@/types';
import CnkLogo from '@/components/assets/CnkLogo';

interface NavLinkInfo {
    path: string;
    labelKey: string;
    icon: string;
    roles?: UserRole[];
    page: Page; // Keep for reference if needed, but path is primary
}

const NAV_LINKS: NavLinkInfo[] = [
    { path: '/', page: 'dashboard', labelKey: 'dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/customers', page: 'customers', labelKey: 'customerList', icon: 'fas fa-users' },
    { path: '/appointments', page: 'appointments', labelKey: 'appointmentsTitle', icon: 'fas fa-calendar-check' },
    { path: '/interviews', page: 'gorusme-formu', labelKey: 'interviewFormsTitle', icon: 'fas fa-file-signature' },
    { path: '/offers', page: 'teklif-yaz', labelKey: 'offerManagement', icon: 'fas fa-file-invoice-dollar' },
    { path: '/reconciliations', page: 'mutabakat', labelKey: 'reconciliation', icon: 'fas fa-handshake', roles: ['admin', 'muhasebe'] },
    { path: '/email-drafts', page: 'email-taslaklari', labelKey: 'emailDrafts', icon: 'fas fa-envelope-open-text' },
    { path: '/ai-hub', page: 'yapay-zeka', labelKey: 'aiHubTitle', icon: 'fas fa-robot' },
    { path: '/reports', page: 'raporlar', labelKey: 'reports', icon: 'fas fa-chart-line', roles: ['admin'] },
    { path: '/audit-log', page: 'audit-log', labelKey: 'auditLog', icon: 'fas fa-history', roles: ['admin'] },
    { path: '/personnel', page: 'personnel', labelKey: 'personnelManagement', icon: 'fas fa-user-cog' },
    { path: '/location-tracking', page: 'konum-takip', labelKey: 'locationTracking', icon: 'fas fa-map-marker-alt', roles: ['admin'] },
    { path: '/erp', page: 'erp-entegrasyonu', labelKey: 'erpIntegration', icon: 'fas fa-cogs', roles: ['admin', 'muhasebe'] },
    { path: '/calculators', page: 'hesaplama-araclari', labelKey: 'calculationTools', icon: 'fas fa-calculator' },
    { path: '/profile', page: 'profile', labelKey: 'profileTitle', icon: 'fas fa-user' },
    { path: '/ai-settings', page: 'ai-ayarlari', labelKey: 'aiSettings', icon: 'fas fa-cogs', roles: ['admin'] },
];

interface SidebarLeftProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const SidebarLeft = ({ isOpen, setIsOpen }: SidebarLeftProps) => {
    const { logout, currentUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };
    
    const activeLinkClass = 'bg-cnk-accent-primary text-white';
    const inactiveLinkClass = 'hover:bg-cnk-accent-primary/10 text-cnk-sidebar-txt-dark';

    return (
        <>
            <div 
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            <nav className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-cnk-sidebar-dark text-cnk-sidebar-txt-dark transition-transform duration-300 md:relative md:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center gap-4 p-5">
                    <CnkLogo className="h-12" />
                </div>
                <ul className="flex-grow space-y-2 p-3">
                    {NAV_LINKS.map(link => {
                        if (link.page === 'personnel' && currentUser?.role !== 'admin') {
                             return null; 
                        }
                        if (link.roles && !link.roles.includes(currentUser!.role)) {
                            return null;
                        }

                        return (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    onClick={handleLinkClick}
                                    className={({ isActive }) => `relative flex items-center justify-between rounded-cnk-element px-4 py-3 text-sm font-medium ${isActive ? activeLinkClass : inactiveLinkClass}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <i className={`${link.icon} w-5 text-center text-lg`}></i>
                                        <span>{t(link.labelKey)}</span>
                                    </div>
                                </NavLink>
                            </li>
                        );
                    })}
                    <li>
                         <a href="#" onClick={(e) => {e.preventDefault(); logout();}} className="flex items-center gap-4 rounded-cnk-element px-4 py-3 text-sm font-medium text-cnk-sidebar-txt-muted-dark hover:bg-cnk-accent-primary/10 hover:text-white">
                             <i className="fas fa-sign-out-alt w-5 text-center text-lg"></i>
                             <span>{t('loggedOut')}</span>
                         </a>
                    </li>
                </ul>
                <div className="mt-auto border-t border-slate-700 p-4">
                    <select 
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
                        className="w-full cursor-pointer rounded-cnk-element border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cnk-accent-primary/50"
                    >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </nav>
        </>
    );
};

export default SidebarLeft;