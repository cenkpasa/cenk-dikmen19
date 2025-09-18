import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Offer, Customer, Reconciliation, Interview, IncomingInvoice, OutgoingInvoice, TechnicalInquiry } from '../types';
import { COMPANY_INFO, ASSETS, WALTER_ASSETS } from '../constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatting';

export const getOfferHtml = (offer: Offer, customer: Customer | undefined, t: (key: string, replacements?: Record<string, string>) => string): string => {
    const exchangeRateText = offer.currency !== 'TRY' && offer.exchangeRates 
      ? `<p style="font-size: 7pt; text-align: center; margin-top: 5px;">*Teklif tarihindeki TCMB Kurları: 1 USD = ${offer.exchangeRates.USD.toFixed(4)} TL, 1 EUR = ${offer.exchangeRates.EUR.toFixed(4)} TL</p>`
      : '';

    return `
    <div style="font-family: Arial, sans-serif; width: 210mm; height: 297mm; background: white; color: #000; padding: 10mm; box-sizing: border-box; display: flex; flex-direction: column; font-size: 9pt; line-height: 1.4;">
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5mm;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <img src="${ASSETS.CNK_LOGO_BASE64}" style="max-width: 120mm; max-height: 25mm;" alt="Company Logo"/>
              <p style="margin: 2px 0 0 0; font-size: 11pt; font-weight: bold; color: #c00000;">CENK DİKMEN</p>
              <p style="margin: 0; font-size: 9pt;">Genel Müdür</p>
              <p style="margin: 0; font-size: 9pt;">+90 533 404 79 38</p>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right; font-size: 9pt;">
              <p style="margin: 0;">İvedik OSB Melih Gökçek Blv.</p>
              <p style="margin: 0;">No: 151/4 Yenimahalle / ANKARA</p>
              <p style="margin: 0;">cenk@cnkkesicitakim.com.tr</p>
              <p style="margin: 0;">satis@cnkkesicitakim.com.tr</p>
              <p style="margin: 0; font-weight: bold;">www.cnkkesicitakim.com.tr</p>
            </td>
            <td style="width: 60px; vertical-align: top; text-align: right;">
                <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,0 C50,40 70,100 100,100 L100,0 Z" fill="#c00000"/>
                </svg>
            </td>
          </tr>
        </table>

        <h1 style="text-align: center; font-size: 24pt; font-weight: bold; margin: 5mm 0; padding-bottom: 2mm;">FİYAT TEKLİFİ</h1>

        <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
          <tr>
            <td style="width: 50%; vertical-align: top; border: 1px solid #000; padding: 3mm;">
               <table style="width: 100%;">
                    <tr><td style="width: 80px;">Firma / Kuruluş</td><td>: ${customer?.name ?? ''}</td></tr>
                    <tr><td>Yetkili</td><td>: ${offer.firma.yetkili}</td></tr>
                    <tr><td>Telefon</td><td>: ${offer.firma.telefon}</td></tr>
                    <tr><td>E-Posta</td><td>: ${offer.firma.eposta}</td></tr>
                    <tr><td>Vade</td><td>: ${offer.firma.vade}</td></tr>
                    <tr><td>Teklif Tarihi</td><td>: ${formatDate(offer.firma.teklifTarihi)}</td></tr>
                    <tr><td>Teklif No</td><td>: ${offer.teklifNo}</td></tr>
               </table>
            </td>
            <td style="width: 50%; vertical-align: top; border: 1px solid #000; padding: 3mm;">
               <table style="width: 100%;">
                    <tr><td style="width: 100px;">Teklif veren Firma</td><td>: ${COMPANY_INFO.name}</td></tr>
                    <tr><td>Yetkili</td><td>: ${offer.teklifVeren.yetkili}</td></tr>
                    <tr><td>Telefon</td><td>: ${offer.teklifVeren.telefon || COMPANY_INFO.phone}</td></tr>
                    <tr><td>E-Posta</td><td>: ${offer.teklifVeren.eposta || COMPANY_INFO.email}</td></tr>
                </table>
            </td>
          </tr>
        </table>
        
        <p style="margin: 5mm 0;">Firmamızdan istemiş olduğunuz ürünlerimizle ilgili fiyat teklifimizi aşağıda bilgilerinize sunar iyi çalışmalar dileriz.</p>
        <p style="text-align: right; margin: 0 0 5mm 0;">Saygılarımızla,</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
          <thead style="background-color: #c00000; color: white;">
            <tr>
              <th style="padding: 2mm; border: 1px solid #000; font-weight: normal; text-align: left;">MALZEMENİN CİNSİ</th>
              <th style="padding: 2mm; border: 1px solid #000; font-weight: normal; width: 50px;">MİKTAR</th>
              <th style="padding: 2mm; border: 1px solid #000; font-weight: normal; width: 50px;">BİRİM</th>
              <th style="padding: 2mm; border: 1px solid #000; font-weight: normal; width: 80px;">FİYAT</th>
              <th style="padding: 2mm; border: 1px solid #000; font-weight: normal; width: 80px;">TUTAR</th>
              <th style="padding: 2mm; border: 1px solid #000; font-weight: normal; width: 80px;">TESLİM SÜRESİ</th>
            </tr>
          </thead>
          <tbody>
            ${offer.items.map((item) => `
              <tr style="border: 1px solid #000;">
                <td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000; text-align: left;">${item.cins}</td>
                <td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000; text-align: center;">${item.miktar}</td>
                <td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000; text-align: center;">${item.birim}</td>
                <td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000; text-align: right;">${formatCurrency(item.fiyat, offer.currency)}</td>
                <td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000; text-align: right;">${formatCurrency(item.tutar, offer.currency)}</td>
                <td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000; text-align: center;">${item.teslimSuresi}</td>
              </tr>
            `).join('')}
            ${Array(Math.max(0, 10 - offer.items.length)).fill('<tr><td style="padding: 2mm; border-left: 1px solid #000; border-right: 1px solid #000;">&nbsp;</td><td style="border-left: 1px solid #000; border-right: 1px solid #000;"></td><td style="border-left: 1px solid #000; border-right: 1px solid #000;"></td><td style="border-left: 1px solid #000; border-right: 1px solid #000;"></td><td style="border-left: 1px solid #000; border-right: 1px solid #000;"></td><td style="border-left: 1px solid #000; border-right: 1px solid #000;"></td></tr>').join('')}
             <tr style="border-top: 1px solid #000;"></tr>
          </tbody>
        </table>

        <table style="width: 100%; margin-top: 5mm; font-size: 9pt;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
                <div style="border: 1px solid #000; padding: 2mm; min-height: 40mm;">
                  <strong style="display: block; margin-bottom: 5px;">TEKLİF NOT:</strong>
                  <p style="white-space: pre-wrap; margin: 0;">${offer.notlar}</p>
                </div>
            </td>
            <td style="width: 40%; vertical-align: top; padding-left: 5mm;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="border: 1px solid #000; padding: 2mm;">TOPLAM</td><td style="border: 1px solid #000; padding: 2mm; text-align: right;">${formatCurrency(offer.toplam, offer.currency)}</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 2mm;">%20 KDV</td><td style="border: 1px solid #000; padding: 2mm; text-align: right;">${formatCurrency(offer.kdv, offer.currency)}</td></tr>
                    <tr style="background-color: #c00000; color: white; font-weight: bold;"><td style="border: 1px solid #000; padding: 2mm;">G.TOPLAM</td><td style="border: 1px solid #000; padding: 2mm; text-align: right;">${formatCurrency(offer.genelToplam, offer.currency)}</td></tr>
                </table>
                 ${exchangeRateText}
            </td>
          </tr>
        </table>
        
        <div style="flex-grow: 1;"></div> <!-- Spacer -->

        <table style="width: 100%; font-size: 8pt; color: #333;">
            <tr>
                <td style="width: 60%; vertical-align: bottom;">
                    <p style="margin: 2px 0;">*Fiyatlarımıza KDV Dahil Değildir.</p>
                    <p style="margin: 2px 0;">*Opsiyon 10 Gündür.</p>
                    <p style="margin: 2px 0;">*Yurt Dışı Siparişler ve Özel Takımlar İadesi Söz Konusu Değildir.</p>
                    <p style="margin: 2px 0;">*Verilen Fiyatlar Fatura Tarihindeki TCMB Döviz Satış Kurundan TL Çevrilecektir.</p>
                    <p style="margin: 2px 0;"><b>Not:</b> Lütfen sipariş onayınızla birlikte firma / kuruluş, sevk ve teslim bilgilerinizi eksiksiz doldurunuz.</p>
                </td>
                <td style="width: 40%; vertical-align: bottom; padding-left: 5mm;">
                     <div style="border: 1px solid #000; padding: 2mm; height: 50mm; text-align: left;">
                        <p style="margin: 0;">Yukarıda belirtilen adet, fiyat, teslim ve ödeme koşulları ile siparişimizdir.</p>
                        <b style="font-size: 10pt; display: block; text-align: center; margin-top: 5px;">Müşteri Sipariş Onay Bölümü :</b>
                    </div>
                </td>
            </tr>
        </table>
      </div>
    `;
};

