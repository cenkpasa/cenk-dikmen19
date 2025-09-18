



import React, { useState, useMemo } from 'react';
import { useErp, SyncResult } from '../contexts/ErpContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { User, ErpSettings, StockItem } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import StockLevelDetail from '../components/erp/StockLevelDetail';
import EmptyState from '../components/common/EmptyState';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/dbService';
import { formatCurrency, formatDate } from '../utils/formatting';
import { ViewState } from '../components/ai/App';
import FinanceManagementPage from './FinanceManagementPage';
import PurchaseManagementPage from './PurchaseManagementPage';
import SalesManagementPage from './SalesManagementPage';
import StockManagementPage from './StockManagementPage';


const TargetEditModal = ({ isOpen, onClose, user, onSave }: { isOpen: boolean, onClose: () => void, user: User, onSave: (target: number) => void }) => {
    const { t } = useLanguage();
    const [target, setTarget] = useState(user.salesTarget || 0);

    const handleSave = () => {
        onSave(Number(target));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('salesTargetFor', { name: user.name })} footer={
            <>
                <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleSave}>{t('save')}</Button>
            </>
        }>
            <Input
                label={t('targetAmount')}
                id="salesTarget"
                type="number"
                value={String(target)}
                onChange={(e) => setTarget(Number(e.target.value))}
            />
        </Modal>
    );
};

