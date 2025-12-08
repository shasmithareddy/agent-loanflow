import jsPDF from 'jspdf';
import { formatCurrency } from './emiCalculator';
import { LoanDetails, VerificationDetails, LoanPlan } from '@/store/loanStore';

interface SanctionLetterData {
  customerName: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  approvalDate: Date;
}

export function generateSanctionLetter(data: SanctionLetterData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(0, 87, 153); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TATA CAPITAL', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Personal Loan Division', pageWidth / 2, 30, { align: 'center' });

  // Sanction Letter Title
  doc.setTextColor(0, 87, 153);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LOAN SANCTION LETTER', pageWidth / 2, 55, { align: 'center' });

  // Reference and Date
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const refNumber = `REF: TC/PL/${Date.now().toString().slice(-8)}`;
  const dateStr = data.approvalDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(refNumber, 20, 70);
  doc.text(`Date: ${dateStr}`, pageWidth - 20, 70, { align: 'right' });

  // Separator line
  doc.setDrawColor(215, 223, 35);
  doc.setLineWidth(2);
  doc.line(20, 75, pageWidth - 20, 75);

  // Dear Customer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Dear ${data.customerName},`, 20, 90);

  // Body text
  const bodyText = `We are pleased to inform you that your application for a Personal Loan has been approved. 
Please find below the details of your sanctioned loan:`;
  doc.text(bodyText, 20, 100, { maxWidth: pageWidth - 40 });

  // Loan Details Table
  const tableStartY = 125;
  const rowHeight = 12;
  const col1X = 20;
  const col2X = 110;

  // Table header
  doc.setFillColor(240, 244, 248);
  doc.rect(20, tableStartY - 5, pageWidth - 40, rowHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Loan Parameters', col1X + 5, tableStartY + 3);
  doc.text('Details', col2X + 5, tableStartY + 3);

  // Table rows
  const tableData = [
    ['Sanctioned Loan Amount', formatCurrency(data.loanAmount)],
    ['Rate of Interest (p.a.)', `${data.interestRate}%`],
    ['Loan Tenure', `${data.tenure} Months`],
    ['Monthly EMI', formatCurrency(data.emi)],
    ['Processing Fee', 'Nil'],
    ['Prepayment Charges', 'Nil after 6 months'],
  ];

  doc.setFont('helvetica', 'normal');
  tableData.forEach((row, index) => {
    const y = tableStartY + (index + 1) * rowHeight + 3;
    
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, y - 8, pageWidth - 40, rowHeight, 'F');
    }

    doc.setTextColor(60, 60, 60);
    doc.text(row[0], col1X + 5, y);
    doc.setTextColor(0, 87, 153);
    doc.setFont('helvetica', 'bold');
    doc.text(row[1], col2X + 5, y);
    doc.setFont('helvetica', 'normal');
  });

  // Table border
  doc.setDrawColor(200, 200, 200);
  doc.rect(20, tableStartY - 5, pageWidth - 40, (tableData.length + 1) * rowHeight);

  // Terms and Conditions
  const termsY = tableStartY + (tableData.length + 2) * rowHeight + 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Terms and Conditions:', 20, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const terms = [
    '1. This sanction letter is valid for 30 days from the date of issue.',
    '2. Loan disbursement is subject to completion of documentation and verification.',
    '3. The interest rate is subject to change based on market conditions.',
    '4. EMI will be auto-debited from your registered bank account.',
    '5. Prepayment is allowed after 6 months without any charges.',
  ];
  terms.forEach((term, index) => {
    doc.text(term, 20, termsY + 10 + index * 6, { maxWidth: pageWidth - 40 });
  });

  // Signature section
  const sigY = termsY + 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('For Tata Capital Financial Services Ltd.', pageWidth - 70, sigY);
  doc.text('Authorized Signatory', pageWidth - 70, sigY + 20);

  // Footer
  doc.setFillColor(0, 87, 153);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Tata Capital Financial Services Ltd. | CIN: U67100MH2010PLC210201', pageWidth / 2, 287, { align: 'center' });
  doc.text('Registered Office: 11th Floor, Tower A, Peninsula Business Park, Mumbai - 400013', pageWidth / 2, 293, { align: 'center' });

  // Save the PDF
  doc.save(`Sanction_Letter_${data.customerName.replace(/\s+/g, '_')}.pdf`);
}
