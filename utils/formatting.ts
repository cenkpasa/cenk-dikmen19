


import { ParaBirimi } from '@/types';

export function formatCurrency(v: number, ccy: ParaBirimi ='TRY') {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: ccy }).format(v || 0);
}

export const formatDate = (isoString?: string): string => {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

export const formatDateTime = (isoString?: string): string => {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};