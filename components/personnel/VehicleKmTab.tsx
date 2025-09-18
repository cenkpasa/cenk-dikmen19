import React, { useState, useMemo } from 'react';
import { User, KmRecord } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePersonnel } from '../../contexts/PersonnelContext';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../common/Button';
import DataTable from '../common/DataTable';
import { formatDate } from '../../utils/formatting';

const PerformanceCard = ({ label, value, color }: { label: string, value: string | number, color: 'blue' | 'orange' | 'green' | 'indigo' }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-800',
        orange: 'bg-orange-500/10 text-orange-800',
        green: 'bg-green-500/10 text-green-800',
        indigo: 'bg-indigo-500/10 text-indigo-800',
    };
    return (
        <div className={`${colorClasses[color]} p-4 rounded-cnk-element text-center`}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

interface KmRecordWithDistance extends KmRecord {
    distance?: number;
}

const VehicleKmTab = ({ personnel }: { personnel: User }) => {
    const { t } = useLanguage();
    const { addKmRecord, getKmRecordsForUser } = usePersonnel();
    const { showNotification } = useNotification();
    const [currentKm, setCurrentKm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'morning' | 'evening'>('all');

    const allKmRecords = useMemo(() => 
        getKmRecordsForUser(personnel.id).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.type === 'morning' ? '08:00' : '18:00'}`).getTime();
            const dateB = new Date(`${b.date}T${b.type === 'morning' ? '08:00' : '18:00'}`).getTime();
            return dateB - dateA; // Most recent first
        }), 
    [getKmRecordsForUser, personnel.id]);

    const latestRecord = allKmRecords.length > 0 ? allKmRecords[0] : null;

    const handleKmEntry = (type: 'morning' | 'evening') => {
        if (!currentKm || isNaN(Number(currentKm))) {
            showNotification('fieldsRequired', 'error');
            return;
        }

        const newKm = Number(currentKm);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRecords = allKmRecords.filter(r => r.date === todayStr);
        const todayMorning = todayRecords.find(r => r.type === 'morning');
        const todayEvening = todayRecords.find(r => r.type === 'evening');

        // Global check: New KM must be higher than the absolute last record.
        if (latestRecord && newKm <= latestRecord.km) {
            showNotification('kmMustBeStrictlyHigher', 'error', { lastKm: String(latestRecord.km) });
            return;
        }

        // Daily logic checks
        if (todayEvening) {
            showNotification('cannotAddMoreEntriesToday', 'error');
            return;
        }
        if (type === 'morning' && todayMorning) {
            showNotification('entryAlreadyExistsForToday', 'error', { type: t('morningEntry') });
            return;
        }
        if (type === 'evening' && !todayMorning) {
             showNotification('mustAddMorningFirst', 'error');
             return;
        }

        addKmRecord({ userId: personnel.id, km: newKm, type });
        setCurrentKm('');
    };
    
    const { dailyDistance, weeklyDistance } = useMemo(() => {
        if (!allKmRecords || allKmRecords.length === 0) {
            return { dailyDistance: 0, weeklyDistance: 0 };
        }

        const recordsByDate = [...allKmRecords]
            .reduce((acc, record) => {
                const dateKey = record.date.slice(0,10);
                (acc[dateKey] = acc[dateKey] || []).push(record);
                return acc;
        }, {} as Record<string, KmRecord[]>);

        let dailyDist = 0;
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRecords = recordsByDate[todayStr];
        if (todayRecords) {
            const morning = todayRecords.find(r => r.type === 'morning');
            const evening = todayRecords.find(r => r.type === 'evening');
            if (morning && evening && evening.km > morning.km) {
                dailyDist = evening.km - morning.km;
            }
        }
        
        let weeklyDist = 0;
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const dayStr = day.toISOString().slice(0, 10);
            
            const dayRecords = recordsByDate[dayStr];
            if (dayRecords) {
                const morning = dayRecords.find(r => r.type === 'morning');
                const evening = dayRecords.find(r => r.type === 'evening');
                if (morning && evening && evening.km > morning.km) {
                    weeklyDist += (evening.km - morning.km);
                }
            }
        }

        return { dailyDistance: dailyDist, weeklyDistance: weeklyDist };
    }, [allKmRecords]);

    const kmRecordsWithDistance = useMemo(() => {
        const sortedRecords = [...allKmRecords].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const recordsByDate = sortedRecords.reduce((acc, record) => {
            const dateKey = record.date.slice(0,10);
            (acc[dateKey] = acc[dateKey] || []).push(record);
            return acc;
        }, {} as Record<string, KmRecord[]>);
    
        return allKmRecords.map(record => {
            if (record.type === 'evening') {
                const dayRecords = recordsByDate[record.date.slice(0, 10)];
                const morningEntry = dayRecords?.find(r => r.type === 'morning');
                if (morningEntry && record.km > morningEntry.km) {
                    return { ...record, distance: record.km - morningEntry.km };
                }
            }
            return record;
        }).filter(record => {
            const dateMatch = !dateFilter || record.date === dateFilter;
            const typeMatch = typeFilter === 'all' || record.type === typeFilter;
            return dateMatch && typeMatch;
        });
    }, [allKmRecords, dateFilter, typeFilter]);

    const kmRecordsColumns = [
        { header: "Tarih", accessor: (item: KmRecord) => new Date(item.date).toLocaleDateString()},
        { header: "Kilometre", accessor: (item: KmRecord) => item.km.toLocaleString('tr-TR')},
        { header: "Giriş Tipi", accessor: (item: KmRecord) => item.type === 'morning' ? 'Sabah' : 'Akşam'},
        { header: "Mesafe (km)", accessor: (item: KmRecordWithDistance) => item.distance ? item.distance.toLocaleString('tr-TR') : '-' }
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <PerformanceCard label={t('dailyDistance')} value={`${dailyDistance.toLocaleString('tr-TR')} ${t('kmUnit')}`} color="blue" />
                <PerformanceCard label={t('weeklyDistance')} value={`${weeklyDistance.toLocaleString('tr-TR')} ${t('kmUnit')}`} color="indigo" />
            </div>

            <div className="bg-cnk-panel-light p-4 rounded-cnk-element mb-6 border border-cnk-border-light">
                <h4 className="font-bold text-lg mb-3">Araç Bilgileri ve KM Girişi</h4>
                <p><strong>Plaka:</strong> {personnel.licensePlate} | <strong>Model:</strong> {personnel.vehicleModel} | <strong>İlk KM:</strong> {personnel.vehicleInitialKm}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4">
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium">Güncel Kilometre</label>
                        <input type="number" value={currentKm} onChange={e => setCurrentKm(e.target.value)} className="w-full mt-1 p-2 border border-cnk-border-light bg-cnk-bg-light rounded-md" placeholder="örn. 25000"/>
                        {latestRecord && <p className="text-xs text-cnk-txt-muted-light mt-1">Son Kayıt ({formatDate(latestRecord.date)} - {latestRecord.type === 'morning' ? 'Sabah' : 'Akşam'}): {latestRecord.km} km</p>}
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                        <Button onClick={() => handleKmEntry('morning')} className="w-full">{t('morningEntry')}</Button>
                        <Button onClick={() => handleKmEntry('evening')} className="w-full" variant='secondary'>{t('eveningExit')}</Button>
                    </div>
                </div>
            </div>

            <div className="bg-cnk-panel-light p-4 rounded-cnk-element mb-6 border border-cnk-border-light">
                <h4 className="font-bold text-lg mb-3">KM Kayıtları Filtrele</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="dateFilter" className="text-sm font-medium">Tarih</label>
                        <input type="date" id="dateFilter" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full mt-1 p-2 border border-cnk-border-light bg-cnk-bg-light rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="typeFilter" className="text-sm font-medium">Giriş Tipi</label>
                        <select id="typeFilter" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full mt-1 p-2 border border-cnk-border-light bg-cnk-bg-light rounded-md">
                            <option value="all">Tümü</option>
                            <option value="morning">Sabah</option>
                            <option value="evening">Akşam</option>
                        </select>
                    </div>
                     <div>
                        <Button onClick={() => { setDateFilter(''); setTypeFilter('all'); }} variant="secondary">Filtreyi Temizle</Button>
                    </div>
                </div>
            </div>
            
            <h4 className="font-bold text-lg mb-3">KM Kayıt Geçmişi</h4>
            <DataTable columns={kmRecordsColumns} data={kmRecordsWithDistance} emptyStateMessage="Filtrelere uygun KM kaydı bulunmuyor."/>
        </div>
    );
};

export default VehicleKmTab;