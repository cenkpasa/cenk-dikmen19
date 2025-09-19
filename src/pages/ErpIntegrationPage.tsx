import React from 'react';
import { useErp } from '@/contexts/ErpContext';
import Button from '@/components/common/Button';

function Card({ title, count }: { title: string; count: number }) {
    return (
        <div className="border rounded-lg p-4 bg-white shadow">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-3xl font-semibold text-gray-800">{count.toLocaleString('tr-TR')}</div>
        </div>
    );
}

export default function ErpIntegrationPage() {
    const { stoklar = [], faturalar = [], cariHareketler = [], teklifler = [], syncNow } = useErp();

    return (
        <div className="p-4 grid gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ERP Entegrasyonu</h1>
                <Button onClick={syncNow} variant="primary">
                    Şimdi Senkronize Et
                </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card title="Stoklar" count={stoklar.length} />
                <Card title="Faturalar" count={faturalar.length} />
                <Card title="Cari Hareketler" count={cariHareketler.length} />
                <Card title="Teklifler" count={teklifler.length} />
            </div>
        </div>
    );
}