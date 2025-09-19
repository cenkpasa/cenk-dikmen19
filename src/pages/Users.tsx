import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from '@/types';
import Button from '@/components/common/Button';
import UserForm from '@/components/forms/UserForm';
import PersonnelDetail from '@/components/personnel/PersonnelDetail';

const Users = () => {
    const { users, currentUser } = useAuth();
    const { t } = useLanguage();
    const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [personnelToEdit, setPersonnelToEdit] = useState<User | null>(null);

    useEffect(() => {
        if (currentUser?.role === 'admin' && users.length > 0 && !selectedPersonnelId) {
            const firstUser = users.find(u => u.role !== 'admin');
            setSelectedPersonnelId(firstUser?.id || users[0].id);
        } else if (currentUser?.role !== 'admin' && !selectedPersonnelId) {
            setSelectedPersonnelId(currentUser?.id || null);
        }
    }, [users, selectedPersonnelId, currentUser]);

    const handleAddNew = () => {
        setPersonnelToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (personnel: User) => {
        setPersonnelToEdit(personnel);
        setIsModalOpen(true);
    };

    if (!currentUser) {
        return null;
    }
    
    if (currentUser.role !== 'admin') {
        return (
             <div>
                <h1 className="text-2xl font-bold mb-6">{t('profileTitle')}</h1>
                <PersonnelDetail 
                    personnel={currentUser} 
                    onEdit={() => handleEdit(currentUser)} 
                    isOwnProfile={true} 
                />
                 {isModalOpen && <UserForm 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    user={personnelToEdit}
                />}
            </div>
        );
    }
    
    const selectedPersonnel = users.find(u => u.id === selectedPersonnelId);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold">{t('personnelManagement')}</h1>
                <Button onClick={handleAddNew} icon="fas fa-plus">{t('addNewPersonnel')}</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Personnel List */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-cnk-panel-light rounded-cnk-card shadow-md p-3 space-y-2 max-h-[75vh] overflow-y-auto">
                        {users.map(p => (
                            <div key={p.id} onClick={() => setSelectedPersonnelId(p.id)}
                                 className={`flex items-center justify-between p-3 rounded-cnk-element cursor-pointer ${selectedPersonnelId === p.id ? 'bg-cnk-accent-primary text-white shadow-md' : 'hover:bg-cnk-bg-light'}`}>
                                <div className="flex items-center overflow-hidden">
                                    <img src={p.avatar || `https://ui-avatars.com/api/?name=${p.name.replace(/\s/g, "+")}&background=random`} alt={p.name} className="w-12 h-12 rounded-full mr-4 object-cover flex-shrink-0"/>
                                    <div className="truncate">
                                        <p className="font-semibold truncate">{p.name}</p>
                                        <p className={`${selectedPersonnelId === p.id ? 'text-blue-100' : 'text-cnk-txt-muted-light'} text-sm truncate`}>{p.jobTitle || t(p.role)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Details */}
                <div className="lg:col-span-8 xl:col-span-9">
                    {selectedPersonnel ? (
                        <PersonnelDetail 
                            personnel={selectedPersonnel} 
                            onEdit={() => handleEdit(selectedPersonnel)}
                            isOwnProfile={currentUser.id === selectedPersonnel.id} 
                        />
                    ) : (
                        <div className="bg-cnk-panel-light rounded-cnk-card shadow-md p-8 text-center text-cnk-txt-muted-light h-full flex items-center justify-center">
                            <p>{t('selectPersonnelToView')}</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <UserForm 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={personnelToEdit}
            />}
        </div>
    );
};

export default Users;