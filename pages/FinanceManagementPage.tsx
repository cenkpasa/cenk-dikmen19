import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ExchangeRateCard from '../components/dashboard/ExchangeRateCard';

const FinanceManagementPage = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('financeManagement')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                     <ExchangeRateCard />
                </div>
                <div className="lg:col-span-2 bg-cnk-panel-light p-6 rounded-cnk-card shadow-md border text-center text-cnk-txt-muted-light">
                    <i className="fas fa-chart-line text-4xl mb-4"></i>
                    <h3 className="font-bold text-lg text-cnk-txt-primary-light">Nakit Akışı Raporu</h3>
                    <p>Bu özellik yakında eklenecektir.</p>
                </div>
            </div>

            <div className="bg-cnk-panel-light p-6 rounded-cnk-card shadow-md border">
                 <h2 className="text-xl font-semibold text-cnk-accent-primary mb-4">Banka Hesapları</h2>
                 <p className="text-center text-cnk-txt-muted-light py-8">Banka entegrasyonu ve hesap yönetimi özellikleri yakında burada olacak.</p>
            </div>
        </div>
    );
};

export default FinanceManagementPage;
