import { useState, useMemo } from "react";
import { Plus, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockInvoices, inventoryItems } from "@/lib/mock-data";
import type { Invoice, InvoiceItem } from "@/lib/advisorTypes";

// TODO: POST /api/invoices → save to DB
// TODO: GET /api/invoices → load from DB
// TODO: POST /api/invoices/:id/pdf → generate PDF

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function InvoicePanel() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isInterState, setIsInterState] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const subTotal = useMemo(() => lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0), [lineItems]);
  const totalGST = useMemo(() => Math.round(subTotal * 0.18), [subTotal]);
  const grandTotal = useMemo(() => subTotal + totalGST, [subTotal, totalGST]);

  const addLineItem = (productId: string) => {
    const product = inventoryItems.find((p) => p.id === productId);
    if (!product) return;
    const qty = 1;
    const gstAmt = Math.round(product.sellingPrice * qty * 0.18);
    setLineItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.productName,
        category: product.category,
        quantity: qty,
        unitPrice: product.sellingPrice,
        gstRate: 18,
        gstAmount: gstAmt,
        totalAmount: product.sellingPrice * qty + gstAmt,
      },
    ]);
  };

  const removeLineItem = (idx: number) => setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateQty = (idx: number, qty: number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const q = Math.max(1, qty);
        const gst = Math.round(item.unitPrice * q * 0.18);
        return { ...item, quantity: q, gstAmount: gst, totalAmount: item.unitPrice * q + gst };
      })
    );
  };

  const generateInvoice = () => {
    if (!customerName.trim() || !customerPhone.trim() || lineItems.length === 0) {
      toast.error("Fill customer details and add at least one product");
      return;
    }
    const cgst = isInterState ? 0 : Math.round(totalGST / 2);
    const sgst = isInterState ? 0 : Math.round(totalGST / 2);
    const igst = isInterState ? totalGST : 0;
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(4, "0")}`,
      date: new Date().toISOString().split("T")[0],
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: lineItems,
      subTotal, totalGST, cgst, sgst, igst, grandTotal,
      paymentMethod: "Cash",
      isInterState,
      status: "pending",
    };
    setInvoices((prev) => [inv, ...prev]);
    setLineItems([]);
    setCustomerName("");
    setCustomerPhone("");
    toast.success(`Invoice ${inv.invoiceNumber} created!`);
  };

  const statusColor = (s: Invoice["status"]) =>
    s === "paid" ? "bg-green-500/15 text-green-400" : s === "pending" ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400";

  return (
    <div className="space-y-6">
      {/* Create Invoice */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-sm text-foreground">New Invoice</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Customer Name</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name" className="mt-1" /></div>
          <div><Label className="text-xs">Phone</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="98XXXXXXXX" className="mt-1" /></div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isInterState} onCheckedChange={setIsInterState} />
          <Label className="text-xs text-muted-foreground">Inter-State (IGST)</Label>
        </div>

        {/* Add product */}
        <div className="flex gap-2">
          <Select onValueChange={addLineItem}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="+ Add Product" /></SelectTrigger>
            <SelectContent>
              {inventoryItems.slice(0, 15).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.productName} — {formatINR(p.sellingPrice)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {lineItems.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary/60"><tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-center w-16">Qty</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">GST</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 w-8"></th>
              </tr></thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-3 py-2 text-foreground">{item.productName}</td>
                    <td className="px-3 py-2 text-center"><Input type="number" min={1} value={item.quantity} onChange={(e) => updateQty(i, parseInt(e.target.value) || 1)} className="w-14 h-7 text-center text-xs" /></td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{formatINR(item.unitPrice)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{formatINR(item.gstAmount)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatINR(item.totalAmount)}</td>
                    <td className="px-3 py-2 text-center"><button onClick={() => removeLineItem(i)} className="text-destructive text-xs hover:underline">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-end">
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Subtotal: {formatINR(subTotal)}</p>
            {isInterState ? <p>IGST 18%: {formatINR(totalGST)}</p> : <><p>CGST 9%: {formatINR(Math.round(totalGST / 2))}</p><p>SGST 9%: {formatINR(Math.round(totalGST / 2))}</p></>}
            <p className="text-sm font-bold text-foreground">Grand Total: {formatINR(grandTotal)}</p>
          </div>
          <Button onClick={generateInvoice} disabled={lineItems.length === 0} size="sm">Generate Bill</Button>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-sm text-foreground mb-3">Recent Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary/60"><tr>
              <th className="px-3 py-2 text-left">Invoice #</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center">Action</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border/50">
                  <td className="px-3 py-2 font-medium text-foreground">{inv.invoiceNumber}</td>
                  <td className="px-3 py-2 text-muted-foreground">{inv.customerName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{inv.date}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatINR(inv.grandTotal)}</td>
                  <td className="px-3 py-2 text-center"><span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statusColor(inv.status))}>{inv.status}</span></td>
                  <td className="px-3 py-2 text-center">
                    <Dialog>
                      <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setSelectedInvoice(inv)}><Eye className="h-3 w-3" /></Button></DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>GST Invoice</DialogTitle></DialogHeader>
                        <div className="text-center mb-4">
                          <h2 className="font-bold text-lg">TECHSTOCK AI</h2>
                          <p className="text-xs text-muted-foreground">GST Invoice</p>
                        </div>
                        <div className="text-xs space-y-1 mb-3">
                          <p><strong>Invoice:</strong> {inv.invoiceNumber}   <strong>Date:</strong> {inv.date}</p>
                          <p><strong>Customer:</strong> {inv.customerName}   <strong>Ph:</strong> {inv.customerPhone}</p>
                          {inv.customerGSTIN && <p><strong>GSTIN:</strong> {inv.customerGSTIN}</p>}
                        </div>
                        <table className="w-full text-xs border border-border mb-3">
                          <thead className="bg-secondary"><tr><th className="p-1.5 text-left">#</th><th className="p-1.5 text-left">Item</th><th className="p-1.5 text-center">Qty</th><th className="p-1.5 text-right">Rate</th><th className="p-1.5 text-right">GST</th><th className="p-1.5 text-right">Total</th></tr></thead>
                          <tbody>{inv.items.map((it, i) => (<tr key={i} className="border-t border-border/50"><td className="p-1.5">{i + 1}</td><td className="p-1.5">{it.productName}</td><td className="p-1.5 text-center">{it.quantity}</td><td className="p-1.5 text-right">{formatINR(it.unitPrice)}</td><td className="p-1.5 text-right">{formatINR(it.gstAmount)}</td><td className="p-1.5 text-right">{formatINR(it.totalAmount)}</td></tr>))}</tbody>
                        </table>
                        <div className="text-xs text-right space-y-0.5 mb-3">
                          <p>Subtotal: {formatINR(inv.subTotal)}</p>
                          {inv.isInterState ? <p>IGST 18%: {formatINR(inv.igst)}</p> : <><p>CGST 9%: {formatINR(inv.cgst)}</p><p>SGST 9%: {formatINR(inv.sgst)}</p></>}
                          <p className="text-sm font-bold">TOTAL: {formatINR(inv.grandTotal)}</p>
                        </div>
                        <p className="text-center text-xs text-muted-foreground italic">Thank you for your purchase!</p>
                        <Button size="sm" className="w-full mt-2" onClick={() => window.print()}><Printer className="h-3 w-3 mr-2" />Print</Button>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
