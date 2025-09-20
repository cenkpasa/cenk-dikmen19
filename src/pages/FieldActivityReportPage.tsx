import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
// FIX: Import 'VehicleLog' and 'Expense' to be used for explicit type annotations, resolving type inference issues.
import { Expense, ExpenseCategory, VehicleLog } from '@/types';

const FieldActivityReportPage = () => {
    const { vehicleLogs, expenses, personnel } = useData();
    const [filters, setFilters] = useState({
        userId: 'all',
        startDate: '',
        endDate: ''
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const { filteredLogs, filteredExpenses } = useMemo(() => {
        const filterFunc = (item: { date: string; userId: string; }) => {
            const itemDate = new Date(item.date);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (filters.userId !== 'all' && item.userId !== filters.userId) return false;
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            
            return true;
        };
        
        return {
            filteredLogs: vehicleLogs.filter(filterFunc),
            filteredExpenses: expenses.filter(filterFunc)
        };

    }, [vehicleLogs, expenses, filters]);

    const summary = useMemo(() => {
        // FIX: Add explicit types to the reduce function's accumulator and value to resolve 'unknown' type error.
        const totalKm = filteredLogs.reduce((acc: number, log: VehicleLog) => acc + log.km, 0);
        // FIX: Add explicit types to the reduce function's accumulator and value to resolve 'unknown' type error.
        const totalExpense = filteredExpenses.reduce((acc: number, exp: Expense) => acc + exp.amount, 0);
        return { totalKm, totalExpense };
    }, [filteredLogs, filteredExpenses]);

    const expenseByCategory = useMemo(() => {
        // FIX: Add explicit types to the reduce function's accumulator and value to correct arithmetic operation type errors.
        const data = filteredExpenses.reduce((acc: Record<ExpenseCategory, number>, exp: Expense) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);
        
        // FIX: Add explicit types to the reduce function's parameters to ensure correct type inference for 'total'.
        const total = Object.values(data).reduce((sum: number, val: number) => sum + val, 0);
        if (total === 0) return [];
        
        return Object.entries(data).map(([category, amount]) => ({
            category,
            amount,
            // FIX: Cast `amount` to `number` to resolve arithmetic operation error due to type inference issues.
            percentage: ((amount as number) / total) * 100
        }));
    }, [filteredExpenses]);

    const categoryColors: Record<ExpenseCategory, string> = {
        yol: '#3498db',
        konaklama: '#9b59b6',
        yemek: '#e74c3c',
        temsil: '#f1c40f',
        diger: '#7f8c8d'
    };
    
    const getUserName = (userId: string) => personnel.find(p => p.id === userId)?.adSoyad || 'Bilinmiyor';


    return (
        <div>
            <div className="card report-filters">
                <div className="form-group">
                    <label>Personel</label>
                    <select name="userId" value={filters.userId} onChange={handleFilterChange}>
                        <option value="all">Tümü</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.adSoyad}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Başlangıç Tarihi</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                    <label>Bitiş Tarihi</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </div>
            </div>

            <div className="report-summary-grid">
                <div className="card">
                    <h3>Toplam Mesafe</h3>
                    <p className="card-stat">{summary.totalKm.toLocaleString('tr-TR')} km</p>
                </div>
                <div className="card">
                    <h3>Toplam Masraf</h3>
                    <p className="card-stat">{summary.totalExpense.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</p>
                </div>
            </div>

            {expenseByCategory.length > 0 && (
                <div className="card" style={{marginTop: '1.5rem'}}>
                    <h3>Masraf Dağılımı</h3>
                    <div className="bar-chart">
                        {expenseByCategory.map(item => (
                            <div className="bar-item" key={item.category}>
                                <div className="bar-label">{item.category}</div>
                                <div className="bar-wrapper">
                                    <div className="bar" style={{width: `${item.percentage}%`, backgroundColor: categoryColors[item.category as ExpenseCategory]}}></div>
                                </div>
                                <div className="bar-value">{item.amount.toLocaleString('tr-TR')} TL</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="card" style={{marginTop: '1.5rem'}}>
                <h3>Detaylı Raporlar</h3>
                <h4 style={{marginTop: '1rem'}}>Kilometre Kayıtları</h4>
                <div className="table-container">
                     <table className="data-table">
                        <thead>
                            <tr>
                                {filters.userId === 'all' && <th>Personel</th>}
                                <th>Tarih</th>
                                <th>KM</th>
                                <th>Açıklama</th>
                            </tr>
                        </thead>
                        <tbody>
                           {/* FIX: Add explicit type annotation for 'log' to prevent type inference issues. */}
                           {filteredLogs.map((log: VehicleLog) => (
                               <tr key={log.id}>
                                   {filters.userId === 'all' && <td>{getUserName(log.userId)}</td>}
                                   {/* FIX: Cast to `Date` to resolve incorrect type inference for `toLocaleDateString`. */}
                                   <td>{(new Date(log.date) as Date).toLocaleDateString('tr-TR')}</td>
                                   <td>{log.km}</td>
                                   <td>{log.description}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
                 <h4 style={{marginTop: '2rem'}}>Masraf Kayıtları</h4>
                 <div className="table-container">
                     <table className="data-table">
                        <thead>
                            <tr>
                                {filters.userId === 'all' && <th>Personel</th>}
                                <th>Tarih</th>
                                <th>Kategori</th>
                                <th>Tutar</th>
                                <th>Açıklama</th>
                            </tr>
                        </thead>
                        <tbody>
                           {/* FIX: Add explicit type annotation for 'exp' to prevent type inference issues. */}
                           {filteredExpenses.map((exp: Expense) => (
                               <tr key={exp.id}>
                                   {filters.userId === 'all' && <td>{getUserName(exp.userId)}</td>}
                                   <td>{new Date(exp.date).toLocaleDateString('tr-TR')}</td>
                                   <td>{exp.category}</td>
                                   <td>{exp.amount.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</td>
                                   <td>{exp.description}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default FieldActivityReportPage;