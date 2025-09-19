import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as erpApiService from '@/services/erpApiService';
import { StokOgeleri, Fatura, CariHareket, Teklif } from '@/types';
import { useNotification } from './NotificationContext';
import { mapErpToStok, mapErpToFatura } from '@/services/erpAdapters';

export type ErpCtx = {
    stoklar: StokOgeleri[] | undefined;
    faturalar: Fatura[] | undefined;
    cariHareketler: CariHareket[] | undefined;
    teklifler: Teklif[] | undefined;
    refreshAll: () => Promise<void>;
    syncNow: () => Promise<void>;
};

const Ctx = createContext<ErpCtx | null>(null);

const ErpProviderContent = ({ children }: { children: ReactNode }) => {
    const qc = useQueryClient();
    const { showNotification } = useNotification();

    const stokQ = useQuery({ 
        queryKey: ['erp', 'stok'], 
        queryFn: async () => {
            const rawData = await erpApiService.getStocks();
            return rawData.map(mapErpToStok);
        }
    });
    const fatQ = useQuery({ 
        queryKey: ['erp', 'fatura'], 
        queryFn: async () => {
            const rawData = await erpApiService.getInvoices();
            return rawData.map(mapErpToFatura);
        }
    });
    const cariQ = useQuery({ queryKey: ['erp', 'cari'], queryFn: erpApiService.getLedger });
    const tkfQ = useQuery({ queryKey: ['erp', 'teklif'], queryFn: erpApiService.getQuotes });

    async function refreshAll() {
        await Promise.all([
            qc.invalidateQueries({ queryKey: ['erp', 'stok'] }),
            qc.invalidateQueries({ queryKey: ['erp', 'fatura'] }),
            qc.invalidateQueries({ queryKey: ['erp', 'cari'] }),
            qc.invalidateQueries({ queryKey: ['erp', 'teklif'] })
        ]);
    }

    async function syncNow() {
        try {
            await erpApiService.triggerSync();
            await refreshAll();
            showNotification('syncSuccess', 'success');
        } catch (error) {
            console.error("Sync failed:", error);
            showNotification('syncError', 'error');
        }
    }

    const value: ErpCtx = {
        stoklar: stokQ.data,
        faturalar: fatQ.data,
        cariHareketler: cariQ.data,
        teklifler: tkfQ.data,
        refreshAll,
        syncNow
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const ErpProvider = ({ children }: { children: React.ReactNode }) => {
    // React Query client is now managed globally in index.tsx
    return <ErpProviderContent>{children}</ErpProviderContent>;
}


export function useErp() {
    const v = useContext(Ctx);
    if (!v) throw new Error('useErp must be used within an ErpProvider');
    return v;
}