// This file centralizes all mock data used to simulate the ERP system.
// By using structured JavaScript objects instead of raw text (like CSV),
// we eliminate parsing errors and ensure data consistency.
import { Offer, IncomingInvoice, OutgoingInvoice, StockItem, Warehouse, StockLevel, Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * MOCK CUSTOMER DATA
 * Simulates the customer master data from the ERP.
 */
export const MOCK_ERP_CUSTOMERS: Omit<Customer, 'id' | 'createdAt' | 'synced'>[] = [
    {
        currentCode: 'CNKCK-1030847',
        name: 'SEYMEN İSG (ERP)',
        commercialTitle: 'SEYMEN İŞ SAĞLIĞI VE GÜVENLİĞİ',
        city: 'ANKARA',
        district: 'YENİMAHALLE',
        country: 'TÜRKİYE',
        taxOffice: 'YENİMAHALLE',
        taxNumber: '4610455720',
        status: 'active',
    },
    {
        currentCode: 'CR01332',
        name: 'EUROFER KESİCİ TAKIMLAR (ERP)',
        commercialTitle: 'EUROFER KESİCİ TAKIMLAR',
        city: 'ANKARA',
        district: 'YENİMAHALLE',
        country: 'TÜRKİYE',
        taxOffice: 'İVEDİK',
        taxNumber: '4641531636',
        status: 'active',
    },
    {
        currentCode: 'CR00980',
        name: 'CUTRON KESİCİ TAKIMLAR (ERP)',
        commercialTitle: 'CUTRON KESİCİ TAKIMLAR',
        city: 'ANKARA',
        district: 'YENİMAHALLE',
        country: 'TÜRKİYE',
        taxOffice: 'İVEDİK',
        taxNumber: '2161201788',
        status: 'active',
    },
    {
        currentCode: '5376',
        name: 'AK KESİCİ TAKIM (ERP)',
        commercialTitle: 'AK KESİCİ TAKIM',
        city: 'ANKARA',
        district: 'YENİMAHALLE',
        country: 'TÜRKİYE',
        taxOffice: 'ULUS',
        taxNumber: '0111103590',
        status: 'active',
    }
];

/**
 * MOCK STOCK ITEM DATA
 * Simulates the product/stock master data from the ERP.
 */
export const MOCK_ERP_STOCK_ITEMS: Omit<StockItem, 'id' | 'lastSync'>[] = [
    { erpId: 'SKU001', sku: 'SKU001', name: 'Karbür Matkap Ucu 5mm', barcode: '8691234567890', unit: 'Adet', price: 120.50, isActive: true },
    { erpId: 'SKU002', sku: 'SKU002', name: 'CNC Torna Kateri', barcode: '8691234567891', unit: 'Adet', price: 450.00, isActive: true },
    { erpId: 'SKU003', sku: 'SKU003', name: 'Elmas Freze Ucu 10mm', barcode: '8691234567892', unit: 'Adet', price: 275.75, isActive: true },
    { erpId: 'SKU004', sku: 'SKU004', name: 'Kılavuz Pafta Seti', barcode: '8691234567893', unit: 'Set', price: 890.00, isActive: false },
    { erpId: 'SKU005', sku: 'SKU005', name: 'HSS-E Matkap Ucu 8mm', barcode: '8691234567894', unit: 'Adet', price: 95.00, isActive: true }
];

/**
 * MOCK WAREHOUSE DATA
 * Simulates the warehouse master data from the ERP.
 */
export const MOCK_ERP_WAREHOUSES: Warehouse[] = [
    { id: 'merkez', code: 'MERKEZ', name: 'Merkez Depo' },
    { id: 'sube-a', code: 'SUBE-A', name: 'A Şubesi Deposu' },
    { id: 'sube-b', code: 'SUBE-B', name: 'B Şubesi Deposu' },
];

/**
 * MOCK STOCK LEVEL DATA
 * Simulates stock quantities per item per warehouse from the ERP.
 */
export const MOCK_ERP_STOCK_LEVELS: Omit<StockLevel, 'id'>[] = [
    { stockItemId: 'SKU001', warehouseCode: 'MERKEZ', qtyOnHand: 150 },
    { stockItemId: 'SKU001', warehouseCode: 'SUBE-A', qtyOnHand: 50 },
    { stockItemId: 'SKU002', warehouseCode: 'MERKEZ', qtyOnHand: 45 },
    { stockItemId: 'SKU003', warehouseCode: 'MERKEZ', qtyOnHand: 80 },
    { stockItemId: 'SKU003', warehouseCode: 'SUBE-A', qtyOnHand: 20 },
    { stockItemId: 'SKU003', warehouseCode: 'SUBE-B', qtyOnHand: 15 },
    { stockItemId: 'SKU005', warehouseCode: 'MERKEZ', qtyOnHand: 250 },
];

/**
 * MOCK OFFER DATA
 * Simulates sales offers from the ERP.
 */
export const MOCK_ERP_OFFERS: (Omit<Offer, 'id' | 'createdAt' | 'toplam' | 'kdv' | 'genelToplam' | 'customerId'> & { customerCurrentCode: string })[] = [
    {
        customerCurrentCode: 'CR01332',
        // Fix: Added missing 'userId' property to satisfy the Offer type.
        userId: 'user-goksel',
        teklifNo: 'ERP-TEK-001',
        currency: 'TRY',
        firma: { yetkili: 'ERP Yetkilisi', telefon: '03125551020', eposta: 'info@eurofer.com.tr', vade: '60 Gün', teklifTarihi: new Date().toISOString().slice(0, 10) },
        teklifVeren: { yetkili: 'ERP Sistemi', telefon: '', eposta: '' },
        items: [
            { id: uuidv4(), cins: 'CNC Torna Ucu - ERP Özel', miktar: 50, birim: 'Adet', fiyat: 85, tutar: 4250, teslimSuresi: '3 Gün' },
            { id: uuidv4(), cins: 'Freze Bıçağı - 12mm ERP', miktar: 20, birim: 'Adet', fiyat: 155, tutar: 3100, teslimSuresi: 'Stoktan' }
        ],
        notlar: 'ERP üzerinden otomatik oluşturulmuş test teklifi.',
    },
    {
        customerCurrentCode: 'CR00980',
        // Fix: Added missing 'userId' property to satisfy the Offer type.
        userId: 'user-ilker',
        teklifNo: 'ERP-TEK-002',
        currency: 'USD',
        firma: { yetkili: 'Metin Yalçındere', telefon: '03122223344', eposta: 'info@cutron.com.tr', vade: '30 Gün', teklifTarihi: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
        teklifVeren: { yetkili: 'ERP Sistemi', telefon: '', eposta: '' },
        items: [
            { id: uuidv4(), cins: 'Özel Karbür Freze', miktar: 100, birim: 'Adet', fiyat: 135.66, tutar: 13566, teslimSuresi: '1 Hafta' }
        ],
        notlar: 'İkinci ERP üzerinden otomatik oluşturulmuş test teklifi.',
    }
];

/**
 * MOCK INCOMING INVOICE DATA
 * Simulates purchase invoices from the ERP.
 */
export const MOCK_INCOMING_INVOICES: IncomingInvoice[] = [
  { faturaNo: 'EUR2025000009155', tedarikciAdi: 'EUROFER KESİCİ TAKIMLAR', vergiNo: '4641531636', tarih: '2025-08-04T10:46:00.000Z', tutar: 3288.00, currency: 'TRY', description: 'CG35692,IAT206B-080' },
  { faturaNo: 'CTR2025000002662', tedarikciAdi: 'CUTRON KESİCİ TAKIMLAR', vergiNo: '2161201788', tarih: '2025-08-01T07:56:00.000Z', tutar: 13566.24, currency: 'TRY', description: 'KARBÜR FREZE' },
  { faturaNo: 'AKH2025000000728', tedarikciAdi: 'AK KESİCİ TAKIM', vergiNo: '0111103590', tarih: '2025-07-24T11:18:00.000Z', tutar: 2169.60, currency: 'TRY', description: 'KARBÜR MATKAP' },
  { faturaNo: 'ASL2025000002659', tedarikciAdi: 'ASLAN GRUP KESİCİ TAKIM', vergiNo: '0891305401', tarih: '2025-07-23T18:15:00.000Z', tutar: 7333.62, currency: 'TRY', description: 'Özel Takım' },
];

/**
 * MOCK OUTGOING INVOICE DATA
 * Simulates sales invoices from the ERP.
 */
export const MOCK_OUTGOING_INVOICES: OutgoingInvoice[] = [
  { faturaNo: 'CNK-SATIS-001', musteriAdi: 'EUROFER KESİCİ TAKIMLAR', vergiNo: '4641531636', tarih: '2025-08-05T09:00:00.000Z', tutar: 3288.00, currency: 'TRY', description: 'CG35692' },
  { faturaNo: 'CNK-SATIS-002', musteriAdi: 'CUTRON KESİCİ TAKIMLAR', vergiNo: '2161201788', tarih: '2025-08-03T14:30:00.000Z', tutar: 13566.24, currency: 'TRY', description: 'KARBÜR FREZE' },
  { faturaNo: 'CNK-SATIS-003', musteriAdi: 'ASLAN GRUP KESİCİ TAKIM', vergiNo: '0891305401', tarih: '2025-07-23T18:15:00.000Z', tutar: 7333.61, currency: 'TRY', description: 'Özel Takımlar' },
  { faturaNo: 'CNK-SATIS-004', musteriAdi: 'YENİ MÜŞTERİ A.Ş.', vergiNo: '9999999999', tarih: '2025-08-10T11:00:00.000Z', tutar: 5000.00, currency: 'TRY', description: 'Hırdavat' },
];