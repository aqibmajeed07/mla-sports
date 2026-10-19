import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to convert number to Indian words
function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const rounded = Math.round(Number(num) || 0);
  if (rounded === 0) return 'Zero Rupees Only';
  return (inWords(rounded).trim() + ' Rupees Only');
}

/**
 * Generate and download a crisp, professional vector PDF Tax Invoice for MLA Sports
 */
export const generateOrderInvoicePDF = (order) => {
  if (!order) return;

  // Invoice is strictly available only after payment verification
  const isVerified = order.payment_status === 'verified' || 
    ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status);

  if (!isVerified) {
    throw new Error('Official Tax Invoice is generated only after payment has been verified by MLA Sports.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const invoiceNo = `INV-MLA-${order.id.slice(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const address = order.addresses || {};
  const customerName = address.full_name || order.profiles?.full_name || 'Valued Customer';
  const customerPhone = address.phone || order.profiles?.phone || 'Not provided';
  const customerEmail = order.profiles?.email || 'Registered customer';
  const fullAddress = [
    address.address1 || address.address_line1,
    address.address2 || address.address_line2,
    address.landmark,
    address.city,
    address.district,
    address.state ? `${address.state} - ${address.pincode || address.postal_code || ''}` : (address.pincode ? `PIN: ${address.pincode}` : ''),
  ].filter(Boolean).join(', ') || 'Standard Delivery Address';

  // --- Top Decorative Accent Header ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(220, 38, 38); // red-600 top stripe
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MLA SPORTS', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('HANDCRAFTED KASHMIR WILLOW CRICKET BATS & SPORTING GOODS', margin, 20);

  // Invoice Badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth - margin, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text(`INVOICE #: ${invoiceNo}`, pageWidth - margin, 19, { align: 'right' });
  doc.text(`DATE: ${orderDate}`, pageWidth - margin, 24, { align: 'right' });

  // --- Meta Info Strip below header ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, 34, pageWidth - (margin * 2), 14, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT MODE:', margin + 4, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.payment_method || 'UPI / QR Code'}`, margin + 35, 40);

  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT STATUS:', margin + 75, 40);
  doc.setFont('helvetica', 'bold');
  const isPaid = order.payment_status === 'verified' || order.status === 'Confirmed' || order.status === 'Delivered';
  doc.setTextColor(isPaid ? 22 : 217, isPaid ? 101 : 119, isPaid ? 52 : 6); // emerald or amber
  doc.text(isPaid ? 'PAID & VERIFIED' : 'SUBMITTED FOR VERIFICATION', margin + 110, 40);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('UTR / TXN ID:', margin + 4, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.payment_id || 'Confirmed in Bank'}`, margin + 35, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('EXPECTED DELIVERY:', margin + 75, 45);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(`${order.expected_delivery_date || 'Within 4-7 Business Days'}`, margin + 115, 45);

  // --- Two Columns: Seller (Left) and Buyer (Right) ---
  const boxTop = 53;
  const boxWidth = (pageWidth - (margin * 2) - 6) / 2;
  const boxHeight = 44;

  // Box 1: Seller Details
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, boxTop, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, boxTop, boxWidth, 8, 2, 2, 'F');
  doc.rect(margin, boxTop + 4, boxWidth, 4, 'F'); // square bottom of header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SOLD & DISPATCHED BY (SELLER)', margin + 4, boxTop + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MLA SPORTS KASHMIR', margin + 4, boxTop + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Main Market, Mirgund, Budgam', margin + 4, boxTop + 17.5);
  doc.text('Jammu & Kashmir - 193401, India', margin + 4, boxTop + 22);
  doc.text('Store Helpline: +91 7889515654', margin + 4, boxTop + 26.5);
  doc.text('Inquiry Email: mlasportsbudgam@gmail.com', margin + 4, boxTop + 31);
  doc.text('MSME Reg: JK02D0014829 • Kashmir Willow Guild', margin + 4, boxTop + 35.5);
  doc.text('GSTIN: 01AABCM5623R1Z4 (Sporting Goods)', margin + 4, boxTop + 40);

  // Box 2: Buyer / Ship To Details (CRITICAL: Explicit white background & clear text)
  const rightBoxLeft = margin + boxWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightBoxLeft, boxTop, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightBoxLeft, boxTop, boxWidth, 8, 2, 2, 'F');
  doc.rect(rightBoxLeft, boxTop + 4, boxWidth, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED & DELIVERED TO (BUYER)', rightBoxLeft + 4, boxTop + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customerName.toUpperCase(), rightBoxLeft + 4, boxTop + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Wrap address cleanly without overlapping
  const splitAddress = doc.splitTextToSize(fullAddress, boxWidth - 8);
  doc.text(splitAddress, rightBoxLeft + 4, boxTop + 17.5);

  const phoneY = boxTop + 17.5 + (splitAddress.length * 4.2);
  doc.text(`Phone: ${customerPhone}`, rightBoxLeft + 4, Math.min(phoneY, boxTop + 31));
  doc.text(`Email: ${customerEmail}`, rightBoxLeft + 4, Math.min(phoneY + 4.5, boxTop + 35.5));
  if (order.courier_name || order.tracking_number) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`Courier: ${order.courier_name || 'Express'} (AWB: ${order.tracking_number || 'Pending'})`, rightBoxLeft + 4, boxTop + 40);
  }

  // --- Itemized Products Table ---
  const items = (order.order_items || []).map((item, index) => {
    const unitPrice = Number(item.price || item.products?.price || 0);
    const qty = Number(item.quantity || 1);
    const lineTotal = unitPrice * qty;
    const name = item.product_name || item.products?.name || 'Handcrafted Cricket Bat';
    const specs = item.products?.specs?.willow || 'Selected Grade-1 Kashmir Willow, Monster Power Edges';

    return [
      String(index + 1),
      `${name}\n(${specs})`,
      '9506.99', // HSN code for cricket bats & athletic equipment
      String(qty),
      `Rs. ${unitPrice.toLocaleString('en-IN')}`,
      `Rs. ${lineTotal.toLocaleString('en-IN')}`,
    ];
  });

  autoTable(doc, {
    startY: 102,
    margin: { left: margin, right: margin },
    head: [['#', 'ITEM DESCRIPTION & WILLOW SPECIFICATIONS', 'HSN/SAC', 'QTY', 'UNIT RATE', 'NET AMOUNT']],
    body: items,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 85, fontSize: 8 },
      2: { cellWidth: 20, halign: 'center', fontSize: 7.5, textColor: [100, 116, 139] },
      3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 29, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  const finalY = doc.lastAutoTable.finalY + 4;

  // --- Calculations Box ---
  const calcBoxWidth = 85;
  const calcBoxLeft = pageWidth - margin - calcBoxWidth;
  const totalAmount = Number(order.total_amount || 0);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.rect(calcBoxLeft, finalY, calcBoxWidth, 38, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', calcBoxLeft + 4, finalY + 7);
  doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, finalY + 7, { align: 'right' });

  doc.text('Precision Bat Machine Knocking:', calcBoxLeft + 4, finalY + 13);
  doc.setTextColor(22, 101, 52); // green
  doc.text('COMPLIMENTARY', pageWidth - margin - 4, finalY + 13, { align: 'right' });

  doc.setTextColor(71, 85, 105);
  doc.text('All-India Express Insured Shipping:', calcBoxLeft + 4, finalY + 19);
  doc.setTextColor(22, 101, 52);
  doc.text('FREE', pageWidth - margin - 4, finalY + 19, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(calcBoxLeft, finalY + 23, pageWidth - margin, finalY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text('GRAND TOTAL:', calcBoxLeft + 4, finalY + 31);
  doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, finalY + 31, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('(Inclusive of all applicable trade taxes & packaging)', calcBoxLeft + 4, finalY + 35);

  // Amount in words box on left
  const wordsBoxWidth = pageWidth - (margin * 2) - calcBoxWidth - 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, finalY, wordsBoxWidth, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('AMOUNT CHARGEABLE (IN WORDS):', margin + 4, finalY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  const wordsText = doc.splitTextToSize(numberToWords(totalAmount), wordsBoxWidth - 8);
  doc.text(wordsText, margin + 4, finalY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Kashmir Willow Authenticity Guarantee:', margin + 4, finalY + 26);
  doc.text('100% genuine Salix Alba willow cured in traditional valley sheds.', margin + 4, finalY + 30);
  doc.text('Individually balanced by master bat-makers in Budgam, Kashmir.', margin + 4, finalY + 34);

  // --- Terms & Signatory Section ---
  const termsY = finalY + 44;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & CONDITIONS:', margin, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('1. All bat warranties cover handle joints and manufacturing timber structural integrity for 90 days.', margin, termsY + 4.5);
  doc.text('2. Please apply raw linseed oil and allow adequate net practice before intense tournament hard leather play.', margin, termsY + 8.5);
  doc.text('3. For any order, dispatch, or store queries, contact MLA Sports directly at +91 7889515654 or email mlasportsbudgam@gmail.com.', margin, termsY + 12.5);

  // Authorized Signatory Stamp on right
  const sigX = pageWidth - margin - 55;
  doc.setDrawColor(203, 213, 225);
  doc.line(sigX, termsY + 16, sigX + 55, termsY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('FOR MLA SPORTS', sigX + 27.5, termsY + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Signatory', sigX + 27.5, termsY + 20, { align: 'center' });
  doc.text('(Syed Manzoor Mosvi, Proprietor)', sigX + 27.5, termsY + 23.5, { align: 'center' });

  // Bottom Footer Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('MLA Sports Handcrafted Kashmir Bats • Main Market, Mirgund, Budgam, J&K • Store Helpline: +91 7889515654 • mlasports.vercel.app', pageWidth / 2, pageHeight - 3, { align: 'center' });

  // Save the generated PDF
  doc.save(`${invoiceNo}.pdf`);
  return doc;
};
