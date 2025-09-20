import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
// FIX: Import 'LeaveRequest' for explicit type annotation in reduce function, improving type safety.
import { LeaveRequest } from '@/types';

const LeaveReportPage = () => {
    const { leaveRequests, personnel } = useData();
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        startDate: '',
        endDate: ''
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredRequests = useMemo(() => {
        return leaveRequests.filter(req => {
            const reqDate = new Date(req.startDate);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (filters.status !== 'all' && req.status !== filters.status) return false;
            if (filters.type !== 'all' && req.type !== filters.type) return false;
            if (startDate && reqDate < startDate) return false;
            if (endDate && reqDate > endDate) return false;

            return true;
        });
    }, [leaveRequests, filters]);

    // FIX: Add explicit return type ': number' to resolve 'unknown' type error.
    const calculateDays = (startDate: string, endDate: string): number => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : start;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const summary = useMemo(() => {
        const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
        // FIX: Add explicit types to the reduce function's accumulator and value to ensure type correctness.
        const totalDays = approvedRequests.reduce((acc: number, req: LeaveRequest) => acc + calculateDays(req.startDate, req.endDate), 0);
        
        // FIX: Add explicit types to the reduce function's accumulator and value to prevent potential type errors.
        const daysPerEmployee = approvedRequests.reduce((acc: Record<string, number>, req: LeaveRequest) => {
            const days = calculateDays(req.startDate, req.endDate);
            acc[req.userId] = (acc[req.userId] || 0) + days;
            return acc;
        }, {} as Record<string, number>);

        return { totalDays, daysPerEmployee };
    }, [filteredRequests]);
    
    const getUserName = (userId: string) => personnel.find(p => p.id === userId)?.adSoyad || 'Bilinmiyor';

    return (
        <div>
            <div className="card report-filters">
                <div className="form-group">
                    <label>Durum</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="all">Tümü</option>
                        <option value="pending">Bekliyor</option>
                        <option value="approved">Onaylandı</option>
                        <option value="rejected">Reddedildi</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>İzin Tipi</label>
                    <select name="type" value={filters.type} onChange={handleFilterChange}>
                        <option value="all">Tümü</option>
                        <option value="annual">Yıllık</option>
                        <option value="daily">Günlük</option>
                        <option value="hourly">Saatlik</option>
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
                    <h3>Toplam Onaylı İzin Günü</h3>
                    <p className="card-stat">{summary.totalDays}</p>
                </div>
                <div className="card">
                    <h3>Personel Başına Onaylı Günler</h3>
                    <ul>
                        {Object.entries(summary.daysPerEmployee).map(([userId, days]) => (
                            <li key={userId}><strong>{getUserName(userId)}:</strong> {days} gün</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card" style={{marginTop: '1.5rem'}}>
                <h3>Detaylı Rapor</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Personel</th>
                                <th>İzin Tipi</th>
                                <th>Başlangıç</th>
                                <th>Bitiş</th>
                                <th>Gün Sayısı</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* FIX: Add explicit type for 'req' to fix type inference issues. */}
                            {filteredRequests.map((req: LeaveRequest) => (
                                <tr key={req.id}>
                                    <td>{getUserName(req.userId)}</td>
                                    <td>{req.type}</td>
                                    <td>{new Date(req.startDate).toLocaleDateString('tr-TR')}</td>
                                    <td>{req.endDate ? new Date(req.endDate).toLocaleDateString('tr-TR') : '-'}</td>
                                    {/* FIX: Cast return value to `React.ReactNode` to satisfy JSX type checking. */}
                                    <td>{calculateDays(req.startDate, req.endDate) as React.ReactNode}</td>
                                    <td><span className={`status-badge status-${req.status}`}>{req.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveReportPage;