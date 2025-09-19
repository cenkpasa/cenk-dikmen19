import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Interview, Customer } from '@/types';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import BworksLogo from '@/components/assets/BworksLogo';
import VoiceNoteModal from '@/components/ai/VoiceNoteModal';
import Autocomplete from '@/components/common/Autocomplete';
import { downloadInterviewAsPdf, getInterviewHtml } from '@/services/pdfService';
import { formatDate } from '@/utils/formatting';
import CustomerForm from '@/components/forms/CustomerForm';
import { useNavigate, useParams } from 'react-router-dom';
import { summarizeText } from '@/services/aiService';

interface InterviewListPageProps {
    onNavigate: (path: string) => void;
}

const InterviewListPage = ({ onNavigate }: InterviewListPageProps) => {
    const { interviews, customers } = useData();
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    const columns = [
        {
            header: t('customers'),
            accessor: (item: Interview) => {
                const customer = customers.find(c => c.id === item.customerId);
                return customer ? customer.name : t('unknownCustomer');
            }
        },
        { header: t('interviewDate'), accessor: (item: Interview) => formatDate(item.formTarihi) },
        { header: t('interviewer'), accessor: (item: Interview) => item.gorusmeyiYapan },
        {
            header: t('actions'),
            accessor: (item: Interview) => (
                <div className="flex gap-2">
                    <Button variant="info" size="sm" onClick={() => onNavigate(`/interviews/${item.id}`)} icon="fas fa-eye" title={currentUser?.role === 'admin' ? `${t('view')}/${t('edit')}` : t('view')} />
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-2xl font-bold">{t('interviewFormsTitle')}</h1>
                <Button variant="primary" onClick={() => onNavigate('/interviews/create')} icon="fas fa-plus">{t('addInterview')}</Button>
            </div>
            <DataTable
                columns={columns}
                data={interviews}
                emptyStateMessage={t('noInterviewYet')}
            />
        </div>
    );
};

const SEKTOR_OPTIONS = [
    "Ahşap Profil", "PVC & Alüminyum Pencere", "Folyo-Kenar Bandı-Bant",
    "Kasa-Pervaz-Kapı", "Panel", "Mobilya", "Diğer"
];

interface InterviewFormProps {
    interviewId?: string;
}

const InterviewForm = ({ interviewId }: InterviewFormProps) => {
    const { interviews, customers, addInterview, updateInterview, technicalInquiries } = useData();
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    
    const isCreateMode = interviewId === 'create';
    const isReadOnly = !isCreateMode && currentUser?.role !== 'admin';

    const getInitialState = (): Omit<Interview, 'id' | 'createdAt' | 'userId'> => ({
        customerId: '',
        formTarihi: new Date().toISOString().slice(0, 10),
        fuar: '',
        sektor: [],
        ziyaretci: { firmaAdi: '', adSoyad: '', bolumu: '', telefon: '', adres: '', email: '', web: '' },
        aksiyonlar: { katalogGonderilecek: false, teklifGonderilecek: false, ziyaretEdilecek: false, bizZiyaretEdecek: { tarih: '', adSoyad: '' } },
        notlar: '',
        gorusmeyiYapan: currentUser?.name || '',
        aiSummary: ''
    });

    const [formState, setFormState] = useState(getInitialState());
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        if (interviewId && interviewId !== 'create') {
            const interview = interviews.find(i => i.id === interviewId);
            if (interview) {
                 setFormState({
                    customerId: interview.customerId,
                    formTarihi: interview.formTarihi,
                    fuar: interview.fuar,
                    sektor: interview.sektor,
                    ziyaretci: interview.ziyaretci,
                    aksiyonlar: interview.aksiyonlar,
                    notlar: interview.notlar,
                    gorusmeyiYapan: interview.gorusmeyiYapan,
                    aiSummary: interview.aiSummary || ''
                });
                const customer = customers.find(c => c.id === interview.customerId);
                setSelectedCustomer(customer || null);
            }
        } else {
            setFormState(getInitialState());
            setSelectedCustomer(null);
        }
    }, [interviewId, interviews, customers, currentUser]);
    
    const handleCustomerSelect = (custId: string) => {
        if (custId === 'yeni-musteri') {
            setIsNewCustomerModalOpen(true);
        } else {
            const customer = customers.find(c => c.id === custId);
            setSelectedCustomer(customer || null);
            if (customer) {
                setFormState(prev => ({
                    ...prev,
                    customerId: custId,
                    ziyaretci: {
                        ...prev.ziyaretci,
                        firmaAdi: customer.name,
                        telefon: customer.phone1 || '',
                        adres: customer.address || '',
                        email: customer.email || '',
                    }
                }));
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: 'ziyaretci' | 'bizZiyaretEdecek') => {
        const { id, value } = e.target;
        if (section === 'bizZiyaretEdecek') {
             setFormState(prev => ({ ...prev, aksiyonlar: { ...prev.aksiyonlar, bizZiyaretEdecek: { ...prev.aksiyonlar.bizZiyaretEdecek, [id]: value }}}));
        } else if (section === 'ziyaretci') {
             setFormState(prev => ({ ...prev, ziyaretci: { ...prev.ziyaretci, [id]: value }}));
        }
    };

    const handleCheckboxChange = (field: keyof Interview['aksiyonlar']) => {
        setFormState(prev => ({ ...prev, aksiyonlar: { ...prev.aksiyonlar, [field]: !prev.aksiyonlar[field] } }));
    };

    const handleSektorChange = (sektor: string) => {
        setFormState(prev => ({
            ...prev,
            sektor: prev.sektor.includes(sektor) ? prev.sektor.filter(s => s !== sektor) : [...prev.sektor, sektor]
        }));
    };
    
    const handleVoiceNoteInsert = (text: string) => {
        setFormState(prev => ({ ...prev, notlar: prev.notlar ? `${prev.notlar}\n${text}` : text }));
        setIsVoiceModalOpen(false);
    };

    const handleSummarize = async () => {
        if (!formState.notlar) return;
        setIsSummarizing(true);
        const result = await summarizeText(formState.notlar);
        if (result.success) {
            setFormState(prev => ({ ...prev, aiSummary: result.text }));
            showNotification('summarySaved', 'success');
        } else {
            showNotification('aiError', 'error');
        }
        setIsSummarizing(false);
    };

    const handleSubmit = () => {
        const { firmaAdi, adSoyad, telefon, email } = formState.ziyaretci;
        if (!formState.customerId || !firmaAdi || !adSoyad || !telefon || !email) {
            showNotification('Lütfen Müşteri ve Ziyaretçi alanlarındaki zorunlu alanları (Firma Adı, Ad Soyad, Telefon, E-posta) doldurun.', 'error');
            return;
        }

        if (isCreateMode) {
            addInterview(formState);
            showNotification('interviewSaved', 'success');
        } else if(interviewId) {
            const existingInterview = interviews.find(i => i.id === interviewId)!;
            updateInterview({ ...existingInterview, ...formState });
            showNotification('interviewUpdated', 'success');
        }
        navigate('/interviews');
    };

    const handleDownloadPdf = async () => {
        const interview = interviews.find(i => i.id === interviewId);
        if (!interview) return;
        const customer = customers.find(c => c.id === interview.customerId);
        await downloadInterviewAsPdf(interview, customer, t);
    };

    const handlePreview = async () => {
        const currentData = { id: interviewId || 'preview', createdAt: new Date().toISOString(), userId: currentUser!.id, ...formState };
        const customer = customers.find(c => c.id === formState.customerId);
        const html = getInterviewHtml(currentData, customer, t);
        const newWindow = window.open();
        newWindow?.document.write(html);
        newWindow?.document.close();
    }
    
    const linkedInquiries = technicalInquiries.filter(ti => ti.interviewId === interviewId);
    const gridBg = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 L10 20 M0 10 L20 10' stroke='%23d1d5db' stroke-width='0.5'/%3E%3C/svg%3E")`;

    return (
        <div className="max-w-4xl mx-auto">
            {isVoiceModalOpen && <VoiceNoteModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onInsert={handleVoiceNoteInsert} />}
            {isNewCustomerModalOpen && <CustomerForm isOpen={isNewCustomerModalOpen} onClose={() => setIsNewCustomerModalOpen(false)} customer={null} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{isCreateMode ? t('addInterview') : t('interviewForm')}</h1>
                 <div className="flex gap-2">
                    <Button onClick={() => navigate('/interviews')} variant="secondary" icon="fas fa-arrow-left">{t('backToList')}</Button>
                </div>
            </div>
            
            <fieldset disabled={isReadOnly} className="border-2 border-[#334155] p-4 font-sans text-sm disabled:bg-slate-50 space-y-4">
                <div className="flex justify-between items-start border-b-2 border-[#334155] pb-2">
                    <div className="flex items-center">
                        <div className="h-10 mr-4"><BworksLogo /></div>
                        <span className="text-3xl font-bold text-[#334155]">GÖRÜŞME FORMU</span>
                    </div>
                    <div className="text-right">
                        <span>TARİH: </span><input type="date" value={formState.formTarihi.slice(0,10)} onChange={(e) => setFormState(p => ({...p, formTarihi: e.target.value}))} className="w-32 border-b border-gray-400 focus:outline-none bg-transparent" readOnly={isReadOnly} />
                        <br/>
                        <span>FUAR: </span><input type="text" value={formState.fuar} onChange={(e) => setFormState(p => ({...p, fuar: e.target.value}))} className="w-32 border-b border-gray-400 focus:outline-none bg-transparent" readOnly={isReadOnly} />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 border-r-2 border-[#334155] pr-4 space-y-4">
                        <div className="border border-gray-400 p-2 space-y-1">
                            <h3 className="text-center font-bold">SEKTÖR</h3>
                            {SEKTOR_OPTIONS.map(opt => (
                                <label key={opt} className="flex items-center gap-2"><input type="checkbox" checked={formState.sektor.includes(opt)} onChange={() => handleSektorChange(opt)} disabled={isReadOnly}/>{opt}</label>
                            ))}
                        </div>
                         <div className="space-y-1">
                             <label className="flex items-center gap-2"><input type="checkbox" checked={formState.aksiyonlar.katalogGonderilecek} onChange={() => handleCheckboxChange('katalogGonderilecek')} disabled={isReadOnly}/>Katalog gönderilecek</label>
                             <label className="flex items-center gap-2"><input type="checkbox" checked={formState.aksiyonlar.teklifGonderilecek} onChange={() => handleCheckboxChange('teklifGonderilecek')} disabled={isReadOnly}/>Teklif gönderilecek</label>
                             <label className="flex items-center gap-2"><input type="checkbox" checked={formState.aksiyonlar.ziyaretEdilecek} onChange={() => handleCheckboxChange('ziyaretEdilecek')} disabled={isReadOnly}/>Ziyaret edilecek</label>
                        </div>
                    </div>
                    <div className="col-span-8 space-y-4">
                         <div className="border border-gray-400 p-2 space-y-1">
                            <h3 className="font-bold">ZİYARETÇİ</h3>
                            <Autocomplete items={[{id: 'yeni-musteri', name: '+ Yeni Müşteri Ekle'}, ...customers.map(c => ({ id: c.id, name: c.name }))]} onSelect={handleCustomerSelect} placeholder="Kayıtlı Müşteri Ara veya Seç..." initialValue={selectedCustomer?.name || ''} disabled={isReadOnly} />
                            <div className="grid grid-cols-2 gap-x-2">
                                <label>Firma Adı: <input id="firmaAdi" value={formState.ziyaretci.firmaAdi} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                                <label>Ad Soyad: <input id="adSoyad" value={formState.ziyaretci.adSoyad} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                                <label>Bölümü: <input id="bolumu" value={formState.ziyaretci.bolumu} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                                <label>Telefon: <input id="telefon" value={formState.ziyaretci.telefon} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                                <label className="col-span-2">Adres: <input id="adres" value={formState.ziyaretci.adres} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                                <label>E-mail: <input id="email" type="email" value={formState.ziyaretci.email} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                                <label>Web: <input id="web" value={formState.ziyaretci.web} onChange={e => handleInputChange(e, 'ziyaretci')} className="w-full border-b" disabled={isReadOnly}/></label>
                            </div>
                        </div>
                        <div className="border border-gray-400 p-2 flex justify-between items-center">
                            <div>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={formState.aksiyonlar.bizZiyaretEdecek.tarih !== ''} disabled={isReadOnly} />Bizi ziyaret edecek</label>
                                <label>Ad Soyad: <input id="adSoyad" value={formState.aksiyonlar.bizZiyaretEdecek.adSoyad} onChange={e => handleInputChange(e, 'bizZiyaretEdecek')} className="border-b" disabled={isReadOnly}/></label>
                            </div>
                            <label>TARİH: <input id="tarih" type="date" value={formState.aksiyonlar.bizZiyaretEdecek.tarih} onChange={e => handleInputChange(e, 'bizZiyaretEdecek')} className="border-b" disabled={isReadOnly}/></label>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <textarea value={formState.notlar} onChange={e => setFormState(p => ({...p, notlar: e.target.value}))} rows={15} className="w-full p-2 border border-gray-400" style={{ backgroundImage: gridBg, backgroundSize: '20px 20px' }} readOnly={isReadOnly}></textarea>
                    {!isReadOnly && <Button onClick={() => setIsVoiceModalOpen(true)} icon="fas fa-microphone" size="sm" className="absolute top-2 right-2"/>}
                </div>
                
                {!isReadOnly && formState.notlar && (
                    <div className="border border-cnk-accent-primary/50 bg-cnk-accent-primary/10 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-cnk-accent-primary">{t('aiAssistant')}</h3>
                            <Button onClick={handleSummarize} isLoading={isSummarizing} size="sm">{t('summarizeNotes')}</Button>
                        </div>
                        {formState.aiSummary && (
                            <div>
                                <h4 className="font-semibold text-sm">{t('aiSummary')}</h4>
                                <p className="text-sm whitespace-pre-wrap">{formState.aiSummary}</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="flex justify-between items-center">
                    <div>GÖRÜŞMEYİ YAPAN KİŞİ: <input id="gorusmeyiYapan" type="text" value={formState.gorusmeyiYapan} onChange={(e) => setFormState(p => ({...p, gorusmeyiYapan: e.target.value}))} readOnly={isReadOnly} className="border-b border-gray-400 focus:outline-none bg-transparent" /></div>
                    <div className="flex gap-2">
                        {!isReadOnly && <Button onClick={handleSubmit} icon="fas fa-save">{t('save')}</Button>}
                        <Button onClick={handlePreview} icon="fas fa-eye" variant="secondary">{t('preview')}</Button>
                        <Button onClick={handleDownloadPdf} icon="fas fa-file-pdf" variant="info">{t('downloadPdf')}</Button>
                    </div>
                </div>
            </fieldset>

            {!isCreateMode && (
                <div className="mt-6 border-t-2 pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('linkedTechnicalInquiries')}</h2>
                        {!isReadOnly && (
                            <Button
                                onClick={() => navigate(`/technical-inquiries/create_${interviewId}`)}
                                icon="fas fa-plus"
                            >
                                {t('createTechnicalInquiry')}
                            </Button>
                        )}
                    </div>
                    {linkedInquiries.length > 0 ? (
                         <DataTable
                            columns={[
                                { header: 'Başlık', accessor: (item) => item.title || 'Başlıksız' },
                                { header: 'Tür', accessor: (item) => t(item.type) },
                                { header: 'Tarih', accessor: (item) => formatDate(item.createdAt) },
                                { header: t('actions'), accessor: (item) => (
                                    <Button size="sm" variant="secondary" onClick={() => navigate(`/technical-inquiries/${item.id}`)}>
                                        {t('view')}
                                    </Button>
                                )}
                            ]}
                            data={linkedInquiries}
                        />
                    ) : (
                        <p className="text-cnk-txt-muted-light text-center p-4 bg-cnk-bg-light rounded-md">
                            {t('noLinkedTechnicalInquiries')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const InterviewFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // The router in App.tsx handles the /interviews path, so we check for `id` presence.
    // If id exists, it's a detail/edit/create view. If not, it's the list view.
    if (id) {
        return <InterviewForm interviewId={id} />;
    }
    return <InterviewListPage onNavigate={navigate} />;
};

export default InterviewFormPage;
