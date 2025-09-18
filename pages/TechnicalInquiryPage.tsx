import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { TechnicalInquiry, Interview } from '../types';
import { ViewState } from '../App';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import DrillingForm from '../components/technical-inquiry/DrillingForm';
import TappingForm from '../components/technical-inquiry/TappingForm';
import EndMillForm from '../components/technical-inquiry/EndMillForm';
import { formatDate } from '../utils/formatting';
import { downloadTechnicalInquiryAsPdf, getDrillingInquiryHtml, getTappingInquiryHtml, getEndMillInquiryHtml } from '../services/pdfService';
import Modal from '../components/common/Modal';

interface FormContainerProps {
    setView: (view: ViewState) => void;
    inquiryId?: string; // Can be 'create_{interviewId}' or a real inquiry ID
}

const FormContainer = ({ setView, inquiryId }: FormContainerProps) => {
    const { t } = useLanguage();
    const { technicalInquiries, interviews, customers, addTechnicalInquiry, updateTechnicalInquiry } = useData();
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'drilling' | 'tapping' | 'end_mill'>('drilling');
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [linkedInterview, setLinkedInterview] = useState<Interview | null>(null);
    const [currentInquiry, setCurrentInquiry] = useState<TechnicalInquiry | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    useEffect(() => {
        if (inquiryId?.startsWith('create_')) {
            const interviewId = inquiryId.split('_')[1];
            const interview = interviews.find(i => i.id === interviewId);
            setIsCreateMode(true);
            setLinkedInterview(interview || null);
        } else if (inquiryId) {
            const found = technicalInquiries.find(i => i.id === inquiryId);
            setIsCreateMode(false);
            if(found) {
                setCurrentInquiry(found);
                setActiveTab(found.type);
            }
        }
    }, [inquiryId, technicalInquiries, interviews]);

    const handleSave = async (inquiryData: TechnicalInquiry) => {
        // Ensure the title is set before saving
        const finalInquiryData = {
            ...inquiryData,
            title: inquiryData.title || `${t(inquiryData.type)} - ${inquiryData.company}`
        };

        if (isCreateMode) {
            await addTechnicalInquiry({ ...finalInquiryData, interviewId: linkedInterview?.id });
        } else if(currentInquiry) {
            await updateTechnicalInquiry({ ...currentInquiry, ...finalInquiryData });
        }
        setView({ page: 'gorusme-formu', id: linkedInterview?.id || currentInquiry?.interviewId });
    };
    
    const handlePreview = (inquiryData: TechnicalInquiry) => {
        setCurrentInquiry(inquiryData);
        setIsPreviewOpen(true);
    };

    const handleExport = (inquiryData: TechnicalInquiry) => {
        downloadTechnicalInquiryAsPdf(inquiryData);
    };

    const handlePrint = () => {
        const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
        if (iframe) {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }
    };

    const renderForm = () => {
        const initialCustomer = linkedInterview ? customers.find(c => c.id === linkedInterview.customerId) : null;
        
        switch(activeTab) {
            case 'drilling': return <DrillingForm onSave={handleSave} onPreview={handlePreview} onExport={handleExport} inquiry={currentInquiry} initialCustomer={initialCustomer} />;
            case 'tapping': return <TappingForm onSave={handleSave} onPreview={handlePreview} onExport={handleExport} inquiry={currentInquiry} initialCustomer={initialCustomer} />;
            case 'end_mill': return <EndMillForm onSave={handleSave} onPreview={handlePreview} onExport={handleExport} inquiry={currentInquiry} initialCustomer={initialCustomer} />;
            default: return null;
        }
    }
    
    const tabs = [
        { id: 'drilling', label: t('drillingInquiry') },
        { id: 'tapping', label: t('tappingInquiry') },
        { id: 'end_mill', label: t('endMillInquiry') },
    ];
    
    // Fix: Explicitly type `backTargetView` as `ViewState` to prevent TypeScript from widening the `page` property to a generic string.
    const backTargetView: ViewState = linkedInterview?.id ? { page: 'gorusme-formu', id: linkedInterview.id } :
                         currentInquiry?.interviewId ? { page: 'gorusme-formu', id: currentInquiry.interviewId } :
                         { page: 'dashboard' }; // Fallback

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{isCreateMode ? "Yeni Teknik Talep" : "Teknik Talebi Düzenle"}</h1>
                <Button onClick={() => setView(backTargetView)} variant="secondary" icon="fas fa-arrow-left">{t('backToList')}</Button>
            </div>
            <div className="bg-cnk-panel-light p-4 rounded-cnk-card shadow-md">
                {isCreateMode && (
                     <div className="flex flex-wrap gap-2 border-b border-cnk-border-light mb-4">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                                    className={`px-4 py-2 text-sm font-medium rounded-t-cnk-element -mb-px ${activeTab === tab.id ? 'border border-cnk-border-light border-b-white text-cnk-accent-primary' : 'text-cnk-txt-muted-light hover:bg-cnk-bg-light'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
                {renderForm()}
            </div>
            {isPreviewOpen && currentInquiry && (
                <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Önizleme" size="4xl" footer={
                    <>
                        <Button variant="secondary" onClick={handlePrint} icon="fas fa-print">Yazdır</Button>
                        <Button onClick={() => downloadTechnicalInquiryAsPdf(currentInquiry)} icon="fas fa-download">PDF İndir</Button>
                    </>
                }>
                    <iframe id="pdf-preview-iframe" srcDoc={
                        currentInquiry.type === 'drilling' ? getDrillingInquiryHtml(currentInquiry) :
                        currentInquiry.type === 'tapping' ? getTappingInquiryHtml(currentInquiry) :
                        getEndMillInquiryHtml(currentInquiry)
                    } className="w-full h-[70vh]" />
                </Modal>
            )}
        </div>
    )
}

const TechnicalInquiryPage = ({ view, setView }: { view: ViewState; setView: (view: ViewState) => void; }) => {
    // This page is now only a container for the form, not a list.
    // The list view is integrated into InterviewFormPage.
    return <FormContainer setView={setView} inquiryId={view.id} />;
};

export default TechnicalInquiryPage;