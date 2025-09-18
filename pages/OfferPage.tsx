import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Offer, OfferItem, Customer } from '../types';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import { downloadOfferAsPdf, getOfferHtml } from '../services/pdfService';
import Loader from '../components/common/Loader';
import { ViewState } from '../components/ai/App';
import Modal from '../components/common/Modal';
import { v4 as uuidv4 } from 'uuid';
import Autocomplete from '../components/common/Autocomplete';
import { formatCurrency, formatDate } from '../utils/formatting';
import { fetchExchangeRates } from '../services/erpApiService';
import CustomerForm from '../components/forms/CustomerForm';

interface OfferPageProps {
    view: ViewState;
    setView: (view: ViewState) => void;
}

interface OfferListPageProps {
    setView: (view: ViewState) => void;
}

const OfferListPage = ({ setView }: OfferListPageProps) => {
    const { offers, customers } = useData();
    const { t } = useLanguage();
    const [isDownloading, setIsDownloading] = useState(false);
    const { showNotification } = useNotification();
    const { currentUser } = useAuth();

    const handleDownload = async (offer: Offer) => {
        setIsDownloading(true);
        const customer = customers.find(c => c.id === offer.customerId);
        const result = await downloadOfferAsPdf(offer, customer, t);
        if (result.success) {
            showNotification('pdfDownloaded', 'success');
        } else {
            showNotification('pdfError', 'error');
        }
        setIsDownloading(false);
    };

    const columns = [
        { header: t('offerCode'), accessor: (item: Offer) => <span className="font-mono text-sm">{item.teklifNo}</span> },
        { 
            header: t('customers'), 
            accessor: (item: Offer) => customers.find(c => c.id === item.customerId)?.name || t('unknownCustomer')
        },
        { header: t('offerDetails'), accessor: (item: Offer) => item.firma.yetkili },
        { header: t('amount'), accessor: (item: Offer) => formatCurrency(item.genelToplam, item.currency), className: 'font-semibold' },
        { header: t('createdAt'), accessor: (item: Offer) => formatDate(item.createdAt) },
        {
            header: t('actions'),
            accessor: (item: Offer) => (
                <div className="flex gap-2">
                    <Button variant="info" size="sm" onClick={() => setView({ page: 'teklif-yaz', id: item.id })} icon="fas fa-eye" title={currentUser?.role === 'admin' ? `${t('view')}/${t('edit')}` : t('view')} />
                    <Button variant="primary" size="sm" onClick={() => handleDownload(item)} icon="fas fa-file-pdf" title={t('downloadPdf')} />
                </div>
            ),
        },
    ];

    return (
        <div>
            {isDownloading && <Loader fullScreen={true} />}
             <div className="flex items-center justify-between mb-6">
                 <h1 className="text-2xl font-bold">{t('offerManagement')}</h1>
                <Button variant="primary" onClick={() => setView({ page: 'teklif-yaz', id: 'create' })} icon="fas fa-plus">{t('createOffer')}</Button>
            </div>
            <DataTable
                columns={columns}
                data={offers}
                emptyStateMessage={t('noOfferYet')}
            />
        </div>
    );
};

interface OfferFormProps {
    setView: (view: ViewState) => void;
    offerId?: string;
}

