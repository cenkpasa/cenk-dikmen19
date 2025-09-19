import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from '@/utils/debounce';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    type: 'customer' | 'appointment' | 'offer' | 'user';
    id: string;
    name: string;
    details: string;
    icon: string;
    path: string;
}

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    
    const { customers, appointments, offers } = useData();
    const { users } = useAuth();
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    const performSearch = useCallback((searchTerm: string) => {
        if (!searchTerm) {
            setResults([]);
            return;
        }
        const lowerQuery = searchTerm.toLowerCase();
        const searchResults: SearchResult[] = [];

        customers.forEach(c => {
            if (c.name.toLowerCase().includes(lowerQuery) || c.currentCode?.toLowerCase().includes(lowerQuery)) {
                searchResults.push({ type: 'customer', id: c.id, name: c.name, details: `Müşteri Kodu: ${c.currentCode || '-'}`, icon: 'fa-users', path: `/customers` });
            }
        });

        appointments.forEach(a => {
            const customer = customers.find(c => c.id === a.customerId);
            if (a.title.toLowerCase().includes(lowerQuery)) {
                searchResults.push({ type: 'appointment', id: a.id, name: a.title, details: `Randevu - ${customer?.name || ''}`, icon: 'fa-calendar-check', path: `/appointments` });
            }
        });

        offers.forEach(o => {
             const customer = customers.find(c => c.id === o.customerId);
            if (o.teklifNo.toLowerCase().includes(lowerQuery) || o.items.some(i => i.cins.toLowerCase().includes(lowerQuery))) {
                searchResults.push({ type: 'offer', id: o.id, name: `Teklif #${o.teklifNo}`, details: `Teklif - ${customer?.name || ''}`, icon: 'fa-file-invoice-dollar', path: `/offers/${o.id}` });
            }
        });

        users.forEach(u => {
            if (u.name.toLowerCase().includes(lowerQuery)) {
                searchResults.push({ type: 'user', id: u.id, name: u.name, details: `Personel - ${u.jobTitle || u.role}`, icon: 'fa-user-cog', path: `/personnel` });
            }
        });

        setResults(searchResults.slice(0, 10)); // Limit results
        setIsOpen(searchResults.length > 0);
    }, [customers, appointments, offers, users]);
    
    const debouncedSearch = useMemo(() => debounce(performSearch, 300), [performSearch]);

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (result: SearchResult) => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        // Customer detail view is a modal, so we just navigate to the list. For offers, we go to the detail page.
        navigate(result.path);
    };

     const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
                break;
            case 'Enter':
                if (activeIndex >= 0) {
                    e.preventDefault();
                    handleSelect(results[activeIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-cnk-txt-muted-light"></i>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && results.length > 0 && setIsOpen(true)}
                    placeholder="Ara (Müşteri, Teklif...)"
                    className="w-full h-10 pl-10 pr-4 bg-cnk-bg-light border border-cnk-border-light rounded-cnk-element focus:outline-none focus:ring-2 focus:ring-cnk-accent-primary"
                />
            </div>
            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-cnk-panel-light border border-cnk-border-light rounded-md shadow-lg max-h-80 overflow-y-auto">
                    {results.map((result, index) => (
                        <li
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result)}
                            className={`flex items-center gap-3 p-3 cursor-pointer ${index === activeIndex ? 'bg-cnk-accent-primary/20' : 'hover:bg-cnk-bg-light'}`}
                        >
                             <i className={`fas ${result.icon} w-5 text-center text-cnk-txt-muted-light`}></i>
                             <div>
                                <p className="font-semibold text-sm text-cnk-txt-primary-light">{result.name}</p>
                                <p className="text-xs text-cnk-txt-muted-light">{result.details}</p>
                             </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GlobalSearch;
