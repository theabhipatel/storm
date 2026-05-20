import PDFDocument from "pdfkit";

export interface InvoiceAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface InvoiceLineItem {
  name: string;
  sku: string;
  qty: number;
  unitPricePaise: number;
  lineTotalPaise: number;
}

export interface InvoiceInput {
  orderId: string;
  paidAtIso: string;
  customerName: string;
  customerEmail: string;
  address: InvoiceAddress;
  items: InvoiceLineItem[];
  subtotalPaise: number;
  shippingFeePaise: number;
  totalPaise: number;
  currency: "INR";
  paymentMethod: string;
  brand: {
    companyName: string;
    tagline: string;
  };
}

export async function generateInvoicePdf(input: InvoiceInput): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawHeader(doc, input);
    drawMeta(doc, input);
    drawAddress(doc, input);
    drawItemsTable(doc, input);
    drawTotals(doc, input);
    drawFooter(doc, input);

    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument, input: InvoiceInput): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(input.brand.companyName, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#555")
    .text(input.brand.tagline, { align: "left" });
  doc.moveDown();
  doc.fillColor("#000").font("Helvetica-Bold").fontSize(16).text("Tax Invoice", { align: "right" });
  doc.moveDown();
}

function drawMeta(doc: PDFKit.PDFDocument, input: InvoiceInput): void {
  doc.font("Helvetica").fontSize(10);
  const ist = formatIst(input.paidAtIso);
  doc.text(`Order ID: ${input.orderId}`);
  doc.text(`Date (IST): ${ist}`);
  doc.text(`Payment Method: ${input.paymentMethod}`);
  doc.moveDown();
}

function drawAddress(doc: PDFKit.PDFDocument, input: InvoiceInput): void {
  doc.font("Helvetica-Bold").fontSize(11).text("Bill To:");
  doc.font("Helvetica").fontSize(10);
  doc.text(input.customerName);
  if (input.customerEmail) doc.text(input.customerEmail);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(11).text("Ship To:");
  doc.font("Helvetica").fontSize(10);
  doc.text(input.address.fullName);
  doc.text(input.address.line1);
  if (input.address.line2) doc.text(input.address.line2);
  doc.text(`${input.address.city}, ${input.address.state} ${input.address.pincode}`);
  doc.text(`Phone: ${input.address.phone}`);
  doc.moveDown();
}

function drawItemsTable(doc: PDFKit.PDFDocument, input: InvoiceInput): void {
  const startY = doc.y;
  const cols = {
    item: 48,
    sku: 280,
    qty: 360,
    price: 410,
    total: 490,
  };

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Item", cols.item, startY);
  doc.text("SKU", cols.sku, startY);
  doc.text("Qty", cols.qty, startY, { width: 40, align: "right" });
  doc.text("Unit ₹", cols.price, startY, { width: 60, align: "right" });
  doc.text("Total ₹", cols.total, startY, { width: 60, align: "right" });

  doc
    .moveTo(48, startY + 16)
    .lineTo(550, startY + 16)
    .stroke();

  doc.font("Helvetica").fontSize(10);
  let y = startY + 20;
  for (const item of input.items) {
    doc.text(truncate(item.name, 38), cols.item, y, { width: 220 });
    doc.text(item.sku, cols.sku, y, { width: 70 });
    doc.text(String(item.qty), cols.qty, y, { width: 40, align: "right" });
    doc.text(formatRupees(item.unitPricePaise), cols.price, y, { width: 60, align: "right" });
    doc.text(formatRupees(item.lineTotalPaise), cols.total, y, { width: 60, align: "right" });
    y += 20;
  }
  doc.y = y + 6;
  doc.moveTo(48, doc.y).lineTo(550, doc.y).stroke();
  doc.y += 8;
}

function drawTotals(doc: PDFKit.PDFDocument, input: InvoiceInput): void {
  doc.font("Helvetica").fontSize(10);
  const rightX = 410;
  doc.text("Subtotal", rightX, doc.y, { width: 80, align: "right" });
  doc.text(`₹${formatRupees(input.subtotalPaise)}`, 490, doc.y, { width: 60, align: "right" });
  doc.moveDown(0.5);
  doc.text("Shipping", rightX, doc.y, { width: 80, align: "right" });
  doc.text(
    input.shippingFeePaise === 0 ? "FREE" : `₹${formatRupees(input.shippingFeePaise)}`,
    490,
    doc.y,
    { width: 60, align: "right" },
  );
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Total", rightX, doc.y, { width: 80, align: "right" });
  doc.text(`₹${formatRupees(input.totalPaise)}`, 490, doc.y, { width: 60, align: "right" });
  doc.moveDown(1.5);
}

function drawFooter(doc: PDFKit.PDFDocument, input: InvoiceInput): void {
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("#888")
    .text(
      `Thank you for shopping with ${input.brand.companyName}. This is a computer-generated invoice.`,
      48,
      doc.page.height - 60,
      { align: "center", width: doc.page.width - 96 },
    );
}

function formatIst(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatRupees(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
