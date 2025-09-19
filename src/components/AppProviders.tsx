import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ErpProvider } from '@/contexts/ErpContext';
import { PersonnelProvider } from '@/contexts/PersonnelContext';
import { NotificationCenterProvider } from '@/contexts/NotificationCenterContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ReconciliationProvider } from '@/contexts/ReconciliationContext';
import App from '@/components/App';

export const AppProviders = () => {
    return (
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
    );
};
