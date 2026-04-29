// ─── INVOICE & GST ───────────────────────────────────

export interface InvoiceItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerGSTIN?: string;
  items: InvoiceItem[];
  subTotal: number;
  totalGST: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  paymentMethod: string;
  isInterState: boolean;
  status: "paid" | "pending" | "cancelled";
}

// ─── KHATA BOOK ──────────────────────────────────────

export interface KhataEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  type: "credit" | "payment";
  amount: number;
  description: string;
  date: string;
  invoiceId?: string;
  balanceAfter: number;
}

export interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  totalOutstanding: number;
  lastTransaction: string;
  entries: KhataEntry[];
}

// ─── WARRANTY ────────────────────────────────────────

export interface WarrantyRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  category: string;
  serialNumber?: string;
  purchaseDate: string;
  warrantyMonths: number;
  warrantyExpiryDate: string;
  invoiceId?: string;
  status: "active" | "expiring_soon" | "expired";
}

// ─── SUPPLIER ────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  categories: string[];
  paymentTerms: string;
  totalPurchased: number;
  outstandingPayment: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalAmount: number;
  status: "ordered" | "received" | "partial" | "cancelled";
  paymentStatus: "paid" | "pending" | "partial";
}

// ─── EXPENSE & P&L ───────────────────────────────────

export interface Expense {
  id: string;
  category: "rent" | "electricity" | "salary" | "packaging" | "marketing" | "misc";
  description: string;
  amount: number;
  date: string;
  month: string;
}

export interface MonthlyPL {
  month: string;
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  netMargin: number;
}
