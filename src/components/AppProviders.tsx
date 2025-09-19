import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/components/App';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ErpProvider } from '@/contexts/ErpContext';
import { PersonnelProvider } from '@/contexts/PersonnelContext';
import { NotificationCenterProvider } from '@/contexts/NotificationCenterContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ReconciliationProvider } from '@/contexts/ReconciliationContext';
import { seedDatabase } from '@/services/dbService';
import Loader from '@/components/common/Loader';

const queryClient = new QueryClient();

export const AppProviders = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initialize = async () => {
            try {
                await seedDatabase();
            } catch (error) {
                console.error("Database seeding failed:", error);
            } finally {
                setIsInitialized(true);
            }
        };
        initialize();
    }, []);

    if (!isInitialized) {
        return <Loader fullScreen={true} />;
    }
    
    return (
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            <SettingsProvider>
                                <NotificationCenterProvider>
                                    <DataProvider>
                                        <ErpProvider>
                                            <PersonnelProvider>
                                                <ReconciliationProvider>
                                                    <App />
                                                </ReconciliationProvider>
                                            </PersonnelProvider>
                                        </ErpProvider>
                                    </DataProvider>
                                </NotificationCenterProvider>
                            </SettingsProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </BrowserRouter>
    );
};
