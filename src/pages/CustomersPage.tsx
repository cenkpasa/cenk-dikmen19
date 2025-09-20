import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { Customer, CustomerSegment } from '@/types';

const CustomerForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void; }) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const validate = () => {
        const newErrors: {[key: string]: string} = {};
        if (!name) newErrors.name = 'Müşteri adı zorunludur.';
        if (!contact) newErrors.contact = 'Yetkili adı zorunludur.';
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin.';
        }
        if (phone && !/^\d{10,11}$/.test(phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Telefon numarası 10 veya 11 haneli olmalıdır.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ name, contact, phone, email, address, visitCount: 0 });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Müşteri Adı</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
                <label>Yetkili</label>
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} required/>
                {errors.contact && <p className="form-error">{errors.contact}</p>}
            </div>
            <div className="form-group">
                <label>Telefon</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXXX" />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>
            <div className="form-group">
                <label>E-Posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
             <div className="form-group">
                <label>Adres</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>İptal</button>
                <button type="submit" className="btn">Kaydet</button>
            </div>
        </form>
    );
};


const CustomersPage = () => {
    const { customers, addCustomer, deleteCustomer } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSegment, setActiveSegment] = useState<CustomerSegment | 'all'>('all');

    const handleSaveCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'ownerId' | 'segment'>) => {
        if (!currentUser) return;
        addCustomer({ ...data, ownerId: currentUser.id });
        setIsModalOpen(false);
    };

    const filteredCustomers = useMemo(() => {
        if (activeSegment === 'all') return customers;
        return customers.filter(c => c.segment === activeSegment);
    }, [customers, activeSegment]);

    const segmentClasses: Record<CustomerSegment, string> = {
        'Sadık': 'segment-sadik',
        'Potansiyel': 'segment-potansiyel',
        'Riskli': 'segment-riskli',
        'Yeni': 'segment-yeni',
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-filters">
                    <label>Segment:</label>
                     <select value={activeSegment} onChange={e => setActiveSegment(e.target.value as any)}>
                        <option value="all">Tümü</option>
                        <option value="Sadık">Sadık</option>
                        <option value="Potansiyel">Potansiyel</option>
                        <option value="Riskli">Riskli</option>
                        <option value="Yeni">Yeni</option>
                    </select>
                </div>
                <button className="btn" onClick={() => setIsModalOpen(true)} style={{width: 'auto'}}>Yeni Müşteri Ekle</button>
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Müşteri Adı</th>
                                <th>Segment</th>
                                <th>Yetkili</th>
                                <th>Telefon</th>
                                <th>E-Posta</th>
                                <th>Eylemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td><span className={`segment-badge ${segmentClasses[customer.segment]}`}>{customer.segment}</span></td>
                                    <td>{customer.contact}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email}</td>
                                    <td className="action-buttons">
                                        <button className="btn btn-danger btn-small" onClick={() => deleteCustomer(customer.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Müşteri Oluştur">
                <CustomerForm onSave={handleSaveCustomer} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default CustomersPage;