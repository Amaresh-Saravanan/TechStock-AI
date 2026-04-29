import { useState, useMemo } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockSuppliers, mockPurchaseOrders } from "@/lib/mock-data";
import type { Supplier, PurchaseOrder } from "@/lib/advisorTypes";

// TODO: GET /api/suppliers → load from DB
// TODO: POST /api/suppliers → add supplier
// TODO: POST /api/purchase-orders → create PO

function formatINR(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

export function SupplierPanel() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [selected, setSelected] = useState<Supplier | null>(suppliers[0] ?? null);
  const [addDialog, setAddDialog] = useState(false);
  const [poDialog, setPoDialog] = useState(false);
  const [supForm, setSupForm] = useState({ name: "", contact: "", phone: "", categories: "", terms: "" });
  const [poForm, setPoForm] = useState({ product: "", qty: "", cost: "" });

  const selectedOrders = useMemo(() => orders.filter((o) => o.supplierId === selected?.id), [orders, selected]);

  const addSupplier = () => {
    const { name, contact, phone, categories, terms } = supForm;
    if (!name || !contact || !phone) { toast.error("Fill required fields"); return; }
    const sup: Supplier = { id: `sup-${Date.now()}`, name, contactPerson: contact, phone, categories: categories.split(",").map((c) => c.trim()).filter(Boolean), paymentTerms: terms || "Cash", totalPurchased: 0, outstandingPayment: 0 };
    setSuppliers((prev) => [...prev, sup]);
    setSupForm({ name: "", contact: "", phone: "", categories: "", terms: "" });
    setAddDialog(false);
    toast.success(`${name} added!`);
  };

  const addPO = () => {
    if (!selected || !poForm.product || !poForm.qty || !poForm.cost) { toast.error("Fill all fields"); return; }
    const qty = parseInt(poForm.qty), cost = parseInt(poForm.cost);
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`, supplierId: selected.id, supplierName: selected.name,
      date: new Date().toISOString().split("T")[0],
      items: [{ productName: poForm.product, quantity: qty, unitCost: cost, totalCost: qty * cost }],
      totalAmount: qty * cost, status: "ordered", paymentStatus: "pending",
    };
    setOrders((prev) => [po, ...prev]);
    setPoForm({ product: "", qty: "", cost: "" });
    setPoDialog(false);
    toast.success("Purchase order created!");
  };

  const poStatusColor = (s: PurchaseOrder["status"]) => { const m = { ordered: "bg-blue-500/15 text-blue-400", received: "bg-green-500/15 text-green-400", partial: "bg-yellow-500/15 text-yellow-400", cancelled: "bg-red-500/15 text-red-400" }; return m[s]; };
  const payStatusColor = (s: PurchaseOrder["paymentStatus"]) => { const m = { paid: "bg-green-500/15 text-green-400", pending: "bg-yellow-500/15 text-yellow-400", partial: "bg-orange-500/15 text-orange-400" }; return m[s]; };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Supplier Cards */}
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Suppliers</h3>
          <Dialog open={addDialog} onOpenChange={setAddDialog}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button></DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-xs">Company Name *</Label><Input value={supForm.name} onChange={(e) => setSupForm((p) => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Contact Person *</Label><Input value={supForm.contact} onChange={(e) => setSupForm((p) => ({ ...p, contact: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Phone *</Label><Input value={supForm.phone} onChange={(e) => setSupForm((p) => ({ ...p, phone: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Categories (comma-separated)</Label><Input value={supForm.categories} onChange={(e) => setSupForm((p) => ({ ...p, categories: e.target.value }))} placeholder="GPU, CPU, RAM" className="mt-1" /></div>
                <div><Label className="text-xs">Payment Terms</Label><Input value={supForm.terms} onChange={(e) => setSupForm((p) => ({ ...p, terms: e.target.value }))} placeholder="Net 30" className="mt-1" /></div>
                <Button onClick={addSupplier} className="w-full">Add Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {suppliers.map((s) => (
          <button key={s.id} onClick={() => setSelected(s)} className={cn("w-full text-left rounded-xl border p-4 transition-all", selected?.id === s.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30")}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-foreground">{s.name}</h4>
              <span className="text-[10px] text-muted-foreground">{s.paymentTerms}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">{s.categories.map((c) => <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>)}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total: {formatINR(s.totalPurchased)}</span>
              {s.outstandingPayment > 0 ? <span className="text-orange-400">Owes: {formatINR(s.outstandingPayment)}</span> : <span className="text-green-400">Settled ✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Purchase Orders */}
      <div className="md:col-span-3 rounded-xl border border-border bg-card p-4 space-y-3">
        {selected ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">{selected.name} — Orders</h3>
              <Dialog open={poDialog} onOpenChange={setPoDialog}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-3 w-3 mr-1" />New PO</Button></DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label className="text-xs">Product</Label><Input value={poForm.product} onChange={(e) => setPoForm((p) => ({ ...p, product: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Quantity</Label><Input type="number" value={poForm.qty} onChange={(e) => setPoForm((p) => ({ ...p, qty: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Unit Cost (₹)</Label><Input type="number" value={poForm.cost} onChange={(e) => setPoForm((p) => ({ ...p, cost: e.target.value }))} className="mt-1" /></div>
                    <Button onClick={addPO} className="w-full">Create PO</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {selectedOrders.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>}
              {selectedOrders.map((po) => (
                <div key={po.id} className="rounded-lg border border-border/50 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{po.id.toUpperCase()}</span>
                    <span className="text-muted-foreground">{po.date}</span>
                  </div>
                  {po.items.map((it, i) => (
                    <p key={i} className="text-muted-foreground">{it.quantity}× {it.productName} — {formatINR(it.totalCost)}</p>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", poStatusColor(po.status))}>{po.status}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", payStatusColor(po.paymentStatus))}>{po.paymentStatus}</span>
                    <span className="ml-auto font-semibold text-foreground">{formatINR(po.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Select a supplier</p>
        )}
      </div>
    </div>
  );
}
