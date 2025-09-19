import { Fatura, StokOgeleri } from '@/types';

export const isFatura = (x: any): x is Fatura =>
  x && typeof x.faturaNo === 'string' && typeof x.toplamTutar === 'number';

export const isStok = (x: any): x is StokOgeleri =>
  x && typeof x.kod === 'string' && typeof x.ad === 'string';
