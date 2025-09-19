import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationCenterProvider } from '@/contexts/NotificationCenterContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { DataProvider } from '@/contexts/DataContext';
import { ErpProvider } from '@/contexts/ErpContext';
import { PersonnelProvider } from '@/contexts/PersonnelContext';
import { ReconciliationProvider } from '@/contexts/ReconciliationContext';
import { seedDatabase } from '@/services/dbService';
import Loader from '@/components/common/Loader';

const qc = new QueryClient();

export default function AppProviders({ children }: { children: React.ReactNode }) {
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
            <QueryClientProvider client={qc}>
                <LanguageProvider>
                    <NotificationProvider>
                        <NotificationCenterProvider>
                            <AuthProvider>
                                <SettingsProvider>
                                    <DataProvider>
                                        <ErpProvider>
                                            <PersonnelProvider>
                                                <ReconciliationProvider localData={{}}>
                                                    {children}
                                                </ReconciliationProvider>
                                            </PersonnelProvider>
                                        </ErpProvider>
                                    </DataProvider>
                                </SettingsProvider>
                            </AuthProvider>
                        </NotificationCenterProvider>
                    </NotificationProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </BrowserRouter>
    );
}
