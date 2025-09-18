import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Reconciliation, Customer } from '../types';
import { useReconciliation } from '../contexts/ReconciliationContext';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/common/Button';
import { useData } from '../contexts/DataContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { downloadReconciliationAsPdf } from '../services/pdfService';
import { formatCurrency, formatDate } from '../utils/formatting';
import Autocomplete from '../components/common/Autocomplete';
import Input from '../components/common/Input';

const CreateReconciliationModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { t } = useLanguage();
    const { addReconciliation } = useReconciliation();
    const { customers } = useData();
    const [state, setState] = useState({
        customerId: '',
        type: 'current_account' as Reconciliation['type'],
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        amount: 0,
        currency: 'TRY' as Reconciliation['currency'],
        details: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setState(prev => ({ ...prev, [id]: id === 'amount' ? parseFloat(value) || 0 : value }));
    };

    const handleSave = async () => {
        if (!state.customerId) return;
        await addReconciliation(state);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('createReconciliation')} footer={
            <><Button variant="secondary" onClick={onClose}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>
        }>
            <div className="space-y-4">
                <Autocomplete
                    items={customers.map(c => ({ id: c.id, name: c.name }))}
                    onSelect={(id) => setState(p => ({...p, customerId: id}))}
                    placeholder={t('selectCustomer')}
                />
                <Input id="period" type="month" label={t('period')} value={state.period} onChange={handleChange} />
                <Input id="amount" type="number" label={t('totalAmount')} value={String(state.amount)} onChange={handleChange} />
                <Input id="details" label={t('details')} value={state.details} onChange={handleChange} />
            </div>
        </Modal>
    );
};

const ReconciliationPage = () => {
    const { t } = useLanguage();
    const { reconciliations } = useReconciliation();
    const { customers } = useData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const getStatusClass = (status: Reconciliation['status']) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'in_review': return 'bg-purple-100 text-purple-800';
            case 'draft': default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const reconciliationColumns = [
        { header: t('customer'), accessor: (item: Reconciliation) => customers.find(c => c.id === item.customerId)?.name || t('unknownCustomer') },
        { header: t('type'), accessor: (item: Reconciliation) => t(item.type) },
        { header: t('period'), accessor: (item: Reconciliation) => item.period },
        { header: t('amount'), accessor: (item: Reconciliation) => formatCurrency(item.amount, item.currency) },
        { header: t('status'), accessor: (item: Reconciliation) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(item.status)}`}>{t(item.status)}</span> },
        { header: t('createdAt'), accessor: (item: Reconciliation) => formatDate(item.createdAt) },
        {
            header: t('actions'),
            accessor: (item: Reconciliation) => (
                <Button size="sm" onClick={async () => {
                     const customer = customers.find(c => c.id === item.customerId);
                     if(customer) await downloadReconciliationAsPdf(item, customer, [], t)
                }} icon="fas fa-file-pdf" />
            )
        }
    ];

    return (
        <div className="space-y-6">
            {isCreateModalOpen && <CreateReconciliationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('reconciliations')}</h1>
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary" icon="fas fa-plus">{t('createReconciliation')}</Button>
            </div>

            <div className="bg-cnk-panel-light p-4 rounded-cnk-card shadow-md border">
                <DataTable columns={reconciliationColumns} data={reconciliations} emptyStateMessage={t('noReconciliationYet')} />
            </div>
        </div>
    );
};

export default ReconciliationPage;