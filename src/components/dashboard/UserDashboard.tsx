
import React, { useMemo } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import LatestActivity from '@/components/dashboard/LatestActivity';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useErp } from '@/contexts/ErpContext';
import PersonalGoalTracker from '@/components/dashboard/PersonalGoalTracker';

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const { appointments } = useData();
    const { faturalar } = useErp();
    const { t } = useLanguage();
    
    const userSales = useMemo(() => {
        if (!currentUser || !faturalar) return 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return faturalar
            .filter(inv => {
                const invDate = new Date(inv.tarih);
                return inv.kullaniciId === currentUser.id && invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
            })
            .reduce((sum, inv) => sum + inv.toplamTutar, 0);
    }, [faturalar, currentUser]);

    const userAppointments = useMemo(() => {
        if (!currentUser) return [];
        return appointments.filter(a => a.userId === currentUser.id && new Date(a.start) >= new Date());
    }, [appointments, currentUser]);

    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-cnk-txt-primary-light">{t('welcomeMessage', { name: currentUser.name })}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <PersonalGoalTracker 
                        target={currentUser.salesTarget || 0} 
                        current={userSales} 
                    />
                </div>
                <div className="space-y-4">
                     <StatCard titleKey="dashboard_yourSales" value={`${userSales.toLocaleString('tr-TR')}₺`} change="" color="green" />
                     <StatCard titleKey="dashboard_upcomingAppointments" value={String(userAppointments.length)} change="" color="pink" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <LatestActivity />
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
