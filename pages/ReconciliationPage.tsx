import React from 'react';
import { useReconciliation } from '@/contexts/ReconciliationContext';

function Box({ head, rows, cols }: any) {
    return (
        <div className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="text-md font-semibold text-gray-700 mb-2">{head}</div>
            <div className="max-h-64 overflow-auto text-xs">
                {rows.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {cols.map((c: string) => (
                                    <th key={c} className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.slice(0, 100).map((r: any, i: number) => (
                                <tr key={i}>
                                    {cols.map((c: string) => (
                                        <td key={c} className="px-4 py-2 whitespace-nowrap">{String(r[c] ?? '')}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 text-center py-4">Veri yok.</p>
                )}
            </div>
        </div>
    );
}

function Section({ title, diff, cols }: any) {
    return (
        <div>
            <h2 className="font-semibold text-xl mb-3 text-gray-800">{title}</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <Box head={`Sadece Uygulamada (${diff.onlyLocal.length})`} rows={diff.onlyLocal} cols={cols} />
                <Box head={`Sadece ERP'de (${diff.onlyErp.length})`} rows={diff.onlyErp} cols={cols} />
                <Box head={`Çatışmalar (${diff.conflicts.length})`} rows={diff.conflicts.map((c: any) => c.right)} cols={cols} />
            </div>
        </div>
    );
}

export default function ReconciliationPage() {
    const { stokDiff, faturaDiff, cariDiff, teklifDiff } = useReconciliation();

    return (
        <div className="p-4 grid gap-8">
            <Section title="Stok Mutabakatı" diff={stokDiff} cols={["code", "depot", "name", "price"]} />
            <Section title="Fatura Mutabakatı" diff={faturaDiff} cols={["invoiceNo", "date", "total"]} />
            <Section title="Cari Mutabakatı" diff={cariDiff} cols={["cariCode", "date", "docNo", "balance"]} />
            <Section title="Teklif Mutabakatı" diff={teklifDiff} cols={["quoteNo", "date", "total"]} />
        </div>
    );
}
