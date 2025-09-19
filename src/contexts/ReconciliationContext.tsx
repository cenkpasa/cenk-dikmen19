import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useErp } from '@/contexts/ErpContext';

type Diff<T> = { onlyLocal: T[]; onlyErp: T[]; conflicts: { left: T; right: T }[] };

type CtxType = {
    stokDiff: Diff<any>;
    cariDiff: Diff<any>;
    faturaDiff: Diff<any>;
    teklifDiff: Diff<any>;
};

const ReconciliationContext = createContext<CtxType | undefined>(undefined);

function keyify(obj: any, keys: string[]) {
    return keys.map((k) => String(obj?.[k] ?? '')).join('::');
}

export function ReconciliationProvider({ children, localData }: { children: ReactNode; localData?: { stok?: any[]; cari?: any[]; fatura?: any[]; teklif?: any[] } }) {
    const { stoklar = [], cariHareketler = [], faturalar = [], teklifler = [] } = useErp();

    const stokLocal = localData?.stok || [];
    const cariLocal = localData?.cari || [];
    const fatLocal = localData?.fatura || [];
    const tkfLocal = localData?.teklif || [];

    function diff<T>(left: T[], right: T[], keys: string[]): Diff<T> {
        const L = new Map(left.map((x) => [keyify(x, keys), x]));
        const R = new Map(right.map((x) => [keyify(x, keys), x]));
        const onlyLocal: T[] = [];
        const onlyErp: T[] = [];
        const conflicts: { left: T; right: T }[] = [];

        for (const [k, v] of L) {
            if (!R.has(k)) onlyLocal.push(v);
            else {
                const r = R.get(k)!;
                if (JSON.stringify(v) !== JSON.stringify(r)) conflicts.push({ left: v, right: r });
            }
        }
        for (const [k, v] of R) if (!L.has(k)) onlyErp.push(v);
        return { onlyLocal, onlyErp, conflicts };
    }

    const value = useMemo<CtxType>(() => ({
        stokDiff: diff(stokLocal, stoklar, ['code', 'depot']),
        cariDiff: diff(cariLocal, cariHareketler, ['cariCode', 'date', 'docNo']),
        faturaDiff: diff(fatLocal, faturalar, ['invoiceNo', 'date']),
        teklifDiff: diff(tkfLocal, teklifler, ['quoteNo', 'date'])
    }), [stokLocal, stoklar, cariLocal, cariHareketler, fatLocal, faturalar, tkfLocal, teklifler]);

    return <ReconciliationContext.Provider value={value}>{children}</ReconciliationContext.Provider>;
}


export function useReconciliation(): CtxType {
    const context = useContext(ReconciliationContext);
    if (!context) {
        throw new Error('useReconciliation must be used within a ReconciliationProvider');
    }
    return context;
}