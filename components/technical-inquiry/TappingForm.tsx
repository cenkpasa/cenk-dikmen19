import React, { useState, useEffect } from 'react';
import { TechnicalInquiry, TappingFormData, Customer } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { FormHeader, FormSection, ImageRadio, FormField, FormActions, Checkbox } from './FormCommon';
import { WALTER_ASSETS } from '../../constants';
import Autocomplete from '../common/Autocomplete';

interface TappingFormProps {
    inquiry: TechnicalInquiry | null;
    initialCustomer: Customer | null;
    onSave: (data: TechnicalInquiry) => void;
    onPreview: (data: TechnicalInquiry) => void;
    onExport: (data: TechnicalInquiry) => void;
}

const TappingForm = ({ inquiry, initialCustomer, onSave, onPreview, onExport }: TappingFormProps) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { customers } = useData();
    const isReadOnly = inquiry ? inquiry.userId !== currentUser?.id && currentUser?.role !== 'admin' : false;

    const getInitialState = (): TechnicalInquiry => ({
        id: '', customerId: '', userId: currentUser?.id || '', createdAt: new Date().toISOString(), title: '', type: 'tapping', status: 'draft',
        company: '', contactPerson: '', address: '', country: '', phone: '', fax: '', email: '', customerNo: '', quantities: '', comments: '',
        formData: {
            workpieceMaterial: '', materialHardness: '', depthOfThread: '', depthOfHole: '',
            application: 'tapping', threadType: 'through', threadDirection: 'right', coolant: '',
            construction: { typeOfThread: '', d1: '', tol: '' },
            shankType: 'through',
            specification: { fluteType: '', possibleToolTypes: '', leadType: '', coating: '' },
            tipDetail: [],
        }
    });

    const [state, setState] = useState<TechnicalInquiry>(getInitialState());

    useEffect(() => {
        if (inquiry) setState(inquiry);
        else if (initialCustomer) {
            const initialState = getInitialState();
            initialState.customerId = initialCustomer.id;
            initialState.company = initialCustomer.name;
            initialState.contactPerson = '';
            initialState.address = initialCustomer.address || '';
            initialState.phone = initialCustomer.phone1 || '';
            initialState.email = initialCustomer.email || '';
            initialState.customerNo = initialCustomer.currentCode || '';
            setState(initialState);
        }
        else setState(getInitialState());
    }, [inquiry, initialCustomer]);

    const handleChange = (field: string, value: any, section?: keyof TechnicalInquiry | 'formData' | 'construction' | 'specification') => {
        if (section === 'formData') {
            setState(prev => ({ ...prev, formData: { ...prev.formData, [field]: value } }));
        } else if (section === 'construction' || section === 'specification') {
            const formData = state.formData as TappingFormData;
            setState(prev => ({...prev, formData: { ...formData, [section]: { ...formData[section], [field]: value }}}));
        } else {
            setState(prev => ({ ...prev, [field]: value }));
        }
    };
    
     const handleCustomerSelect = (id: string) => {
        const customer = customers.find(c => c.id === id);
        if (customer) {
            setState(prev => ({ ...prev, customerId: id, company: customer.name, contactPerson: '', address: customer.address || '', phone: customer.phone1 || '', email: customer.email || '', customerNo: customer.currentCode || '' }));
        }
    };

    const handleMultiCheckboxChange = (field: keyof TappingFormData, value: string) => {
        const formData = state.formData as TappingFormData;
        const currentValues = (formData[field] as string[]) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        handleChange(field, newValues, 'formData');
    };

    const formData = state.formData as TappingFormData;

    return (
        <div className="space-y-4 text-sm">
            <FormHeader title="Özel Takım Talep Formu - Kılavuz Çekme" state={state} onCustomerSelect={handleCustomerSelect} onChange={handleChange} isReadOnly={isReadOnly} />
             <FormField label="Miktar" value={state.quantities} onChange={e => handleChange('quantities', e.target.value)} isReadOnly={isReadOnly} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="İş Parçası Malzemesi" value={formData.workpieceMaterial} onChange={e => handleChange('workpieceMaterial', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                <FormField label="Malzeme Sertliği (N/mm² or HRC)" value={formData.materialHardness} onChange={e => handleChange('materialHardness', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                <FormField label="Diş Derinliği" value={formData.depthOfThread} onChange={e => handleChange('depthOfThread', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                <FormField label="Delik Derinliği" value={formData.depthOfHole} onChange={e => handleChange('depthOfHole', e.target.value, 'formData')} isReadOnly={isReadOnly} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                <FormSection title="Uygulama">
                    <ImageRadio name="application" label="Kılavuz" value="tapping" checked={formData.application === 'tapping'} image={WALTER_ASSETS.tapping_app_tapping} onChange={e => handleChange('application', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                    <ImageRadio name="application" label="Ovalama" value="forming" checked={formData.application === 'forming'} image={WALTER_ASSETS.tapping_app_forming} onChange={e => handleChange('application', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                 <FormSection title="Diş Tipi">
                    <Checkbox name="threadType_ground" label="Kör Delik" checked={formData.threadType === 'ground'} onChange={() => handleChange('threadType', 'ground', 'formData')} isReadOnly={isReadOnly} />
                    <Checkbox name="threadType_through" label="Boydan Delik" checked={formData.threadType === 'through'} onChange={() => handleChange('threadType', 'through', 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                 <FormSection title="Diş Yönü">
                    <Checkbox name="threadDirection_left" label="Sol" checked={formData.threadDirection === 'left'} onChange={() => handleChange('threadDirection', 'left', 'formData')} isReadOnly={isReadOnly} />
                    <Checkbox name="threadDirection_right" label="Sağ" checked={formData.threadDirection === 'right'} onChange={() => handleChange('threadDirection', 'right', 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                <FormField label="Soğutma" value={formData.coolant} onChange={e => handleChange('coolant', e.target.value, 'formData')} isReadOnly={isReadOnly} />
            </div>
            
            <FormSection title="Konstrüksiyon Ölçüleri / Diş Tanımı">
                 <div className="flex justify-center my-2"><img src={WALTER_ASSETS.tapping_dim} alt="tapping dimensions" className="max-w-md"/></div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Diş Tipi" value={formData.construction.typeOfThread} onChange={e => handleChange('typeOfThread', e.target.value, 'construction')} isReadOnly={isReadOnly} />
                    <FormField label="d1" value={formData.construction.d1} onChange={e => handleChange('d1', e.target.value, 'construction')} isReadOnly={isReadOnly} />
                    <FormField label="Tol." value={formData.construction.tol} onChange={e => handleChange('tol', e.target.value, 'construction')} isReadOnly={isReadOnly} />
                </div>
            </FormSection>

            <FormField label="Yorumlar" type="textarea" value={state.comments} onChange={e => handleChange('comments', e.target.value)} isReadOnly={isReadOnly} />
            <FormActions isReadOnly={isReadOnly} onSave={() => onSave(state)} onPreview={() => onPreview(state)} onExport={() => onExport(state)} />
        </div>
    );
};

export default TappingForm;