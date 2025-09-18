import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/dbService';
import { OutgoingInvoice } from '../types';
import DataTable from '../components/common/DataTable';
import { formatCurrency, formatDate } from '../utils/formatting';

const SalesManagementPage = () => {
    const { t } = useLanguage();
    const outgoingInvoices = useLiveQuery(() => db.outgoingInvoices.toArray(), []) || [];

    const columns = [
        { header: t('invoiceNo'), accessor: (item: OutgoingInvoice) => item.faturaNo },
        { header: t('customer'), accessor: (item: OutgoingInvoice) => item.musteriAdi },
        { header: t('date'), accessor: (item: OutgoingInvoice) => formatDate(item.tarih) },
        { header: t('taxID'), accessor: (item: OutgoingInvoice) => item.vergiNo },
        { header: t('totalAmount'), accessor: (item: OutgoingInvoice) => formatCurrency(item.tutar, item.currency) },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{`${t('salesManagement')} (${t('outgoingInvoices')})`}</h1>
            
            <div className="bg-cnk-panel-light p-4 rounded-cnk-card shadow-md border">
                <DataTable 
                    columns={columns} 
                    data={outgoingInvoices} 
                    emptyStateMessage={t('noInvoiceData')} 
                />
            </div>
        </div>
    );
};

export default SalesManagementPage;
