// This service simulates fetching data from a remote ERP system.
// It now uses direct object arrays from erpMockData instead of parsing CSVs.
import { Customer, Offer, IncomingInvoice, OutgoingInvoice, Warehouse, StockItem, StockLevel, ExchangeRate } from '../types';
import { MOCK_ERP_CUSTOMERS, MOCK_OUTGOING_INVOICES, MOCK_INCOMING_INVOICES, MOCK_ERP_OFFERS, MOCK_ERP_STOCK_ITEMS, MOCK_ERP_WAREHOUSES, MOCK_ERP_STOCK_LEVELS } from './erpMockData';

const SIMULATED_DELAY = 300; // ms

/**
 * Simulates fetching customer data from an ERP.
 * @returns A promise that resolves to an array of customer data objects.
 */
export const fetchCustomersFromErp = (): Promise<Omit<Customer, 'id' | 'createdAt' | 'synced'>[]> => {
    console.log("Simulating ERP fetch for CUSTOMERS...");
    return new Promise(resolve => {
        setTimeout(() => {
            // The data is already structured, no parsing needed.
            resolve(MOCK_ERP_CUSTOMERS);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching offer data from an ERP.
 * @returns A promise that resolves to an array of offer data objects.
 */
export const fetchOffersFromErp = (): Promise<(Omit<Offer, 'id' | 'createdAt' | 'toplam' | 'kdv' | 'genelToplam' | 'customerId'> & { customerCurrentCode: string })[]> => {
    console.log("Simulating ERP fetch for OFFERS...");
    return new Promise(resolve => {
        setTimeout(() => {
            // Calculate totals here, simulating a more complete ERP data object.
            const offersWithTotals = MOCK_ERP_OFFERS.map(offer => ({
                ...offer,
                toplam: offer.items.reduce((acc, item) => acc + item.tutar, 0),
                kdv: offer.items.reduce((acc, item) => acc + item.tutar, 0) * 0.20,
                genelToplam: offer.items.reduce((acc, item) => acc + item.tutar, 0) * 1.20,
            }));
            resolve(offersWithTotals);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching incoming invoice data from an ERP.
 * @returns A promise that resolves to an array of incoming invoice objects.
 */
export const fetchIncomingInvoices = (): Promise<IncomingInvoice[]> => {
    console.log("Simulating ERP fetch for INCOMING invoices...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_INCOMING_INVOICES);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching outgoing invoice data from an ERP.
 * @returns A promise that resolves to an array of outgoing invoice objects.
 */
export const fetchOutgoingInvoices = (): Promise<OutgoingInvoice[]> => {
    console.log("Simulating ERP fetch for OUTGOING invoices...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_OUTGOING_INVOICES);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching stock item master data from an ERP.
 * @returns A promise that resolves to an array of stock item objects.
 */
export const fetchStockItems = (): Promise<StockItem[]> => {
    console.log("Simulating ERP fetch for STOCK ITEMS...");
    return new Promise(resolve => {
        setTimeout(() => {
            const items: StockItem[] = MOCK_ERP_STOCK_ITEMS.map(item => ({
                id: item.sku, // Use SKU as the primary key for idempotency
                ...item,
                lastSync: new Date().toISOString()
            }));
            resolve(items);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching warehouse data from an ERP.
 * @returns A promise that resolves to an array of warehouse objects.
 */
export const fetchWarehouses = (): Promise<Warehouse[]> => {
    console.log("Simulating ERP fetch for WAREHOUSES...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_ERP_WAREHOUSES);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching stock level data from an ERP.
 * @returns A promise that resolves to an array of stock level objects.
 */
export const fetchStockLevels = (): Promise<Omit<StockLevel, 'id'>[]> => {
    console.log("Simulating ERP fetch for STOCK LEVELS...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_ERP_STOCK_LEVELS);
        }, SIMULATED_DELAY);
    });
};

/**
 * Simulates fetching daily exchange rates from TCMB.
 * @returns A promise that resolves to an array of exchange rate objects.
 */
export const fetchExchangeRates = (): Promise<ExchangeRate[]> => {
    console.log("Simulating TCMB fetch for EXCHANGE RATES...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { code: 'USD', name: 'ABD DOLARI', forexBuying: 32.85, forexSelling: 32.91 },
                { code: 'EUR', name: 'AVRO', forexBuying: 35.25, forexSelling: 35.33 },
                { code: 'GBP', name: 'İNGİLİZ STERLİNİ', forexBuying: 41.58, forexSelling: 41.72 },
            ]);
        }, SIMULATED_DELAY);
    });
};