const downloadPdf = async (htmlContent: string, fileName: string): Promise<{success: boolean}> => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; 
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container.children[0] as HTMLElement, { scale: 3, useCORS: true, width: 794, windowWidth: 794 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(fileName);
        return { success: true };
    } catch (error) {
        console.error('PDF generation error:', error);
        return { success: false };
    } finally {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

export const downloadOfferAsPdf = (offer: Offer, customer: Customer | undefined, t: (key: string, replacements?: Record<string, string>) => string) => {
    const html = getOfferHtml(offer, customer, t);
    return downloadPdf(html, `Teklif_${offer.teklifNo}.pdf`);
};

export const getDrillingInquiryHtml = (inquiry: TechnicalInquiry): string => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
            <h1 style="text-align: center;">Özel Takım Talep Formu - Delme</h1>
            <img src="${ASSETS.CNK_LOGO_BASE64}" style="height: 50px; display: block; margin: 0 auto;"/>
            <h2>Firma Bilgileri</h2>
            <p><strong>Firma:</strong> ${inquiry.company}</p>
            <p><strong>Yetkili:</strong> ${inquiry.contactPerson}</p>
            <p><strong>Müşteri No:</strong> ${inquiry.customerNo}</p>
            <h2>Teknik Detaylar</h2>
            <p><strong>Malzeme:</strong> ${(inquiry.formData as any).workpieceMaterial || ''}</p>
            <img src="${WALTER_ASSETS.drilling_dim}" style="width: 100%; max-width: 500px;"/>
            <p><strong>Yorumlar:</strong> ${inquiry.comments}</p>
        </div>
    `;
};
export const getTappingInquiryHtml = (inquiry: TechnicalInquiry): string => {
     return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
            <h1 style="text-align: center;">Özel Takım Talep Formu - Kılavuz Çekme</h1>
            <img src="${ASSETS.CNK_LOGO_BASE64}" style="height: 50px; display: block; margin: 0 auto;"/>
            <h2>Firma Bilgileri</h2>
            <p><strong>Firma:</strong> ${inquiry.company}</p>
            <h2>Teknik Detaylar</h2>
            <p><strong>Uygulama:</strong> ${(inquiry.formData as any).application || ''}</p>
            <img src="${WALTER_ASSETS.tapping_dim}" style="width: 100%; max-width: 500px;"/>
            <p><strong>Yorumlar:</strong> ${inquiry.comments}</p>
        </div>
    `;
};
export const getEndMillInquiryHtml = (inquiry: TechnicalInquiry): string => {
     return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
            <h1 style="text-align: center;">Özel Takım Talep Formu - Parmak Freze</h1>
            <img src="${ASSETS.CNK_LOGO_BASE64}" style="height: 50px; display: block; margin: 0 auto;"/>
            <h2>Firma Bilgileri</h2>
            <p><strong>Firma:</strong> ${inquiry.company}</p>
            <h2>Teknik Detaylar</h2>
            <p><strong>Malzeme:</strong> ${(inquiry.formData as any).workpieceMaterial || ''}</p>
            <img src="${WALTER_ASSETS.endmill_dim}" style="width: 100%; max-width: 500px;"/>
            <p><strong>Yorumlar:</strong> ${inquiry.comments}</p>
        </div>
    `;
};


export const downloadTechnicalInquiryAsPdf = (inquiry: TechnicalInquiry) => {
    let html = '';
    let fileName = `Talep_${inquiry.title}.pdf`;
    switch(inquiry.type) {
        case 'drilling':
            html = getDrillingInquiryHtml(inquiry);
            break;
        case 'tapping':
            html = getTappingInquiryHtml(inquiry);
            break;
        case 'end_mill':
            html = getEndMillInquiryHtml(inquiry);
            break;
    }
    return downloadPdf(html, fileName);
}


export const getReconciliationHtml = (reconciliation: Reconciliation, customer: Customer, invoices: (IncomingInvoice | OutgoingInvoice)[], t: (key: string) => string): string => {
    
    return `
    <div style="font-family: Arial, sans-serif; width: 210mm; min-height: 297mm; padding: 15mm; box-sizing: border-box; font-size: 11pt; color: #333; display: flex; flex-direction: column;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="text-align: center; font-size: 16pt; font-weight: bold; padding-bottom: 20px;" colspan="2">Mutabakat Mektubu</td>
            </tr>
            <tr>
                 <td style="width: 50%;"></td>
                 <td style="text-align: right; font-size: 11pt;">Tarih : ${formatDate(new Date().toISOString())}</td>
            </tr>
        </table>
        
        <p style="margin-top: 30px; margin-bottom: 10px;">Sayın ${customer.name},</p>
        <p style="line-height: 1.5; margin: 0;">Dönemi Formlarına ilişkin fatura sayısı ve KDV hariç tutarlarına ait bilgiler aşağıda yer almaktadır.Mutabık olup olmadığınızı bildirmenizi rica ederiz.</p>
        <p style="margin-top: 10px; margin-bottom: 30px;">Saygılarımızla</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 10pt;">
            <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                    <h3 style="font-size: 12pt; font-weight:bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">Gönderen</h3>
                    <table style="width: 100%;">
                        ${InfoRow('Vergi Dairesi', COMPANY_INFO.taxOffice)}
                        ${InfoRow('Vergi Numarası', COMPANY_INFO.taxNumber)}
                        ${InfoRow('Telefon', COMPANY_INFO.phone)}
                        ${InfoRow('Faks', COMPANY_INFO.fax)}
                        ${InfoRow('Yetkili', COMPANY_INFO.authorizedPerson)}
                        ${InfoRow('E-Posta', COMPANY_INFO.email)}
                    </table>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 20px;">
                    <h3 style="font-size: 12pt; font-weight:bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">Cari Hesap Bilgileriniz</h3>
                     <table style="width: 100%;">
                        ${InfoRow('Vergi Dairesi', customer.taxOffice || '')}
                        ${InfoRow('Vergi Numarası', customer.taxNumber || '')}
                        ${InfoRow('Telefon', customer.phone1 || '')}
                        ${InfoRow('Faks', customer.fax || '')}
                        ${InfoRow('Yetkili', '')}
                        ${InfoRow('E-Posta', customer.email || '')}
                    </table>
                </td>
            </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; text-align: center; border: 1px solid #000; font-size: 10pt;">
            <thead style="background-color: #f8f9fa; border-bottom: 1px solid #000;">
                <tr>
                    <th style="border: 1px solid #000; padding: 8px; font-weight: bold;">Mutabakat</th>
                    <th style="border: 1px solid #000; padding: 8px; font-weight: bold;">Dönem</th>
                    <th style="border: 1px solid #000; padding: 8px; font-weight: bold;">Belge Sayısı</th>
                    <th style="border: 1px solid #000; padding: 8px; font-weight: bold;">Toplam Tutar</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 8px;">${t(reconciliation.type)}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${reconciliation.period}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${invoices.length}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${formatCurrency(reconciliation.amount, reconciliation.currency)}</td>
                </tr>
            </tbody>
        </table>

        <h3 style="margin-top: 25px; font-size: 12pt; font-weight: bold;">Notlar</h3>
        <div style="border: 1px solid #ccc; min-height: 60px; padding: 5px; font-size: 10pt; white-space: pre-wrap;">${reconciliation.notes || ''}</div>
        
        <div style="flex-grow: 1;"></div> <!-- Pushes content to bottom -->

        <table style="width: 100%; margin-top: 80px; text-align: center; font-size: 10pt;">
            <tr>
                <td style="width: 50%; padding-top: 20px; border-top: 1px solid #000;">Kaşe / İmza</td>
                <td style="width: 50%; padding-top: 20px; border-top: 1px solid #000;">Kaşe / İmza</td>
            </tr>
        </table>
        
        <div style="text-align: center; font-size: 9pt; color: #888; margin-top: 30px;">
            Bu mutabakat mektubu e-crm üzerinden oluşturulmuştur.
        </div>
    </div>
    `;
};

const InfoRow = (label: string, value: string) => `
    <tr>
        <td style="padding: 2px 0; font-weight: normal; width: 100px;">${label}</td>
        <td style="padding: 2px 0; font-weight: normal; width: 10px;">:</td>
        <td style="padding: 2px 0; font-weight: normal;">${value || ''}</td>
    </tr>
`;

export const getInterviewHtml = (interview: Interview, customer: Customer | undefined, t: (key: string) => string): string => {
    const SEKTOR_OPTIONS = [
        "Ahşap Profil", "PVC & Alüminyum Pencere", "Folyo-Kenar Bandı-Bant",
        "Kasa-Pervaz-Kapı", "Panel", "Mobilya", "Diğer"
    ];
    
    const gridBg = `background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px); background-size: 20px 20px;`;

    return `
    <div style="font-family: Arial, sans-serif; width: 210mm; min-height: 297mm; padding: 10mm; border: 2px solid #334155; box-sizing: border-box; font-size: 10pt;">
      <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #334155;">
        <tr>
          <td style="width: 65%; vertical-align: middle;">
            <img src="${ASSETS.BWORKS_LOGO_BASE64}" style="height: 30px; display: inline-block; vertical-align: middle;" alt="BWorks Logo" />
            <span style="font-size: 24pt; font-weight: bold; vertical-align: middle; margin-left: 10px; color: #334155;">GÖRÜŞME FORMU</span>
          </td>
          <td style="width: 35%; text-align: right; vertical-align: top;">
            <p style="margin: 2px 0;"><strong>TARİH:</strong> ${formatDate(interview.formTarihi)}</p>
            <p style="margin: 2px 0;"><strong>FUAR:</strong> ${interview.fuar || ''}</p>
          </td>
        </tr>
      </table>

      <table style="width: 100%; margin-top: 5mm; border-spacing: 0; border-collapse: collapse;">
        <tr>
          <td style="width: 35%; vertical-align: top; border-right: 2px solid #334155; padding-right: 10px;">
            <div style="border: 1px solid #666; padding: 10px; margin-bottom: 5mm;">
              <h3 style="text-align: center; margin: 0 0 10px 0; font-weight: bold;">SEKTÖR</h3>
              ${SEKTOR_OPTIONS.map(opt => `
                <div style="margin-bottom: 5px;">
                  <span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #000; text-align: center; line-height: 16px; vertical-align: middle;">${interview.sektor.includes(opt) ? '&#10003;' : '&nbsp;'}</span>
                  <span style="vertical-align: middle; margin-left: 5px;">${opt}</span>
                </div>
              `).join('')}
            </div>
            <div style="space-y-1;">
              <div style="margin-bottom: 5px;"><span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #000; text-align: center; line-height: 16px; vertical-align: middle;">${interview.aksiyonlar.katalogGonderilecek ? '&#10003;' : '&nbsp;'}</span><span style="vertical-align: middle; margin-left: 5px;">Katalog gönderilecek</span></div>
              <div style="margin-bottom: 5px;"><span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #000; text-align: center; line-height: 16px; vertical-align: middle;">${interview.aksiyonlar.teklifGonderilecek ? '&#10003;' : '&nbsp;'}</span><span style="vertical-align: middle; margin-left: 5px;">Teklif gönderilecek</span></div>
              <div style="margin-bottom: 5px;"><span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #000; text-align: center; line-height: 16px; vertical-align: middle;">${interview.aksiyonlar.ziyaretEdilecek ? '&#10003;' : '&nbsp;'}</span><span style="vertical-align: middle; margin-left: 5px;">Ziyaret edilecek</span></div>
            </div>
          </td>
          <td style="width: 65%; vertical-align: top; padding-left: 10px;">
            <div style="border: 1px solid #666; padding: 10px; margin-bottom: 5mm;">
              <h3 style="margin: 0 0 10px 0; font-weight: bold;">ZİYARETÇİ</h3>
              <p><strong>Firma Adı:</strong> ${interview.ziyaretci.firmaAdi}</p>
              <p><strong>Ad Soyad:</strong> ${interview.ziyaretci.adSoyad}</p>
              <p><strong>Bölümü:</strong> ${interview.ziyaretci.bolumu}</p>
              <p><strong>Telefon:</strong> ${interview.ziyaretci.telefon}</p>
              <p><strong>Adres:</strong> ${interview.ziyaretci.adres}</p>
              <p><strong>E-mail:</strong> ${interview.ziyaretci.email}</p>
              <p><strong>Web:</strong> ${interview.ziyaretci.web}</p>
            </div>
            <div style="border: 1px solid #666; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #000; vertical-align: middle;">${interview.aksiyonlar.bizZiyaretEdecek.tarih ? '&#10003;' : '&nbsp;'}</span>
                <span style="vertical-align: middle; margin-left: 5px;">Bizi ziyaret edecek</span>
                <span style="margin-left: 10px;"><strong>Ad Soyad:</strong> ${interview.aksiyonlar.bizZiyaretEdecek.adSoyad}</span>
              </div>
              <span><strong>TARİH:</strong> ${interview.aksiyonlar.bizZiyaretEdecek.tarih ? formatDate(interview.aksiyonlar.bizZiyaretEdecek.tarih) : '____ / ____ / 20__'}</span>
            </div>
          </td>
        </tr>
      </table>
      
      <div style="margin-top: 5mm; border: 1px solid #000; height: 100mm; ${gridBg}; padding: 5px; white-space: pre-wrap; overflow-wrap: break-word;">${interview.notlar}</div>
      
      <p style="margin-top: 5mm;"><strong>GÖRÜŞMEYİ YAPAN KİŞİ:</strong> ${interview.gorusmeyiYapan}</p>
      <p><strong>NOT:</strong> ${''}</p>
    </div>
    `;
};

export const downloadReconciliationAsPdf = (reconciliation: Reconciliation, customer: Customer, invoices: (IncomingInvoice | OutgoingInvoice)[], t: (key: string) => string) => {
    const html = getReconciliationHtml(reconciliation, customer, invoices, t);
    return downloadPdf(html, `Mutabakat_${customer.name}_${reconciliation.period}.pdf`);
};

export const downloadInterviewAsPdf = (interview: Interview, customer: Customer | undefined, t: (key: string) => string) => {
    const html = getInterviewHtml(interview, customer, t);
    return downloadPdf(html, `Gorusme_${customer?.name}_${interview.formTarihi}.pdf`);
};