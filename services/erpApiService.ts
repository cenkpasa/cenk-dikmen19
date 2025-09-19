import { api } from './apiService';
// Fix: Corrected type from Stok to StokOgeleri
import { StokOgeleri, Fatura, CariHareket, Teklif, ExchangeRate } from '@/types';

export async function triggerSync() {
    await api.post('/sync');
}

export async function getStocks(): Promise<StokOgeleri[]> {
    const { data } = await api.get('/data/stok');
    return data;
}

export async function getInvoices(): Promise<Fatura[]> {
    const { data } = await api.get('/data/fatura');
    return data;
}

export async function getLedger(): Promise<CariHareket[]> {
    const { data } = await api.get('/data/cari');
    return data;
}

export async function getQuotes(): Promise<Teklif[]> {
    const { data } = await api.get('/data/teklif');
    return data;
}

/**
 * Simulates fetching daily exchange rates from TCMB via a backend proxy.
 * @returns A promise that resolves to an array of exchange rate objects.
 */
export const fetchExchangeRates = (): Promise<ExchangeRate[]> => {
    console.log("Fetching EXCHANGE RATES via backend proxy...");
    // In a real app, this would hit our own backend, e.g., api.get('/fx/tcmb')
    // For this simulation, we still use a local mock.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { code: 'USD', name: 'ABD DOLARI', forexBuying: 32.85, forexSelling: 32.91 },
                { code: 'EUR', name: 'AVRO', forexBuying: 35.25, forexSelling: 35.33 },
                { code: 'GBP', name: 'İNGİLİZ STERLİNİ', forexBuying: 41.58, forexSelling: 41.72 },
            ]);
        }, 300);
    });
};