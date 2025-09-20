import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

interface NavLink {
    label: string;
    page: string;
    icon: string;
    roles: Role[];
}

const Sidebar = ({ activePage, setActivePage }: SidebarProps) => {
    const { currentUser, logout } = useAuth();

    const navLinks: NavLink[] = [
        { label: 'Dashboard', page: 'dashboard', icon: 'fa-tachometer-alt', roles: ['Admin', 'Muhasebe', 'Saha'] },
        { label: 'Müşteriler', page: 'customers', icon: 'fa-users', roles: ['Admin', 'Saha'] },
        { label: 'Teklifler', page: 'offers', icon: 'fa-file-invoice-dollar', roles: ['Admin', 'Saha'] },
        { label: 'Görüşme Formları', page: 'meetings', icon: 'fa-handshake', roles: ['Admin', 'Saha'] },
        { label: 'Görevler', page: 'tasks', icon: 'fa-tasks', roles: ['Admin', 'Muhasebe', 'Saha'] },
        { label: 'Giderler', page: 'expenses', icon: 'fa-wallet', roles: ['Admin', 'Muhasebe', 'Saha'] },
        { label: 'Personel', page: 'personnel', icon: 'fa-user-cog', roles: ['Admin'] },
        // Raporlar
        { label: 'İzin Raporu', page: 'leaveReport', icon: 'fa-calendar-check', roles: ['Admin', 'Muhasebe'] },
        { label: 'Saha Faaliyet Raporu', page: 'fieldActivityReport', icon: 'fa-chart-line', roles: ['Admin', 'Muhasebe'] },
        // Gelişmiş Modüller
        { label: 'Muhasebe', page: 'accounting', icon: 'fa-calculator', roles: ['Admin', 'Muhasebe'] },
        { label: 'Üretim Analizi', page: 'production', icon: 'fa-cube', roles: ['Admin'] },
        { label: 'İş Akışı Otomasyonu', page: 'automation', icon: 'fa-cogs', roles: ['Admin'] },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img src="https://cnkkesicitakim.com.tr/wp-content/uploads/2022/12/CNK-KESICI-TAKIMLAR-LOGO-300x79.png" alt="CNK Logo" />
            </div>
            <nav>
                <ul>
                    {navLinks
                        .filter(link => currentUser && link.roles.includes(currentUser.role))
                        .map(link => (
                            <li 
                                key={link.page} 
                                className={activePage === link.page ? 'active' : ''}
                                onClick={() => setActivePage(link.page)}
                            >
                                <i className={`fas ${link.icon}`}></i>
                                <span>{link.label}</span>
                            </li>
                        ))
                    }
                </ul>
            </nav>
            <button className="btn btn-secondary" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i>
                Çıkış Yap
            </button>
        </aside>
    );
};

export default Sidebar;