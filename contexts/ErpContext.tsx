import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ErpSettings, StockItem, Invoice, Customer, Offer, IncomingInvoice, OutgoingInvoice, StockLevel, Warehouse } from '../types';
import { db } from '../services/dbService';
import * as erpApiService from '../services/erpApiService';
import type { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface SyncResult {
    type: string;
    fetched: number;
    added: number;
    updated: number;
}

interface ErpContextType {
    erpSettings: ErpSettings | undefined;
    updateErpSettings: (settings: ErpSettings) => Promise<void>;
    stockItems: StockItem[];
    invoices: Invoice[];
    syncStock: () => Promise<SyncResult>;
    syncStockLevels: () => Promise<SyncResult>;
    syncCustomers: () => Promise<SyncResult>;
    syncOffers: () => Promise<SyncResult>;
    syncIncomingInvoices: () => Promise<SyncResult>;
    syncOutgoingInvoices: () => Promise<SyncResult>;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

interface ErpProviderProps {
    children: ReactNode;
}

export const ErpProvider = ({ children }: ErpProviderProps) => {
    const erpSettings = useLiveQuery(() => db.erpSettings.get('default'), []);
    const stockItems = useLiveQuery(() => db.stockItems.toArray(), []) || [];
    const invoices = useLiveQuery(() => db.invoices.toArray(), []) || [];

    const updateErpSettings = async (settings: ErpSettings) => {
        await db.erpSettings.put(settings);
    };
    
    const syncIncomingInvoices = async (): Promise<SyncResult> => {
        const fetchedInvoices = await erpApiService.fetchIncomingInvoices();
        
        await db.incomingInvoices.bulkPut(fetchedInvoices);
        
        const currentSettings = erpSettings || await db.erpSettings.get('default');
        if (currentSettings) {
            await updateErpSettings({ ...currentSettings, lastSyncIncomingInvoices: new Date().toISOString() });
        }
        return { type: 'Gelen Fatura', fetched: fetchedInvoices.length, added: fetchedInvoices.length, updated: 0 };
    };
    
    const syncOutgoingInvoices = async (): Promise<SyncResult> => {
        const fetchedInvoices = await erpApiService.fetchOutgoingInvoices();
        
        await db.outgoingInvoices.bulkPut(fetchedInvoices);
        
        const currentSettings = erpSettings || await db.erpSettings.get('default');
        if (currentSettings) {
            await updateErpSettings({ ...currentSettings, lastSyncOutgoingInvoices: new Date().toISOString() });
        }
        return { type: 'Giden Fatura', fetched: fetchedInvoices.length, added: fetchedInvoices.length, updated: 0 };
    };

    const syncCustomers = async (): Promise<SyncResult> => {
        const fetchedCustomers = await erpApiService.fetchCustomersFromErp();
        const existingCustomers = await db.customers.where('currentCode').anyOf(fetchedCustomers.map(c => c.currentCode || '').filter(Boolean)).toArray();
        const existingCustomerMap = new Map(existingCustomers.map(c => [c.currentCode, c]));

        let addedCount = 0;
        let updatedCount = 0;

        const customersToUpsert = fetchedCustomers.map(fetchedCust => {
            if (!fetchedCust.currentCode) return null;
            const existing = existingCustomerMap.get(fetchedCust.currentCode);
            if (existing) {
                updatedCount++;
                return { ...existing, ...fetchedCust, name: fetchedCust.name }; // Ensure name gets updated
            } else {
                addedCount++;
                return {
                    ...fetchedCust,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    synced: true,
                };
            }
        }).filter((c): c is Customer => c !== null);
        
        if (customersToUpsert.length > 0) {
            await db.customers.bulkPut(customersToUpsert);
        }

        const currentSettings = erpSettings || await db.erpSettings.get('default');
        if (currentSettings) {
            await updateErpSettings({ ...currentSettings, lastSyncCustomers: new Date().toISOString() });
        }
        
        return { type: 'Müşteri', fetched: fetchedCustomers.length, added: addedCount, updated: updatedCount };
    };

    const syncStock = async (): Promise<SyncResult> => {
        const fetchedItems = await erpApiService.fetchStockItems();
        await db.stockItems.bulkPut(fetchedItems);

        const currentSettings = erpSettings || await db.erpSettings.get('default');
        if (currentSettings) {
            await updateErpSettings({ ...currentSettings, lastSyncStock: new Date().toISOString() });
        }
        return { type: 'Stok Kartı', fetched: fetchedItems.length, added: fetchedItems.length, updated: 0 };
    };
    
    const syncStockLevels = async (): Promise<SyncResult> => {
        const fetchedWarehouses = await erpApiService.fetchWarehouses();
        await db.warehouses.bulkPut(fetchedWarehouses);

        const fetchedLevels = await erpApiService.fetchStockLevels();
        
        await db.stockLevels.clear();
        const levelsToUpsert = fetchedLevels.map(level => ({
            ...level,
            id: uuidv4()
        }));
        await db.stockLevels.bulkPut(levelsToUpsert);
        
        const currentSettings = erpSettings || await db.erpSettings.get('default');
        if (currentSettings) {
            await updateErpSettings({ ...currentSettings, lastSyncStockLevels: new Date().toISOString() });
        }

        return { type: 'Stok Seviyesi', fetched: fetchedLevels.length, added: fetchedLevels.length, updated: 0 };
    };

    const syncOffers = async (): Promise<SyncResult> => {
        const fetchedOffers = await erpApiService.fetchOffersFromErp();
        const allCrmCustomers = await db.customers.toArray();
        const customerCodeToIdMap = new Map(allCrmCustomers.filter(c => c.currentCode).map(c => [c.currentCode!, c.id]));
        const existingOffers = await db.offers.where('teklifNo').anyOf(fetchedOffers.map(o => o.teklifNo)).toArray();
        const existingOfferMap = new Map(existingOffers.map(o => [o.teklifNo, o]));
        
        let addedCount = 0;
        let updatedCount = 0;

        const offersToUpsert = fetchedOffers.map(fetchedOffer => {
            const customerId = customerCodeToIdMap.get(fetchedOffer.customerCurrentCode);
            if (!customerId) return null;

            const { customerCurrentCode, ...offerData } = fetchedOffer;
            const existing = existingOfferMap.get(fetchedOffer.teklifNo);

            if (existing) {
                updatedCount++;
                return { ...existing, ...offerData, customerId };
            } else {
                addedCount++;
                return { ...offerData, id: uuidv4(), createdAt: new Date().toISOString(), customerId };
            }
        }).filter((o): o is Offer => o !== null);

        if (offersToUpsert.length > 0) {
            await db.offers.bulkPut(offersToUpsert);
        }

        const currentSettings = erpSettings || await db.erpSettings.get('default');
        if (currentSettings) {
            await updateErpSettings({ ...currentSettings, lastSyncOffers: new Date().toISOString() });
        }
        
        return { type: 'Teklif', fetched: fetchedOffers.length, added: addedCount, updated: updatedCount };
    };
    
    const value = {
        erpSettings,
        updateErpSettings,
        stockItems,
        invoices,
        syncStock,
        syncStockLevels,
        syncCustomers,
        syncOffers,
        syncIncomingInvoices,
        syncOutgoingInvoices,
    };

    return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
};

export const useErp = (): ErpContextType => {
    const context = useContext(ErpContext);
    if (!context) {
        throw new Error('useErp must be used within an ErpProvider');
    }
    return context;
};