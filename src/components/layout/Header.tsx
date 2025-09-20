import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { SearchResult, SearchableEntities } from '@/types';

const Header = ({ pageTitle }: { pageTitle: string }) => {
  const { currentUser } = useAuth();
  const { customers, personnel, offers, meetingForms, tasks, expenses } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = useMemo((): SearchResult[] => {
    if (searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    customers
      .filter(c => c.name.toLowerCase().includes(term) || c.contact.toLowerCase().includes(term))
      .forEach(item => results.push({ type: 'Müşteri', item, title: item.name, id: item.id }));

    personnel
      .filter(p => p.adSoyad.toLowerCase().includes(term))
      .forEach(item => results.push({ type: 'Personel', item, title: item.adSoyad, id: item.id }));
    
    offers
        .filter(o => o.offerNo.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term))
        .forEach(item => results.push({ type: 'Teklif', item, title: `${item.offerNo} - ${item.customerName}`, id: item.id }));

    meetingForms
        .filter(m => m.notes.toLowerCase().includes(term))
        .forEach(item => {
            const customer = customers.find(c => c.id === item.customerId);
            results.push({ type: 'Görüşme', item, title: `Görüşme: ${customer?.name || ''}`, id: item.id });
        });

    tasks
        .filter(t => t.title.toLowerCase().includes(term))
        .forEach(item => results.push({ type: 'Görev', item, title: item.title, id: item.id }));
    
    expenses
        .filter(e => e.description.toLowerCase().includes(term) || e.category.toLowerCase().includes(term))
        .forEach(item => {
            const user = personnel.find(p => p.id === item.userId);
            results.push({ type: 'Gider', item, title: `${user?.adSoyad || ''} - ${item.amount} TL`, id: item.id });
        });

    return results;
  }, [searchTerm, customers, personnel, offers, meetingForms, tasks, expenses]);
  
  const groupedResults = useMemo(() => {
    // FIX: Using a generic type argument for `reduce` provides better type inference for the accumulator.
    // This resolves an issue where `items` in the render was inferred as `unknown`.
    return searchResults.reduce<Record<string, SearchResult[]>>((acc, result) => {
        const key = result.type;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(result);
        return acc;
    }, {});
  }, [searchResults]);

  return (
    <header className="main-header">
      <h1>{pageTitle}</h1>
      <div className="global-search" onBlur={() => setTimeout(() => setIsFocused(false), 100)}>
        <i className="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Uygulamada ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {isFocused && searchTerm.length > 1 && (
          <div className="search-results">
            {searchResults.length > 0 ? (
                Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type}>
                        <div className="search-result-group-title">{type}</div>
                        {items.map(result => (
                             <div key={result.id} className="search-result-item" onMouseDown={() => alert(`Navigating to ${result.type}: ${result.title}`)}>
                                <span>{result.title}</span>
                                <span className="result-type">{result.type}</span>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div className="no-results">Sonuç bulunamadı</div>
            )}
          </div>
        )}
      </div>
      <div className="header-user-info">
        Hoşgeldin, <strong>{currentUser?.adSoyad}</strong>
      </div>
    </header>
  );
};

export default Header;