const OfferForm = ({ setView, offerId }: OfferFormProps) => {
    const { t } = useLanguage();
    const { offers, customers, addOffer, updateOffer } = useData();
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    
    const isCreateMode = offerId === 'create';
    const isReadOnly = !isCreateMode && currentUser?.role !== 'admin';

    const getInitialFormState = () => ({
        customerId: '',
        currency: 'TRY' as Offer['currency'],
        firma: { yetkili: '', telefon: '', eposta: '', vade: '30 Gün', teklifTarihi: new Date().toISOString().slice(0,10) },
        teklifVeren: { 
            yetkili: currentUser?.name || '', 
            telefon: '', 
            eposta: currentUser?.role === 'saha' ? 'satis@cnkkesicitakim.com.tr' : (currentUser?.username || '')
        },
        items: [],
        notlar: '',
    });
    
    const [formState, setFormState] = useState(getInitialFormState());
    const [exchangeRates, setExchangeRates] = useState<{ USD: number; EUR: number } | undefined>(undefined);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetchExchangeRates().then(rates => {
            const usd = rates.find(r => r.code === 'USD')?.forexSelling || 1;
            const eur = rates.find(r => r.code === 'EUR')?.forexSelling || 1;
            setExchangeRates({ USD: usd, EUR: eur });
        });
    }, []);

    const { toplam, kdv, genelToplam } = useMemo(() => {
        const subTotal = formState.items.reduce((acc, item) => acc + (item.tutar || 0), 0);
        const vat = subTotal * 0.20;
        const grandTotal = subTotal + vat;
        return { toplam: subTotal, kdv: vat, genelToplam: grandTotal };
    }, [formState.items]);

    useEffect(() => {
        if (offerId && offerId !== 'create') {
            const offer = offers.find(o => o.id === offerId);
            if (offer) {
                 setFormState({
                    customerId: offer.customerId,
                    currency: offer.currency,
                    firma: offer.firma,
                    teklifVeren: offer.teklifVeren,
                    items: offer.items,
                    notlar: offer.notlar,
                });
            }
        } else {
            setFormState(getInitialFormState());
        }
    }, [offerId, offers, currentUser]);

    const handleCustomerSelect = (custId: string) => {
        if (custId === 'yeni-musteri') {
            setIsNewCustomerModalOpen(true);
        } else {
            const customer = customers.find(c => c.id === custId);
            if (customer) {
                setFormState(prev => ({
                    ...prev,
                    customerId: custId,
                    firma: { ...prev.firma, yetkili: '', telefon: customer.phone1 || '', eposta: customer.email || '' }
                }));
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, section?: 'firma' | 'teklifVeren') => {
        const { id, value } = e.target;
        if (section) {
            setFormState(prev => ({ ...prev, [section]: {...prev[section], [id]: value }}));
        } else {
            setFormState(prev => ({ ...prev, [id]: value as any }));
        }
    };
    
    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id !== itemId) return item;
                const updatedItem = { ...item, [name]: (name === 'miktar' || name === 'fiyat') ? parseFloat(value) || 0 : value };
                updatedItem.tutar = updatedItem.miktar * updatedItem.fiyat;
                return updatedItem;
            })
        }));
    };

    const addItem = () => {
        const newItem: OfferItem = { id: uuidv4(), cins: '', miktar: 1, birim: 'Adet', fiyat: 0, tutar: 0, teslimSuresi: '' };
        setFormState(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (itemId: string) => {
        setFormState(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId)}));
    };
    
    const handleSubmit = () => {
        if(!formState.customerId || formState.items.length === 0) {
            showNotification('fieldsRequired', 'error');
            return;
        }

        const offerData: Omit<Offer, 'id' | 'createdAt' | 'teklifNo' | 'userId'> = {
            ...formState,
            exchangeRates,
            toplam,
            kdv,
            genelToplam,
        };

        if (isCreateMode) {
            addOffer(offerData);
            showNotification('offerAdded', 'success');
        } else if (offerId) {
            const existingOffer = offers.find(o => o.id === offerId)!;
            updateOffer({ ...existingOffer, ...offerData });
            showNotification('offerUpdated', 'success');
        }

        setView({ page: 'teklif-yaz' });
    };

    const InputField = ({label, id, value, onChange, section, readOnly=false, type="text"}: {label: string, id: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void, section: 'firma' | 'teklifVeren', readOnly?: boolean, type?: string}) => (
        <tr><td className="font-semibold w-24">{label}</td><td>:</td><td className="pl-2"><input type={type} id={id} value={value} onChange={onChange} readOnly={readOnly} className="w-full bg-transparent focus:outline-none focus:bg-slate-100 p-1 rounded"/></td></tr>
    );
    
    const selectedCustomer = customers.find(c => c.id === formState.customerId);

    return (
        <div className="max-w-5xl mx-auto">
            {isNewCustomerModalOpen && <CustomerForm isOpen={isNewCustomerModalOpen} onClose={() => setIsNewCustomerModalOpen(false)} customer={null}/>}
            <div className="flex justify-end items-center mb-6">
                 <Button onClick={() => setView({ page: 'teklif-yaz' })} variant="secondary" icon="fas fa-arrow-left">{t('backToList')}</Button>
            </div>
            
            <fieldset disabled={isReadOnly} className="border-2 border-cnk-border-light p-6 disabled:bg-slate-50">
                <div className="flex justify-center items-center pb-4 mb-4 border-b-2 border-cnk-border-light">
                    <h2 className="text-center text-3xl font-bold">FİYAT TEKLİFİ</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="border-2 border-black p-2"><table className="w-full"><tbody>
                        <tr><td colSpan={3}><Autocomplete items={[{id: 'yeni-musteri', name: '+ Yeni Müşteri Ekle'}, ...customers.map(c => ({ id: c.id, name: c.name }))]} onSelect={handleCustomerSelect} placeholder="Müşteri Seçin veya Ekleyin" initialValue={selectedCustomer?.name || ''} disabled={isReadOnly} /></td></tr>
                        <InputField label={t('yetkili')} id="yetkili" value={formState.firma.yetkili} onChange={(e) => handleInputChange(e, 'firma')} readOnly={isReadOnly} section="firma" />
                        <InputField label={t('phone')} id="telefon" value={formState.firma.telefon} onChange={(e) => handleInputChange(e, 'firma')} readOnly={isReadOnly} section="firma" />
                        <InputField label={t('email')} id="eposta" value={formState.firma.eposta} onChange={(e) => handleInputChange(e, 'firma')} readOnly={isReadOnly} section="firma" />
                        <InputField label={t('vade')} id="vade" value={formState.firma.vade} onChange={(e) => handleInputChange(e, 'firma')} readOnly={isReadOnly} section="firma" />
                        <InputField label={t('date')} id="teklifTarihi" type="date" value={formState.firma.teklifTarihi} onChange={(e) => handleInputChange(e, 'firma')} readOnly={isReadOnly} section="firma" />
                        <tr><td className="font-semibold w-24">{t('teklifNo')}</td><td>:</td><td className="pl-2 p-1">{offerId !== 'create' ? offers.find(o=>o.id === offerId)?.teklifNo : 'Otomatik'}</td></tr>
                    </tbody></table></div>
                    <div className="border-2 border-black p-2"><table className="w-full"><tbody>
                        <InputField label="Teklif Veren Firma" id="yetkili" value="CNK KESİCİ TAKIMLAR" onChange={() => {}} readOnly={true} section="teklifVeren" />
                        <InputField label={t('yetkili')} id="yetkili" value={formState.teklifVeren.yetkili} onChange={(e) => handleInputChange(e, 'teklifVeren')} readOnly={isReadOnly} section="teklifVeren" />
                        <InputField label={t('phone')} id="telefon" value={formState.teklifVeren.telefon} onChange={(e) => handleInputChange(e, 'teklifVeren')} readOnly={isReadOnly} section="teklifVeren" />
                        <InputField label={t('email')} id="eposta" value={formState.teklifVeren.eposta} onChange={(e) => handleInputChange(e, 'teklifVeren')} readOnly={isReadOnly} section="teklifVeren" />
                        <tr><td className="font-semibold w-24">Para Birimi</td><td>:</td><td className="pl-2">
                            <select id="currency" value={formState.currency} onChange={(e) => handleInputChange(e)} disabled={isReadOnly} className="w-full bg-transparent focus:outline-none focus:bg-slate-100 p-1 rounded">
                                <option value="TRY">TRY (₺)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
                            </select>
                        </td></tr>
                    </tbody></table></div>
                </div>
                
                <p className="my-4 text-sm">Firmamızdan istemiş olduğunuz ürünlerimizle ilgili fiyat teklifimizi aşağıda bilgilerinize sunar iyi çalışmalar dileriz.</p>
                <p className="text-right text-sm mb-4">Saygılarımızla,</p>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-black text-xs text-center">
                       <thead className="bg-[#c00000] text-white">
                           <tr>
                               <th className="p-2 border border-black font-normal">MALZEMENİN CİNSİ</th><th className="p-2 border border-black font-normal">MİKTAR</th>
                               <th className="p-2 border border-black font-normal">BİRİM</th><th className="p-2 border border-black font-normal">FİYAT</th>
                               <th className="p-2 border border-black font-normal">TUTAR</th><th className="p-2 border border-black font-normal">TESLİM SÜRESİ</th>
                               {!isReadOnly && <th className="p-2 border-black border"></th>}
                           </tr>
                       </thead>
                       <tbody>
                            {formState.items.map(item => (
                                <tr key={item.id}><td className="border border-black"><input name="cins" value={item.cins} onChange={(e) => handleItemChange(e, item.id)} readOnly={isReadOnly} className="w-full p-1 bg-transparent text-left focus:outline-none focus:bg-slate-100"/></td><td className="border border-black"><input name="miktar" type="number" value={item.miktar} onChange={(e) => handleItemChange(e, item.id)} readOnly={isReadOnly} className="w-16 p-1 bg-transparent text-center focus:outline-none focus:bg-slate-100"/></td><td className="border border-black"><input name="birim" value={item.birim} onChange={(e) => handleItemChange(e, item.id)} readOnly={isReadOnly} className="w-20 p-1 bg-transparent text-center focus:outline-none focus:bg-slate-100"/></td><td className="border border-black"><input name="fiyat" type="number" value={item.fiyat} onChange={(e) => handleItemChange(e, item.id)} readOnly={isReadOnly} className="w-20 p-1 bg-transparent text-right focus:outline-none focus:bg-slate-100"/></td><td className="border border-black text-right p-1">{formatCurrency(item.tutar, formState.currency)}</td><td className="border border-black"><input name="teslimSuresi" value={item.teslimSuresi} onChange={(e) => handleItemChange(e, item.id)} readOnly={isReadOnly} className="w-24 p-1 bg-transparent text-center focus:outline-none focus:bg-slate-100"/></td>{!isReadOnly && <td className="border border-black"><Button size="sm" variant="danger" type="button" onClick={() => removeItem(item.id)} icon="fas fa-trash"/></td>}</tr>
                            ))}
                       </tbody>
                    </table>
                    {!isReadOnly && <Button size="sm" variant="success" type="button" onClick={addItem} icon="fas fa-plus" className="mt-2">{t('addRow')}</Button>}
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4 text-sm">
                    <div className="col-span-2 border border-black p-2">
                        <label htmlFor="notlar" className="font-bold">TEKLİF NOT:</label>
                        <textarea id="notlar" value={formState.notlar} onChange={(e) => handleInputChange(e)} readOnly={isReadOnly} rows={4} className="w-full mt-1 p-1 focus:outline-none focus:bg-slate-100"></textarea>
                    </div>
                    <div>
                        <table className="w-full border-collapse">
                            <tr><td className="border border-black p-1">TOPLAM</td><td className="border border-black p-1 text-right">{formatCurrency(toplam, formState.currency)}</td></tr>
                            <tr><td className="border border-black p-1">%20 KDV</td><td className="border border-black p-1 text-right">{formatCurrency(kdv, formState.currency)}</td></tr>
                            <tr className="bg-[#c00000] text-white font-bold"><td className="border border-black p-1">G.TOPLAM</td><td className="border border-black p-1 text-right">{formatCurrency(genelToplam, formState.currency)}</td></tr>
                        </table>
                    </div>
                </div>

                {!isReadOnly && <div className="text-right mt-6 flex items-center justify-end gap-2">
                    <Button onClick={() => setIsPreviewOpen(true)} variant="secondary" icon="fas fa-eye" type="button">{t('preview')}</Button>
                    <Button onClick={handleSubmit} icon="fas fa-save">{t('saveOffer')}</Button>
                </div>}
            </fieldset>
            
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={t('offerPreview')} size="4xl">
                <iframe srcDoc={getOfferHtml({ id: offerId || 'preview', teklifNo: offerId !== 'create' ? offers.find(o=>o.id === offerId)?.teklifNo || 'N/A' : 'Önizleme', createdAt: new Date().toISOString(), userId: currentUser!.id, ...formState, toplam, kdv, genelToplam, exchangeRates}, selectedCustomer, t)} className="w-full h-[70vh] border-0" title={t('offerPreview')} />
            </Modal>
        </div>
    );
};

const OfferPage = ({ view, setView }: OfferPageProps) => {
    // FIX: Add a key to the form component to ensure it re-mounts and resets its state
    // when switching between creating a new offer and editing an existing one.
    const formKey = view.id || 'list';
    if (view.id) {
        return <OfferForm key={formKey} setView={setView} offerId={view.id} />;
    }
    return <OfferListPage setView={setView} />;
};

export default OfferPage;