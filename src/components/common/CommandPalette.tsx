import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Command {
    id: string;
    title: string;
    icon: string;
    keywords?: string;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    executeCommand: (action: () => void) => void;
}

const CommandPalette = ({ isOpen, onClose, executeCommand }: CommandPaletteProps) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLUListElement>(null);
    
    const allCommands: Command[] = useMemo(() => [
        { id: 'go_dashboard', title: t('dashboard'), icon: 'fa-tachometer-alt', action: () => navigate('/') },
        { id: 'go_customers', title: t('customerList'), icon: 'fa-users', keywords: 'müşteri cari', action: () => navigate('/customers') },
        { id: 'go_appointments', title: t('appointmentsTitle'), icon: 'fa-calendar-check', keywords: 'randevu takvim', action: () => navigate('/appointments') },
        { id: 'go_offers', title: t('offerManagement'), icon: 'fa-file-invoice-dollar', keywords: 'teklif', action: () => navigate('/offers') },
        { id: 'create_offer', title: `${t('createOffer')}`, icon: 'fa-plus', action: () => navigate('/offers/create') },
        { id: 'create_customer', title: `${t('addNewCustomer')}`, icon: 'fa-plus', action: () => { /* This would require a global modal context or similar */ alert('Bu özellik yakında!'); } },
        { id: 'go_reports', title: t('reports'), icon: 'fa-chart-line', action: () => navigate('/reports') },
        { id: 'go_profile', title: t('profileTitle'), icon: 'fa-user', action: () => navigate('/profile') },
    ], [t, navigate]);

    const filteredCommands = useMemo(() => {
        if (!searchTerm) return allCommands;
        const lowerSearch = searchTerm.toLowerCase();
        return allCommands.filter(cmd => 
            cmd.title.toLowerCase().includes(lowerSearch) ||
            cmd.keywords?.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm, allCommands]);
    
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            setSearchTerm('');
        }
        setActiveIndex(0);
    }, [isOpen]);

     useEffect(() => {
        if (activeIndex >= 0 && resultsRef.current) {
            const activeItem = resultsRef.current.children[activeIndex] as HTMLLIElement;
            activeItem?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        } else if (e.key === 'Enter') {
            if (filteredCommands[activeIndex]) {
                executeCommand(filteredCommands[activeIndex].action);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/50 pt-20" onClick={onClose}>
            <div 
                className="w-full max-w-xl transform rounded-cnk-card bg-cnk-panel-light text-cnk-txt-secondary-light shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-cnk-txt-muted-light"></i>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Komut ara veya sayfaya git..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent p-4 pl-10 text-cnk-txt-primary-light focus:outline-none"
                    />
                </div>
                <ul ref={resultsRef} className="max-h-80 overflow-y-auto border-t border-cnk-border-light p-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                           <li
                                key={cmd.id}
                                onMouseDown={() => executeCommand(cmd.action)}
                                className={`flex items-center gap-3 p-3 rounded-cnk-element cursor-pointer ${index === activeIndex ? 'bg-cnk-accent-primary/20' : 'hover:bg-cnk-bg-light'}`}
                           >
                                <i className={`fas ${cmd.icon} w-5 text-center text-cnk-txt-muted-light`}></i>
                                <span className="text-cnk-txt-secondary-light">{cmd.title}</span>
                           </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-cnk-txt-muted-light">Sonuç bulunamadı.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;
