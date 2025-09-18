import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersonnel } from '../contexts/PersonnelContext';
import { User, LocationRecord } from '../types';
import { COMPANY_INFO, WORKPLACE_COORDS } from '../constants';
import Button from '../components/common/Button';

const MapView = ({ locations }: { locations: LocationRecord[] }) => {
    const mapUrl = useMemo(() => {
        let bbox = "25.6,35.8,44.8,42.1"; // Default Turkey bbox
        let marker = `${WORKPLACE_COORDS.latitude},${WORKPLACE_COORDS.longitude}`;

        if (locations.length > 0) {
            const lastLocation = locations[locations.length - 1];
            marker = `${lastLocation.latitude},${lastLocation.longitude}`;
            bbox = `${lastLocation.longitude - 0.05},${lastLocation.latitude - 0.05},${lastLocation.longitude + 0.05},${lastLocation.latitude + 0.05}`;
        }
        
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
    }, [locations]);
    
    return (
        <div className="bg-cnk-panel-light rounded-lg shadow-inner flex-grow relative overflow-hidden">
             <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={mapUrl}
                style={{ border: 0 }}
                title="Konum Haritası"
             ></iframe>
        </div>
    );
};

const LocationTrackingPage = () => {
    const { users, currentUser } = useAuth();
    const { customers } = useData();
    const { t } = useLanguage();
    const { addLocationRecord, getLocationHistoryForUser } = usePersonnel();

    const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(currentUser?.id || null);
    const [filter, setFilter] = useState<'daily'>('daily');
    const [isLiveTracking, setIsLiveTracking] = useState(false);
    
    useEffect(() => {
        let intervalId: number | undefined;
        if (isLiveTracking && selectedPersonnelId) {
            const userLocationHistory = getLocationHistoryForUser(selectedPersonnelId);
            intervalId = window.setInterval(() => {
                const lastLocation = userLocationHistory?.[userLocationHistory.length - 1];
                const newLat = (lastLocation?.latitude || WORKPLACE_COORDS.latitude) + (Math.random() - 0.5) * 0.001;
                const newLon = (lastLocation?.longitude || WORKPLACE_COORDS.longitude) + (Math.random() - 0.5) * 0.001;
                addLocationRecord({ userId: selectedPersonnelId, latitude: newLat, longitude: newLon });
            }, 5000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isLiveTracking, selectedPersonnelId, addLocationRecord, getLocationHistoryForUser]);

    const filteredLocationHistory = useMemo(() => {
        if (!selectedPersonnelId) return [];
        const locationHistory = getLocationHistoryForUser(selectedPersonnelId);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return locationHistory.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate >= startOfToday;
        }).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [selectedPersonnelId, getLocationHistoryForUser]);

    const punctualityReport = useMemo(() => {
        if (filteredLocationHistory.length < 1) return null;
        
        const sortedHistory = filteredLocationHistory;
        const startTime = new Date(sortedHistory[0].timestamp);
        const endTime = new Date(sortedHistory[sortedHistory.length - 1].timestamp);
        
        const startTimeStr = startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        const isLateStart = startTimeStr > COMPANY_INFO.workStartTime;
        const isEarlyLeave = endTimeStr < COMPANY_INFO.workEndTime;

        return { startTime: startTimeStr, endTime: endTimeStr, isLateStart, isEarlyLeave };
    }, [filteredLocationHistory]);
    
     if (currentUser?.role !== 'admin') {
        return <p className="text-center p-4 bg-yellow-500/10 text-yellow-300 rounded-lg">{t('adminPrivilegeRequired')}</p>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-150px)]">
                {/* Personnel List */}
                <div className="lg:col-span-3">
                    <div className="bg-cnk-panel-light rounded-lg shadow-lg p-3 space-y-2 h-full overflow-y-auto">
                        {users.map(p => (
                            <div key={p.id} onClick={() => setSelectedPersonnelId(p.id)}
                                 className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedPersonnelId === p.id ? 'bg-cnk-accent-primary text-white shadow-md' : 'hover:bg-cnk-bg-light'}`}>
                                <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name.replace(/\s/g, "+")}&background=random`} alt={p.name} className="w-10 h-10 rounded-full mr-3 object-cover"/>
                                <div><p className="font-semibold text-sm">{p.name}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Map and Report */}
                <div className="lg:col-span-9">
                    {selectedPersonnelId ? (
                        <div className="flex flex-col h-full gap-4">
                           <MapView locations={filteredLocationHistory} />
                            <div className="bg-cnk-panel-light rounded-lg shadow-lg p-4 h-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-lg text-cnk-txt-primary-light">{t('punctualitySummary')}</h3>
                                    <Button onClick={() => setIsLiveTracking(!isLiveTracking)} variant={isLiveTracking ? 'danger' : 'success'} size="sm">
                                        <i className={`fas fa-circle mr-2 ${isLiveTracking ? 'animate-pulse' : ''}`}></i>
                                        {isLiveTracking ? 'Takibi Durdur' : 'Anlık Takip'}
                                    </Button>
                                </div>
                                {punctualityReport ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="bg-cnk-bg-light p-3 rounded-md">
                                            <h4 className="font-semibold mb-2 text-cnk-txt-secondary-light">{t('officialHours')}</h4>
                                            <p className="font-mono text-lg">{COMPANY_INFO.workStartTime} - {COMPANY_INFO.workEndTime}</p>
                                        </div>
                                        <div className="bg-cnk-bg-light p-3 rounded-md">
                                            <h4 className="font-semibold mb-2 text-cnk-txt-secondary-light">{t('actualHours')}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg">{punctualityReport.startTime}</span>
                                                {punctualityReport.isLateStart && <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{t('lateStart')}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg">{punctualityReport.endTime}</span>
                                                {punctualityReport.isEarlyLeave && <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">{t('earlyLeave')}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-cnk-txt-muted-light text-center p-4">{t('noLocationData')}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-cnk-panel-light rounded-lg shadow-lg p-8 text-center text-cnk-txt-muted-light h-full flex items-center justify-center">
                            <p>{t('selectPersonnelToTrack')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationTrackingPage;