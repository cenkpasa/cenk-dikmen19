import { Fatura, StokOgeleri, ParaBirimi } from '../types';

const num = (v: any): number | null => {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).replace(',', '.').replace(/[^\d.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const asPB = (v: any): ParaBirimi =>
  (['TRY','USD','EUR'].includes(String(v)) ? v : 'TRY') as ParaBirimi;

export function mapErpToFatura(e: any): Fatura {
  return {
    id: String(e.id ?? e.ID ?? `${e.invoiceNo ?? e.No}-${e.Date ?? e.Tarih}`),
    faturaNo: String(e.faturaNo ?? e.invoiceNo ?? e.No ?? ''),
    musteriId: String(e.musteriId ?? e.cariCode ?? e.CariKod ?? ''),
    kullaniciId: e.kullaniciId ? String(e.kullaniciId) : undefined,
    tarih: new Date(e.tarih ?? e.date ?? e.Tarih ?? e.Date ?? Date.now()).toISOString(),
    paraBirimi: asPB(e.paraBirimi ?? e.currency ?? e.Doviz ?? 'TRY'),
    toplamTutar: Number(num(e.toplamTutar ?? e.total ?? e.GenelToplam ?? e.Total) ?? 0),
    description: e.description ? String(e.description) : undefined,
  };
}

export function mapErpToStok(e: any): StokOgeleri {
  return {
    id: e.id ? String(e.id) : undefined,
    kod: String(e.kod ?? e.code ?? e.StokKodu ?? e.CODE ?? ''),
    ad: String(e.ad ?? e.name ?? e.StokAdi ?? e.ADI ?? ''),
    birim: e.birim ?? e.unit ?? e.Birim ?? null,
    depo: e.depo ?? e.Depo ?? e.Warehouse ?? null,
    fiyat: num(e.fiyat ?? e.price ?? e.SatisFiyat ?? e.Price),
    kdv: num(e.kdv ?? e.vatRate ?? e.Kdv ?? e.VAT)
  };
}