import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/dbService';
import { StokOgeleri, Warehouse } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import DataTable from '../common/DataTable';

interface StockLevelDetailProps {
    item?: StokOgeleri | null;
}

const StockLevelDetail = ({ item }: StockLevelDetailProps) => {
    const { t } = useLanguage();
    
    // Find the local stock item using the SKU from the ERP item
    const localItem = useLiveQuery(
        () => item ? db.stockItems.where('kod').equals(item.kod).first() : Promise.resolve(undefined),
        [item?.kod]
    );
    
    // Fetch stock levels using the ID of the found local item
    const stockLevels = useLiveQuery(
        () => localItem?.id ? db.stockLevels.where('stockItemId').equals(localItem.id).toArray() : Promise.resolve([]),
        [localItem?.id]
    ) || [];

    const warehouses = useLiveQuery(() => db.warehouses.toArray(), []) || [];
    const warehouseMap = new Map(warehouses.map(w => [w.code, w.name]));

    const data = stockLevels.map(level => ({
        ...level,
        warehouseName: warehouseMap.get(level.warehouseCode) || level.warehouseCode
    }));

    const columns = [
        { header: 'Depo', accessor: (item: any) => item.warehouseName },
        { header: t('stockQuantity'), accessor: (item: any) => item.qtyOnHand },
    ];
    
    if (!item) return null;

    return (
        <div>
            <h3 className="font-bold text-lg mb-4 text-cnk-txt-primary-light">{item.ad}</h3>
            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div className="bg-slate-200 p-2 rounded"><b>Kod:</b> {item.kod}</div>
                <div className="bg-slate-200 p-2 rounded"><b>Birim:</b> {item.birim || '-'}</div>
                <div className="bg-slate-200 p-2 rounded"><b>Fiyat:</b> {item.fiyat ?? '-'}</div>
            </div>
            <h4 className="font-semibold text-md mb-2 text-cnk-txt-secondary-light">{t('warehouseStockLevels')}</h4>
            <DataTable 
                columns={columns} 
                data={data}
                emptyStateMessage="Bu ürün için depo stok bilgisi bulunamadı."
            />
        </div>
    );
};

export default StockLevelDetail;