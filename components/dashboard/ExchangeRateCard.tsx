import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExchangeRate } from '@/types';
import { fetchExchangeRates } from '@/services/erpApiService';
import Loader from '../common/Loader';

const ExchangeRateCard = () => {
    const { t } = useLanguage();
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRates = async () => {
            setIsLoading(true);
            try {
                const fetchedRates = await fetchExchangeRates();
                setRates(fetchedRates);
                setError(null);
            } catch (err) {
                setError(t('genericError'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadRates();
    }, [t]);
    
    const CURRENCY_INFO = {
        USD: { flag: '🇺🇸', color: 'text-green-600' },
        EUR: { flag: '🇪🇺', color: 'text-blue-600' },
        GBP: { flag: '🇬🇧', color: 'text-red-600' },
    };

    return (
        <div className="bg-cnk-panel-light p-5 rounded-cnk-card shadow-md border border-cnk-border-light">
            <div className="w-full h-1.5 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mb-3"></div>
            <p className="text-sm text-cnk-txt-muted-light">{t('exchangeRates')}</p>
            <div className="mt-1">
                {isLoading ? (
                    <div className="flex justify-center items-center h-16">
                        {/* Fix: Added size prop to Loader component call */}
                        <Loader size="sm" />
                    </div>
                ) : error ? (
                    <p className="text-xs text-red-500">{error}</p>
                ) : (
                    <div className="space-y-2">
                        {rates.map(rate => (
                            <div key={rate.code} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-cnk-txt-primary-light">
                                    <span className="mr-2">{CURRENCY_INFO[rate.code].flag}</span>
                                    {rate.code}
                                </span>
                                <span className={`font-mono font-semibold ${CURRENCY_INFO[rate.code].color}`}>
                                    {rate.forexSelling.toFixed(4)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExchangeRateCard;