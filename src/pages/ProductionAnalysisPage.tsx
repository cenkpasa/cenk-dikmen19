import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { DFMAnalysisResult, ProductionQuote } from '@/types';
import { analyze3DModelForManufacturability, generateProductionQuoteFromAnalysis } from '@/services/gemini.service';
import Loader from '@/components/common/Loader';


const ProductionAnalysisPage = () => {
    const { currentUser } = useAuth();
    const { customers, addOffer } = useData();
    const [fileName, setFileName] = useState<string | null>(null);
    const [analysisStage, setAnalysisStage] = useState<'idle' | 'analyzing_dfm' | 'dfm_complete' | 'analyzing_quote' | 'quote_complete'>('idle');
    const [dfmResults, setDfmResults] = useState<DFMAnalysisResult[]>([]);
    const [quote, setQuote] = useState<ProductionQuote | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setAnalysisStage('analyzing_dfm');
            // Simulating API call for DFM analysis
            setTimeout(async () => {
                const results = await analyze3DModelForManufacturability();
                setDfmResults(results);
                setAnalysisStage('dfm_complete');
            }, 3000);
        }
    };
    
    const handleGenerateQuote = () => {
        setAnalysisStage('analyzing_quote');
         setTimeout(async () => {
            const quoteResult = await generateProductionQuoteFromAnalysis();
            setQuote(quoteResult);
            if (customers.length > 0) {
              setSelectedCustomerId(customers[0].id);
            }
            setAnalysisStage('quote_complete');
        }, 4000);
    }
    
    const handleSaveOffer = () => {
        if (!currentUser || !quote || !selectedCustomerId) {
            alert("Teklifi kaydetmek için müşteri seçimi ve analiz sonucu gereklidir.");
            return;
        }
        addOffer({
            customerId: selectedCustomerId,
            userId: currentUser.id,
            details: quote
        });
        alert("Teklif başarıyla oluşturuldu!");
        handleReset();
    }

    const handleReset = () => {
        setFileName(null);
        setDfmResults([]);
        setQuote(null);
        setAnalysisStage('idle');
        setSelectedCustomerId('');
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }


    const severityClasses: Record<string, string> = {
        'Yüksek': 'severity-high',
        'Orta': 'severity-medium',
        'Düşük': 'severity-low',
    };

    const renderContent = () => {
        switch (analysisStage) {
            case 'idle':
                return (
                     <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <i className="fas fa-upload"></i>
                        <h3>3D Model Yükle</h3>
                        <p>Analiz için .step, .stl veya .iges dosyanızı buraya sürükleyin veya seçin.</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".step,.stl,.iges"/>
                    </div>
                );
            case 'analyzing_dfm':
            case 'analyzing_quote':
                 return (
                    <div className="analysis-progress">
                        <Loader />
                        <h3>{analysisStage === 'analyzing_dfm' ? 'DFM Analizi Yapılıyor...' : 'Fiyat Teklifi Oluşturuluyor...'}</h3>
                        <p>{fileName}</p>
                    </div>
                );
            case 'dfm_complete':
            case 'quote_complete':
                return (
                     <div className="analysis-container">
                        <div className="analysis-visual">
                             <h4>Model Görselleştirmesi</h4>
                             <div className="analysis-visual-placeholder">
                                 <i className="fas fa-cube"></i>
                                 {dfmResults.map((_, index) => (
                                     <div key={index} className="hotspot" style={{top: `${20 + index * 15}%`, left: `${30 + index * 20}%`}}></div>
                                 ))}
                             </div>
                        </div>
                        <div className="analysis-report">
                             <h4>Analiz Raporu: {fileName}</h4>
                             <h5><i className="fas fa-exclamation-triangle"></i> Üretilebilirlik Sorunları</h5>
                             {dfmResults.length > 0 ? (
                                <ul className="dfm-issue-list">
                                {dfmResults.map(result => (
                                    <li key={result.issue} className="dfm-issue-item">
                                        <h5><span className={severityClasses[result.severity]}>{result.severity}</span>{result.issue}</h5>
                                        <p>{result.suggestion}</p>
                                    </li>
                                ))}
                                </ul>
                             ) : <p>Üretimi engelleyecek kritik bir sorun bulunamadı.</p>}
                            
                            {analysisStage === 'dfm_complete' && (
                                <button className="btn" onClick={handleGenerateQuote} style={{marginTop: '1rem'}}>
                                   <i className="fas fa-calculator"></i> Fiyat Teklifi Oluştur
                                </button>
                            )}
                            
                            {quote && (
                               <div className="quote-section">
                                   <div className="cost-summary">
                                       <p>Tahmini Toplam Maliyet</p>
                                       <h4>{quote.totalCost.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</h4>
                                   </div>
                                   <h5><i className="fas fa-tools"></i> Önerilen Araçlar</h5>
                                   <div className="tool-list">
                                       {quote.tools.map(tool => (
                                          <div key={tool.name} className="tool-card">
                                              <img src={tool.imageUrl} alt={tool.name} />
                                              <h6>{tool.name}</h6>
                                              <p>{tool.purpose}</p>
                                          </div>
                                       ))}
                                   </div>

                                   <div className="save-offer-section">
                                        <div className="form-group">
                                            <label>Müşteri Seçimi</label>
                                            <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                       <button className="btn btn-success" onClick={handleSaveOffer} disabled={!selectedCustomerId}>
                                            <i className="fas fa-save"></i> Teklifi Kaydet
                                       </button>
                                   </div>
                               </div>
                            )}

                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="card">
            {analysisStage !== 'idle' && (
                 <button className="btn-link" onClick={handleReset} style={{marginBottom: '1rem'}}>
                    <i className="fas fa-redo"></i> Yeni Analiz Başlat
                </button>
            )}
            {renderContent()}
        </div>
    );
};

export default ProductionAnalysisPage;
