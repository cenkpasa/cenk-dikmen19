import React, { useState, useEffect } from 'react';
import Loader from '@/components/common/Loader';

const workflowSteps = [
    { name: 'Model Yükleme & Analiz', icon: 'fa-cube', duration: 2000, description: '3D model yükleniyor ve DFM analizi yapılıyor...' },
    { name: 'Otomatik Tekliflendirme', icon: 'fa-file-invoice-dollar', duration: 1500, description: 'Analiz verilerine göre maliyet hesaplanıyor ve teklif oluşturuluyor...' },
    { name: 'Üretim Planlaması', icon: 'fa-calendar-alt', duration: 2500, description: 'En uygun makine, takım ve zamanlama ayarlanıyor...' },
    { name: 'Robotik Üretim', icon: 'fa-robot', duration: 4000, description: 'Robotik kollar ve CNC makineleri ile parça üretimi başladı.' },
    { name: 'Otomatik Kalite Kontrol', icon: 'fa-check-double', duration: 2000, description: 'Lazer tarayıcılar ve kameralar ile parça boyutları kontrol ediliyor.' },
    { name: 'Paketleme & Sevkiyat', icon: 'fa-box-open', duration: 1500, description: 'Ürün paketleniyor ve sevkiyata hazırlanıyor.' },
];


const WorkflowAutomationPage = () => {
    const [currentStep, setCurrentStep] = useState(-1);
    const [isProcessRunning, setIsProcessRunning] = useState(false);

    useEffect(() => {
        if (!isProcessRunning || currentStep >= workflowSteps.length) {
            return;
        }

        if (currentStep === -1) {
             setCurrentStep(0);
             return;
        }

        const currentStepData = workflowSteps[currentStep];
        const timer = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, currentStepData.duration);

        return () => clearTimeout(timer);
    }, [isProcessRunning, currentStep]);
    
    const handleStart = () => {
        setCurrentStep(-1);
        setIsProcessRunning(true);
    };

    const handleReset = () => {
        setIsProcessRunning(false);
        setCurrentStep(-1);
    };

    const isCompleted = currentStep >= workflowSteps.length;

    return (
        <div className="card">
            <div className="workflow-container">
                <div>
                    <h3>Sıfır İnsan Müdahaleli Üretim Akışı</h3>
                    <p>Bu simülasyon, bir 3D modelin yüklenmesinden paketlenmesine kadar olan tüm üretim sürecinin nasıl tamamen otomatikleştirilebileceğini gösterir.</p>
                    <ul className="workflow-steps">
                        {workflowSteps.map((step, index) => {
                             const status = index < currentStep ? 'completed' : (index === currentStep ? 'active' : 'pending');
                            return (
                                <li key={step.name} className={`workflow-step ${status}`}>
                                    <div className="workflow-step-icon">
                                        {status === 'active' && <Loader />}
                                        {status === 'completed' && <i className="fas fa-check"></i>}
                                        {status === 'pending' && <i className={`fas ${step.icon}`}></i>}
                                    </div>
                                    <div className="workflow-step-content">
                                        <h4>{step.name}</h4>
                                        {status === 'active' && <p>{step.description}</p>}
                                        {status === 'completed' && <p>Başarıyla tamamlandı.</p>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="workflow-controls">
                     {!isProcessRunning ? (
                        <button className="btn" onClick={handleStart}>
                           <i className="fas fa-play"></i> Simülasyonu Başlat
                        </button>
                    ) : isCompleted ? (
                        <div className="workflow-final-message">
                            <i className="fas fa-check-circle"></i>
                            İş Akışı Başarıyla Tamamlandı!
                             <button className="btn btn-secondary" onClick={handleReset} style={{marginTop: '1rem'}}>
                                <i className="fas fa-redo"></i> Tekrar Başlat
                            </button>
                        </div>
                    ) : (
                         <button className="btn btn-danger" onClick={handleReset}>
                           <i className="fas fa-stop"></i> Simülasyonu Durdur
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkflowAutomationPage;