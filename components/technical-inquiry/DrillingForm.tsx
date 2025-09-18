import React, { useState, useEffect } from 'react';
import { TechnicalInquiry, DrillingFormData, Customer } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { FormHeader, FormSection, ImageRadio, FormField, FormActions, Checkbox } from './FormCommon';
import { WALTER_ASSETS } from '../../constants';
import Autocomplete from '../common/Autocomplete';

interface DrillingFormProps {
    inquiry: TechnicalInquiry | null;
    initialCustomer: Customer | null;
    onSave: (data: TechnicalInquiry) => void;
    onPreview: (data: TechnicalInquiry) => void;
    onExport: (data: TechnicalInquiry) => void;
}

const DrillingForm = ({ inquiry, initialCustomer, onSave, onPreview, onExport }: DrillingFormProps) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { customers } = useData();
    const isReadOnly = inquiry ? inquiry.userId !== currentUser?.id && currentUser?.role !== 'admin' : false;

    const getInitialState = (): TechnicalInquiry => ({
        id: '',
        customerId: '',
        userId: currentUser?.id || '',
        createdAt: new Date().toISOString(),
        title: '',
        type: 'drilling',
        status: 'draft',
        company: '', contactPerson: '', address: '', country: '', phone: '', fax: '', email: '', customerNo: '', quantities: '', comments: '',
        formData: {
            workpieceMaterial: '', drillingDepth: '',
            holeType: 'standard', coolant: 'internal', shank: 'HA', mql: 'elliptic',
            productFamilies: [], coating: [],
            dimensions: { hole: '', holeTol: '', tool: '', toolTol: '' },
            step1: { hole: '', holeTol: '', tool: '', toolTol: '' },
            step2: { hole: '', holeTol: '', tool: '', toolTol: '' },
        }
    });

    const [state, setState] = useState<TechnicalInquiry>(getInitialState());

    useEffect(() => {
        if (inquiry) {
            setState(inquiry);
        } else if (initialCustomer) {
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
        else {
            setState(getInitialState());
        }
    }, [inquiry, initialCustomer]);

    const handleChange = (field: string, value: any, section?: keyof TechnicalInquiry | 'formData' | 'dimensions' | 'step1' | 'step2') => {
        if (section === 'formData') {
            setState(prev => ({ ...prev, formData: { ...prev.formData, [field]: value } }));
        } else if (section === 'dimensions' || section === 'step1' || section === 'step2') {
            const formData = state.formData as DrillingFormData;
            setState(prev => ({...prev, formData: { ...formData, [section]: { ...formData[section], [field]: value }}}));
        }
         else {
            setState(prev => ({ ...prev, [field]: value }));
        }
    };
    
    const handleMultiCheckboxChange = (field: keyof DrillingFormData, value: string) => {
        const formData = state.formData as DrillingFormData;
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

    const formData = state.formData as DrillingFormData;

    return (
        <div className="space-y-4 text-sm">
            <FormHeader title="Özel Takım Talep Formu - Delme" state={state} onCustomerSelect={handleCustomerSelect} onChange={handleChange} isReadOnly={isReadOnly} />
            <FormField label="Miktar" value={state.quantities} onChange={e => handleChange('quantities', e.target.value)} isReadOnly={isReadOnly} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField label="İş Parçası Malzemesi" value={formData.workpieceMaterial} onChange={e => handleChange('workpieceMaterial', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                 <FormField label="Delme Derinliği" value={formData.drillingDepth} onChange={e => handleChange('drillingDepth', e.target.value, 'formData')} isReadOnly={isReadOnly} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                <FormSection title="Delik Tipi">
                    <ImageRadio name="holeType" value="standard" image={WALTER_ASSETS.drilling_hole_standard} checked={formData.holeType === 'standard'} onChange={e => handleChange('holeType', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                    <ImageRadio name="holeType" value="through" image={WALTER_ASSETS.drilling_hole_through} checked={formData.holeType === 'through'} onChange={e => handleChange('holeType', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                 <FormSection title="Soğutma">
                     <Checkbox name="coolant_internal" label="İçten" checked={formData.coolant === 'internal'} onChange={() => handleChange('coolant', 'internal', 'formData')} isReadOnly={isReadOnly} />
                     <Checkbox name="coolant_external" label="Dıştan" checked={formData.coolant === 'external'} onChange={() => handleChange('coolant', 'external', 'formData')} isReadOnly={isReadOnly} />
                     <Checkbox name="coolant_dry" label="Kuru" checked={formData.coolant === 'dry'} onChange={() => handleChange('coolant', 'dry', 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                <FormSection title="Şank Tipi (DIN 6535)">
                     <ImageRadio name="shank" value="HA" label="HA" image={WALTER_ASSETS.shank_ha} checked={formData.shank === 'HA'} onChange={e => handleChange('shank', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                     <ImageRadio name="shank" value="HE" label="HE" image={WALTER_ASSETS.shank_he} checked={formData.shank === 'HE'} onChange={e => handleChange('shank', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                     <ImageRadio name="shank" value="HB" label="HB" image={WALTER_ASSETS.shank_hb} checked={formData.shank === 'HB'} onChange={e => handleChange('shank', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
                 <FormSection title="MQL/MMS">
                     <ImageRadio name="mql" value="elliptic" image={WALTER_ASSETS.mql_elliptic} checked={formData.mql === 'elliptic'} onChange={e => handleChange('mql', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                     <ImageRadio name="mql" value="round" image={WALTER_ASSETS.mql_round} checked={formData.mql === 'round'} onChange={e => handleChange('mql', e.target.value, 'formData')} isReadOnly={isReadOnly} />
                </FormSection>
            </div>
            
            <FormSection title="Ölçüler">
                <div className="flex justify-center my-2"><img src={WALTER_ASSETS.drilling_dim} alt="drilling dimensions" className="max-w-md"/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-2 border rounded-md"><h4 className="font-semibold">Delik</h4>
                        <FormField label="Ø" value={formData.dimensions.hole} onChange={e => handleChange('hole', e.target.value, 'dimensions')} isReadOnly={isReadOnly} inline/>
                        <FormField label="Tol." value={formData.dimensions.holeTol} onChange={e => handleChange('holeTol', e.target.value, 'dimensions')} isReadOnly={isReadOnly} inline/>
                    </div>
                     <div className="space-y-2 p-2 border rounded-md"><h4 className="font-semibold">Takım</h4>
                        <FormField label="Ø" value={formData.dimensions.tool} onChange={e => handleChange('tool', e.target.value, 'dimensions')} isReadOnly={isReadOnly} inline/>
                        <FormField label="Tol." value={formData.dimensions.toolTol} onChange={e => handleChange('toolTol', e.target.value, 'dimensions')} isReadOnly={isReadOnly} inline/>
                    </div>
                </div>
            </FormSection>

            <FormField label="Yorumlar" type="textarea" value={state.comments} onChange={e => handleChange('comments', e.target.value)} isReadOnly={isReadOnly} />
            <FormActions isReadOnly={isReadOnly} onSave={() => onSave(state)} onPreview={() => onPreview(state)} onExport={() => onExport(state)} />
        </div>
    );
};

export default DrillingForm;