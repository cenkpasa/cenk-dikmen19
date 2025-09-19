import { api } from './apiService';
import { ExchangeRate } from '@/types';

type Fx = { USD?: number; EUR?: number; date?: string };

// This would hit a backend proxy to avoid CORS issues with TCMB
export async function getLatestFx(): Promise<Fx> {
    // const { data } = await api.get('/fx/tcmb');
    // return data;
    
    // Simulating the response for now
    await new Promise(res => setTimeout(res, 200));
    const rates = await import('@/services/erpApiService').then(m => m.fetchExchangeRates());
    const usdRate = rates.find(r => r.code === 'USD')?.forexSelling;
    const eurRate = rates.find(r => r.code === 'EUR')?.forexSelling;
    
    return {
        USD: usdRate,
        EUR: eurRate,
        date: new Date().toLocaleDateString('tr-TR')
    };
}
