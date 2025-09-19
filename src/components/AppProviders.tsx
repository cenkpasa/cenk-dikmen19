import React from 'react';
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

const qc = new QueryClient();

export default function AppProviders({ children }: { children: React.ReactNode }) {
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
                        <ReconciliationProvider>
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