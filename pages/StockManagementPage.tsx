import React, { useState } from 'react';
import { useErp } from '../contexts/ErpContext';
import { StockItem } from '../types';
import StockLevelDetail from '../components/erp/StockLevelDetail';
import { useLanguage } from '../contexts/LanguageContext';
import EmptyState from '../components/common/EmptyState';

const StockManagementPage = () => {
    const { stockItems } = useErp();
    const { t } = useLanguage();
    const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t('stockManagement')}</h1>
            
            <div className="bg-cnk-panel-light p-4 rounded-cnk-card shadow-md border">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
                    <div className="md:col-span-1 bg-cnk-bg-light p-2 rounded-cnk-element h-full overflow-y-auto">
                         {stockItems.length > 0 ? stockItems.map(item => (
                            <div key={item.id}
                                onClick={() => setSelectedStockItem(item)}
                                className={`p-3 rounded-md cursor-pointer ${selectedStockItem?.id === item.id ? 'bg-cnk-accent-primary text-white' : 'hover:bg-cnk-border-light'}`}>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs">{item.sku}</p>
                            </div>
                         )) : (
                            <div className="flex items-center justify-center h-full">
                                <EmptyState message={t('noStockData')} icon="fas fa-box-open" />
                            </div>
                         )}
                    </div>
                    <div className="md:col-span-2 bg-cnk-bg-light p-4 rounded-cnk-element h-full overflow-y-auto">
                        {selectedStockItem ? (
                            <StockLevelDetail stockItem={selectedStockItem} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-cnk-txt-muted-light">
                                <p>{t('selectStockItemToViewLevels')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockManagementPage;