const SyncSummaryModal = ({ isOpen, onClose, result }: { isOpen: boolean, onClose: () => void, result: SyncResult | null }) => {
    const { t } = useLanguage();
    if (!result) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('syncSummaryTitle', {type: result.type})} footer={
            <Button onClick={onClose}>{t('close')}</Button>
        }>
            <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <i className="fas fa-check-circle text-2xl text-green-600"></i>
                </div>
                <h3 className="text-lg font-medium leading-6 text-cnk-txt-primary-light">{t('syncSuccessTitle')}</h3>
                <div className="mt-2 text-sm text-cnk-txt-secondary-light">
                    <p dangerouslySetInnerHTML={{ __html: t('syncSummaryBody', { fetched: String(result.fetched), added: String(result.added), updated: String(result.updated) }) }} />
                </div>
                <div className="mt-4 flex justify-around rounded-cnk-element bg-cnk-bg-light p-4">
                    <div>
                        <div className="text-2xl font-bold text-green-600">{result.added}</div>
                        <div className="text-sm font-medium text-cnk-txt-muted-light">{t('newRecordsAdded')}</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
                        <div className="text-sm font-medium text-cnk-txt-muted-light">{t('recordsUpdated')}</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const SyncCard = ({ titleKey, descriptionKey, lastSync, type, onSync, isSyncing, isConnected } : { titleKey: string, descriptionKey: string, lastSync?: string, type: 'customers' | 'offers' | 'stock' | 'stockLevels' | 'incoming' | 'outgoing', onSync: (type: any) => void, isSyncing: string | null, isConnected: boolean }) => {
    const { t } = useLanguage();
    const syncKeyMap = { customers: 'syncCustomers', offers: 'syncOffers', stock: 'syncStock', stockLevels: 'syncStockLevels', incoming: 'syncIncomingInvoices', outgoing: 'syncOutgoingInvoices' };
    return (
        <div className="flex flex-col justify-between p-4 bg-cnk-bg-light rounded-cnk-element border border-cnk-border-light">
            <div>
                <h3 className="font-semibold text-lg text-cnk-txt-secondary-light">{t(titleKey)}</h3>
                <p className="text-xs text-cnk-txt-muted-light mt-1 mb-2 h-8">{t(descriptionKey)}</p>
                <p className="text-xs text-cnk-txt-muted-light/50">Son Senk: {lastSync ? new Date(lastSync).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="flex gap-2 mt-3">
                <Button onClick={() => onSync(type)} isLoading={isSyncing === type} disabled={!isConnected || (isSyncing !== null && isSyncing !== type)} className="w-full">{t(syncKeyMap[type])}</Button>
            </div>
        </div>
    );
};

const ErpIntegrationPage = ({ setView }: { setView: (view: ViewState) => void; }) => {
    const { t } = useLanguage();
    const { erpSettings, updateErpSettings, invoices, syncCustomers, syncOffers, syncIncomingInvoices, syncOutgoingInvoices, syncStock, syncStockLevels } = useErp();
    const { users, updateUser, currentUser } = useAuth();
    const { showNotification } = useNotification();
    
    const [settings, setSettings] = useState<ErpSettings | null>(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [activeTab, setActiveTab] = useState('sync');

    React.useEffect(() => {
        if (erpSettings) {
            setSettings(erpSettings);
        }
    }, [erpSettings]);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (settings) {
            setSettings({ ...settings, [e.target.id]: e.target.value });
        }
    };

    const handleToggleConnection = async () => {
        if (!settings) return;
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 1000));
        await updateErpSettings({ ...settings, isConnected: !settings.isConnected });
        setIsLoading(false);
    };

    const handleSync = async (type: 'stock' | 'stockLevels' | 'customers' | 'offers' | 'incoming' | 'outgoing') => {
        setIsSyncing(type);
        try {
            let result;
            switch(type) {
                case 'stock': result = await syncStock(); break;
                case 'stockLevels': result = await syncStockLevels(); break;
                case 'customers': result = await syncCustomers(); break;
                case 'offers': result = await syncOffers(); break;
                case 'incoming': result = await syncIncomingInvoices(); break;
                case 'outgoing': result = await syncOutgoingInvoices(); break;
            }
            setSyncResult(result);
        } catch (error) {
            console.error("Sync failed:", error);
            showNotification('genericError', 'error');
        } finally {
            setIsSyncing(null);
        }
    };

    const handleSaveTarget = async (user: User, target: number) => {
        await updateUser({ ...user, salesTarget: target });
        showNotification('userUpdated', 'success');
        setEditingUser(null);
    };

    const salesData = useMemo(() => {
        return users.map(user => {
            const monthlySales = invoices
                .filter(inv => inv.userId === user.id)
                .reduce((sum, inv) => sum + inv.totalAmount, 0);
            const progress = (user.salesTarget && user.salesTarget > 0) ? (monthlySales / user.salesTarget) * 100 : 0;
            return { ...user, monthlySales, progress };
        });
    }, [users, invoices]);
    
    const canAccess = currentUser?.role === 'admin' || currentUser?.role === 'muhasebe';

    if (!canAccess) {
        return <p className="text-center p-4 bg-yellow-500/10 text-yellow-300 rounded-cnk-element">{t('permissionDenied')}</p>;
    }

    if (!settings) {
        return <Loader fullScreen />;
    }
    
    const tabs = [
        { id: 'sync', label: t('erpConnectionTab')},
        { id: 'stock', label: t('stockManagement')},
        { id: 'purchase', label: t('purchaseManagement')},
        { id: 'sales', label: t('salesManagement')},
        { id: 'finance', label: t('financeManagement')},
        { id: 'targets', label: t('erpSalesTargetsTab')},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('erpIntegration')}</h1>
            </div>
            {editingUser && <TargetEditModal isOpen={true} onClose={() => setEditingUser(null)} user={editingUser} onSave={(target) => handleSaveTarget(editingUser, target)} />}
            <SyncSummaryModal isOpen={!!syncResult} onClose={() => setSyncResult(null)} result={syncResult} />
            
            <div className="bg-cnk-panel-light p-4 rounded-cnk-card shadow-md">
                <div className="flex flex-wrap gap-2 border-b border-cnk-border-light mb-4">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                                className={`px-4 py-2 text-sm font-medium rounded-t-cnk-element -mb-px ${activeTab === tab.id ? 'border border-cnk-border-light border-b-white text-cnk-accent-primary' : 'text-cnk-txt-muted-light hover:bg-cnk-bg-light'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {activeTab === 'sync' && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="rounded-cnk-card border border-cnk-border-light bg-cnk-bg-light p-6 shadow-sm lg:col-span-1">
                            <h2 className="text-xl font-semibold text-cnk-accent-primary mb-4">{t('databaseConnection')}</h2>
                            <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-lg text-sm" role="alert">
                                <p className="font-bold">Güvenlik Uyarısı</p>
                                <p>Canlı bir ERP sunucusuna bağlanıyorsunuz. Bu işlemi yalnızca güvenli bir ağ üzerinden yaptığınızdan emin olun.</p>
                            </div>
                            <div className="space-y-4">
                                <Input label={t('server')} id="server" value={settings.server} onChange={handleSettingsChange} disabled={settings.isConnected}/>
                                <Input label={t('username')} id="username" value={settings.username} onChange={handleSettingsChange} disabled={settings.isConnected}/>
                                <Input label={t('password')} id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={settings.isConnected}/>

                                <Button onClick={handleToggleConnection} isLoading={isLoading} variant={settings.isConnected ? 'danger' : 'success'} className="w-full">
                                    {settings.isConnected ? t('disconnect') : t('connect')}
                                </Button>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                             <h2 className="text-xl font-semibold text-cnk-accent-primary mb-4">{t('dataSync')}</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SyncCard titleKey="customerListTitle" descriptionKey="erpCustomerSyncDesc" lastSync={settings.lastSyncCustomers} type="customers" onSync={handleSync} isSyncing={isSyncing} isConnected={settings.isConnected} />
                                <SyncCard titleKey="stockManagement" descriptionKey="erpStockSyncDesc" lastSync={settings.lastSyncStock} type="stock" onSync={handleSync} isSyncing={isSyncing} isConnected={settings.isConnected} />
                                <SyncCard titleKey="warehouseStockLevels" descriptionKey="erpStockLevelSyncDesc" lastSync={settings.lastSyncStockLevels} type="stockLevels" onSync={handleSync} isSyncing={isSyncing} isConnected={settings.isConnected} />
                                <SyncCard titleKey="incomingInvoices" descriptionKey="erpIncomingInvoiceSyncDesc" lastSync={settings.lastSyncIncomingInvoices} type="incoming" onSync={handleSync} isSyncing={isSyncing} isConnected={settings.isConnected} />
                                <SyncCard titleKey="outgoingInvoices" descriptionKey="erpOutgoingInvoiceSyncDesc" lastSync={settings.lastSyncOutgoingInvoices} type="outgoing" onSync={handleSync} isSyncing={isSyncing} isConnected={settings.isConnected} />
                             </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'stock' && <StockManagementPage />}
                 {activeTab === 'purchase' && <PurchaseManagementPage />}
                 {activeTab === 'sales' && <SalesManagementPage />}
                 {activeTab === 'finance' && <FinanceManagementPage />}
                 {activeTab === 'targets' && (
                     <DataTable
                        columns={[
                            { header: t('personnel'), accessor: (item: any) => item.name },
                            { header: t('monthlyTarget'), accessor: (item: any) => formatCurrency(item.salesTarget || 0, 'TRY') },
                            { header: t('thisMonthSales'), accessor: (item: any) => formatCurrency(item.monthlySales, 'TRY') },
                            {
                                header: t('progress'), accessor: (item: any) => (
                                    <div className="w-full bg-cnk-bg-light rounded-full h-2.5">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(item.progress, 100)}%` }}></div>
                                    </div>
                                )
                            },
                            { header: t('actions'), accessor: (item: any) => <Button size="sm" onClick={() => setEditingUser(item)}>{t('editTarget')}</Button> },
                        ]}
                        data={salesData}
                    />
                 )}
            </div>
        </div>
    );
};

export default ErpIntegrationPage;