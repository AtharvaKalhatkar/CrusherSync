import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { type Customer, type Invoice, type InvoiceItem } from '../db/db';



const PRIMARY_COLOR: [number, number, number] = [212, 175, 55]; // Gold
const TEXT_DARK: [number, number, number] = [20, 20, 20];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];
const BACKGROUND_LIGHT: [number, number, number] = [250, 250, 250];

const saveAndSharePDF = async (pdf: jsPDF, fileName: string) => {
  try {
    const base64Data = pdf.output('datauristring').split(',')[1];
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });
    
    // Inject Custom Modal
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';
    
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '24px';
    modal.style.borderRadius = '12px';
    modal.style.width = '100%';
    modal.style.maxWidth = '320px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    
    modal.innerHTML = `
      <div style="width: 48px; height: 48px; background-color: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <h3 style="margin: 0 0 8px 0; color: #111827; font-family: Inter, sans-serif; font-size: 1.25rem;">Generated!</h3>
      <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 24px 0; font-family: Inter, sans-serif;">${fileName} is ready.</p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="btn-share" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; border: none; border-radius: 8px;">Share PDF</button>
        <button id="btn-open" class="btn btn-success" style="width: 100%; padding: 12px; font-size: 1rem; border: 1px solid #16a34a; border-radius: 8px;">Open as PDF</button>
        <button id="btn-close" class="btn" style="width: 100%; padding: 12px; font-size: 1rem; border: 1px solid #e5e7eb; color: #374151; background: transparent; border-radius: 8px;">Close</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('btn-share')!.onclick = async () => {
      document.body.removeChild(overlay);
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          await Share.share({
            title: fileName,
            text: 'Sharing Document',
            url: savedFile.uri,
            dialogTitle: 'Share PDF'
          });
        } else {
          // Web Sharing implementation
          const blob = pdf.output('blob');
          const file = new File([blob], fileName, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: fileName,
              text: 'Sharing Document'
            });
          } else {
            alert('File sharing is not fully supported in this browser. The file will be downloaded instead.');
            pdf.save(fileName);
          }
        }
      } catch (err) {
        console.error('Sharing failed', err);
        pdf.save(fileName);
      }
    };
    
    document.getElementById('btn-open')!.onclick = () => {
      document.body.removeChild(overlay);
      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl.toString(), '_blank');
    };
    
    document.getElementById('btn-close')!.onclick = () => {
      document.body.removeChild(overlay);
    };

  } catch (error) {
    console.error('Error saving/sharing PDF', error);
    pdf.save(fileName);
  }
};

export const generateInvoicePDF = async (invoice: Invoice, items: InvoiceItem[], customer: Customer, receivedAmount: number = 0) => {
  const doc = new jsPDF();
  
  const { db } = await import('../db/db');
  const settings = await db.settings.get(1) || {
    businessName: 'Shri kalbhairavnath',
    businessSubtitle: 'ENTERPRISES',
    phone: '+91 9689520324',
    email: 'Kolekarnagesh85@gmail.com',
    gstNo: '',
    logoBase64: '',
    signatureBase64: ''
  };

  // Minimalist Header Bar
  doc.setFillColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Gold Accent Line
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 40, 210, 2, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(settings.businessName, 14, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(settings.businessSubtitle, 15, 26);
  
  // Contact info right aligned
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.text(settings.phone, 196, 20, { align: 'right' });
  doc.text(settings.email, 196, 26, { align: 'right' });
  if (settings.gstNo) {
    doc.text(`GST: ${settings.gstNo}`, 196, 32, { align: 'right' });
  }

  if (settings.logoBase64) {
    try {
      doc.addImage(settings.logoBase64, 'PNG', 100, 5, 30, 30);
    } catch(e) {
      try { doc.addImage(settings.logoBase64, 'JPEG', 100, 5, 30, 30); } catch(err) {}
    }
  }

  // Document Title
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text('INVOICE', 14, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`Invoice Number`, 14, 75);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`#${invoice.invoiceNo.toString().padStart(5, '0')}`, 14, 80);

  const dateStr = new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`Issue Date`, 70, 75);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(dateStr, 70, 80);

  // Client Details
  doc.setFillColor(BACKGROUND_LIGHT[0], BACKGROUND_LIGHT[1], BACKGROUND_LIGHT[2]);
  doc.rect(120, 50, 76, 35, 'F');
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('BILLED TO', 125, 60);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(customer.name.toUpperCase(), 125, 68);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  if (customer.phone) doc.text(customer.phone, 125, 75);

  // Table
  const tableData = items.map((item, index) => [
    (index + 1).toString().padStart(2, '0'),
    item.productName,
    item.quantity.toString() + ' ' + item.unit,
    `Rs ${item.price.toFixed(2)}`,
    `Rs ${item.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['NO.', 'DESCRIPTION', 'QTY', 'RATE', 'AMOUNT']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: BACKGROUND_LIGHT, 
      textColor: TEXT_DARK,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 6
    },
    bodyStyles: { 
      textColor: TEXT_DARK,
      fontSize: 10,
      cellPadding: 6
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 70 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    },
    didDrawPage: (data) => {
      // Draw top and bottom border for table header
      doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.setLineWidth(0.5);
      doc.line(14, data.cursor!.y, 196, data.cursor!.y);
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Total Section
  doc.setFillColor(BACKGROUND_LIGHT[0], BACKGROUND_LIGHT[1], BACKGROUND_LIGHT[2]);
  doc.rect(120, finalY + 10, 76, 25, 'F');
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text('SUB TOTAL', 125, finalY + 16);
  doc.text(`Rs ${invoice.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 190, finalY + 16, { align: 'right' });
  
  doc.text('RECEIVED', 125, finalY + 22);
  doc.text(`Rs ${receivedAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 190, finalY + 22, { align: 'right' });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('BALANCE', 125, finalY + 30);
  doc.text(`Rs ${Math.max(0, invoice.totalAmount - receivedAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 190, finalY + 30, { align: 'right' });

  // Footer / Signature
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('TERMS & CONDITIONS', 14, finalY + 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text('Payment is due upon receipt.', 14, finalY + 25);
  doc.text('Thank you for doing business with us.', 14, finalY + 30);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('AUTHORIZED SIGNATORY', 14, finalY + 55);
  doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  
  if (settings.signatureBase64) {
    try {
      doc.addImage(settings.signatureBase64, 'PNG', 14, finalY + 35, 40, 15);
    } catch(e) {
      try { doc.addImage(settings.signatureBase64, 'JPEG', 14, finalY + 35, 40, 15); } catch(err) {}
    }
  } else {
    doc.line(14, finalY + 50, 70, finalY + 50); // Signature line
  }

  await saveAndSharePDF(doc, `Invoice_${invoice.invoiceNo}.pdf`);
};

export const generateStatementPDF = async (
  customer: Customer, 
  transactions: any[], 
  netBalance: number,
  startDate: Date,
  endDate: Date,
  openingBalance: number = 0
) => {
  const doc = new jsPDF();
  
  const { db } = await import('../db/db');
  const settings = await db.settings.get(1) || {
    businessName: 'Shri kalbhairavnath',
    businessSubtitle: 'ENTERPRISES',
    phone: '+91 9689520324',
    email: 'Kolekarnagesh85@gmail.com',
    gstNo: '',
    logoBase64: '',
    signatureBase64: ''
  };

  // Minimalist Header Bar
  doc.setFillColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 40, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(settings.businessName, 14, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(settings.businessSubtitle, 15, 26);
  
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.text(settings.phone, 196, 20, { align: 'right' });
  doc.text(settings.email, 196, 26, { align: 'right' });
  if (settings.gstNo) {
    doc.text(`GST: ${settings.gstNo}`, 196, 32, { align: 'right' });
  }

  if (settings.logoBase64) {
    try {
      doc.addImage(settings.logoBase64, 'PNG', 100, 5, 30, 30);
    } catch(e) {
      try { doc.addImage(settings.logoBase64, 'JPEG', 100, 5, 30, 30); } catch(err) {}
    }
  }

  // Title
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text('ACCOUNT STATEMENT', 14, 60);

  // Summary Box
  doc.setFillColor(BACKGROUND_LIGHT[0], BACKGROUND_LIGHT[1], BACKGROUND_LIGHT[2]);
  doc.rect(14, 70, 182, 35, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('PARTY DETAILS', 20, 80);
  
  doc.setFontSize(12);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(customer.name.toUpperCase(), 20, 88);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(customer.phone || '-', 20, 95);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('OPENING', 110, 80);
  doc.setFontSize(14);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`Rs ${openingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 110, 90);

  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('NET BALANCE', 150, 80);
  doc.setFontSize(14);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`Rs ${Math.abs(netBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 150, 90);
  
  const dateRange = `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(dateRange, 150, 96);

  // Table
  const tableData = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
    t.type.toUpperCase(),
    t.ref,
    !t.isPayment ? `Rs ${t.amount.toFixed(2)}` : '-',
    t.isPayment ? `Rs ${t.amount.toFixed(2)}` : '-',
    `Rs ${t.runningBalance.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['DATE', 'TYPE', 'REF', 'DEBIT', 'CREDIT', 'BALANCE']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      textColor: TEXT_DARK,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4
    },
    bodyStyles: { 
      textColor: TEXT_DARK,
      fontSize: 8,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 35, halign: 'right' }
    },
    didDrawPage: (data) => {
      doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.setLineWidth(0.5);
      doc.line(14, data.cursor!.y, 196, data.cursor!.y);
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 200;
  
  // Footer Box
  doc.setFillColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.rect(14, finalY + 15, 182, 16, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('CLOSING BALANCE', 20, finalY + 25);
  
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(`Rs ${Math.abs(netBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 190, finalY + 25, { align: 'right' });

  await saveAndSharePDF(doc, `Statement_${customer.name.replace(/\s+/g, '_')}.pdf`);
};
