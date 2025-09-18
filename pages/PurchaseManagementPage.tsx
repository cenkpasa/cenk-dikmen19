import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/dbService';
import { IncomingInvoice } from '../types';
import DataTable from '../components/common/DataTable';
import { formatCurrency, formatDate } from '../utils/formatting';

const PurchaseManagementPage = () => {
    const { t } = useLanguage();
    const incomingInvoices = useLiveQuery(() => db.incomingInvoices.toArray(), []) || [];

    const columns = [
        { header: t('invoiceNo'), accessor: (item: IncomingInvoice) => item.faturaNo },
        { header: t('supplier'), accessor: (item: IncomingInvoice) => item.tedarikciAdi },
        { header: t('date'), accessor: (item: IncomingInvoice) => formatDate(item.tarih) },
        { header: t('taxID'), accessor: (item: IncomingInvoice) => item.vergiNo },
        { header: t('totalAmount'), accessor: (item: IncomingInvoice) => formatCurrency(item.tutar, item.currency) },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{`${t('purchaseManagement')} (${t('incomingInvoices')})`}</h1>
            
            <div className="bg-cnk-panel-light p-4 rounded-cnk-card shadow-md border">
                <DataTable 
                    columns={columns} 
                    data={incomingInvoices} 
                    emptyStateMessage={t('noInvoiceData')} 
                />
            </div>
        </div>
    );
};

export default PurchaseManagementPage;
