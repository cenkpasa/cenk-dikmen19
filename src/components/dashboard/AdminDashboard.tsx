
import React, { useMemo } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import BarChart from '@/components/dashboard/BarChart';
import LatestActivity from '@/components/dashboard/LatestActivity';
import TopSalesDonut from '@/components/dashboard/TopSalesDonut';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsightCenter from '@/components/dashboard/AIInsightCenter';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/dbService';
import ExchangeRateCard from '@/components/dashboard/ExchangeRateCard';

const AdminDashboard = () => {
    const { appointments } = useData();
    const { t } = useLanguage();
    
    const incomingInvoices = useLiveQuery(() => db.incomingInvoices.toArray(), []) || [];
    const outgoingInvoices = useLiveQuery(() => db.outgoingInvoices.toArray(), []) || [];

    const totalIncoming = useMemo(() => incomingInvoices.reduce((sum, inv) => sum + inv.tutar, 0), [incomingInvoices]);
    const totalOutgoing = useMemo(() => outgoingInvoices.reduce((sum, inv) => sum + inv.tutar, 0), [outgoingInvoices]);
    const difference = totalOutgoing - totalIncoming;

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard titleKey="totalIncoming" value={`${totalIncoming.toLocaleString('tr-TR')}₺`} change="" color="blue" />
                <StatCard titleKey="totalOutgoing" value={`${totalOutgoing.toLocaleString('tr-TR')}₺`} change="" color="green" />
                <StatCard titleKey="reconciliationDifference" value={`${difference.toLocaleString('tr-TR')}₺`} change="" color="yellow" />
                <ExchangeRateCard />
            </div>

            {/* Charts & AI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 shadow-md rounded-cnk-card"><BarChart /></div>
                <div className="lg:col-span-1 shadow-md rounded-cnk-card"><AIInsightCenter /></div>
            </div>
            
            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 shadow-md rounded-cnk-card"><LatestActivity /></div>
                <div className="lg:col-span-1 shadow-md rounded-cnk-card"><TopSalesDonut /></div>
            </div>
        </div>
    );
};

export default AdminDashboard;
