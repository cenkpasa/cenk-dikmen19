import React, { useState, useEffect } from 'react';
import { TechnicalInquiry, EndMillFormData, Customer } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { FormHeader, FormSection, ImageRadio, FormField, FormActions, Checkbox } from './FormCommon';
import { WALTER_ASSETS } from '../../constants';
import Autocomplete from '../common/Autocomplete';

interface EndMillFormProps {
    inquiry: TechnicalInquiry | null;
    initialCustomer: Customer | null;
    onSave: (data: TechnicalInquiry) => void;
    onPreview: (data: TechnicalInquiry) => void;
    onExport: (data: TechnicalInquiry) => void;
}

const EndMillForm = ({ inquiry, initialCustomer, onSave, onPreview, onExport }: EndMillFormProps) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { customers } = useData();
    const isReadOnly = inquiry ? inquiry.userId !== currentUser?.id && currentUser?.role !== 'admin' : false;
    
    const getInitialState = (): TechnicalInquiry => ({
        id: '', customerId: '', userId: currentUser?.id || '', createdAt: new Date().toISOString(), title: '', type: 'end_mill', status: 'draft',
        company: '', contactPerson: '', address: '', country: '', phone: '', fax: '', email: '', customerNo: '', quantities: '', comments: '',
        formData: {
            variant: 'general',
            workpieceMaterial: '', materialHardness: '', ae: '', ap: '',
            application: [], coolant: 'dry', lubricant: '', toolType: 'solid',
            faceGeometry: [], centerCut: 'without', cuttingEdgeProfile: 'standard',
            noOfTeeth: '', coating: '', subGroup: '', shankType: []
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

    const handleChange = (field: string, value: any, section?: keyof TechnicalInquiry | 'formData') => {
        if (section === 'formData') {
            setState(prev => ({ ...prev, formData: { ...prev.formData, [field]: value } }));
        } else {
            setState(prev => ({ ...prev, [field]: value }));
        }
    };
    
    const handleMultiCheckboxChange = (field: keyof EndMillFormData, value: string) => {
        const formData = state.formData as EndMillFormData;
        const currentValues = (formData[field] as string[]) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        handleChange(field, newValues, 'formData');
    };

     const handleCustomerSelect = (id: string) => {
        const customer = customers.find(c => c.id === id);
        if (customer) {
            setState(prev => ({ ...prev, customerId: id, company: customer.name, contactPerson: '', address: customer.address || '', phone: customer.phone1 || '', email: customer.email || '', customerNo: customer.currentCode || '' }));
        }
    };

    const formData = state.formData as EndMillFormData;

    return (
        <div className="space-y-4 text-sm">
            <FormHeader title="Özel Takım Talep Formu - Parmak Freze" state={state} onCustomerSelect={handleCustomerSelect} onChange={handleChange} isReadOnly={isReadOnly} />
            <FormField label="Miktar" value={state.quantities} onChange={e => handleChange('quantities', e.target.value)} isReadOnly={isReadOnly} />
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="İş Parçası Malzemesi" value={formData.workpieceMaterial} onChange={e => handleChange('workpieceMaterial', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                <FormField label="Malzeme Sertliği (N/mm² or HRC)" value={formData.materialHardness} onChange={e => handleChange('materialHardness', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                <FormField label="ae" value={formData.ae} onChange={e => handleChange('ae', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                <FormField label="ap" value={formData.ap} onChange={e => handleChange('ap', e.target.value, 'formData')} isReadOnly={isReadOnly} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                 <FormSection title="Uygulama">
                    <Checkbox name="side_face_milling" label="Yan ve yüz frezeleme" checked={formData.application.includes('side_face_milling')} onChange={() => handleMultiCheckboxChange('application', 'side_face_milling')} isReadOnly={isReadOnly} />
                    <Checkbox name="copying" label="Kopyalama" checked={formData.application.includes('copying')} onChange={() => handleMultiCheckboxChange('application', 'copying')} isReadOnly={isReadOnly} />
                    <Checkbox name="slot_drills" label="Kanal açma" checked={formData.application.includes('slot_drills')} onChange={() => handleMultiCheckboxChange('application', 'slot_drills')} isReadOnly={isReadOnly} />
                </FormSection>
                <FormSection title="Soğutma Sıvısı Kaynağı">
                    <Checkbox name="coolant_external" label="Dıştan" checked={formData.coolant === 'external'} onChange={() => handleChange('coolant', 'external', 'formData')} isReadOnly={isReadOnly} />
                    <Checkbox name="coolant_dry" label="Kuru" checked={formData.coolant === 'dry'} onChange={() => handleChange('coolant', 'dry', 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                <FormField label="Yağlayıcı" value={formData.lubricant || ''} onChange={e => handleChange('lubricant', e.target.value, 'formData')} isReadOnly={isReadOnly} />
            </div>

             <FormSection title="Ölçüler">
                <div className="flex justify-center my-2"><img src={WALTER_ASSETS.endmill_dim} alt="endmill dimensions" className="max-w-md"/></div>
            </FormSection>
            
            <FormField label="Yorumlar" type="textarea" value={state.comments} onChange={e => handleChange('comments', e.target.value)} isReadOnly={isReadOnly} />
            <FormActions isReadOnly={isReadOnly} onSave={() => onSave(state)} onPreview={() => onPreview(state)} onExport={() => onExport(state)} />
        </div>
    );
};

export default EndMillForm;