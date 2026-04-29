import { useState, useMemo } from "react";
import { Shield, AlertTriangle, Search, Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockWarranties } from "@/lib/mock-data";
import type { WarrantyRecord } from "@/lib/advisorTypes";

// TODO: GET /api/warranties → load from DB
// TODO: POST /api/warranties → add new warranty
// TODO: GET /api/warranties/expiring → get expiring in 30 days

function getStatus(w: WarrantyRecord): WarrantyRecord["status"] {
  const today = new Date();
  const expiry = new Date(w.warrantyExpiryDate);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring_soon";
  return "active";
}

function daysUntilExpiry(w: WarrantyRecord): number {
  return Math.ceil((new Date(w.warrantyExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

export function WarrantyPanel() {
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(mockWarranties);
  const [filter, setFilter] = useState<"all" | "active" | "expiring_soon" | "expired">("all");
  const [search, setSearch] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", productName: "", category: "", serialNumber: "", warrantyMonths: "" });

  // Recompute status live
  const enriched = useMemo(() => warranties.map((w) => ({ ...w, status: getStatus(w) })), [warranties]);
  const counts = useMemo(() => ({ active: enriched.filter((w) => w.status === "active").length, expiring: enriched.filter((w) => w.status === "expiring_soon").length, expired: enriched.filter((w) => w.status === "expired").length }), [enriched]);
  const filtered = useMemo(() => enriched.filter((w) => (filter === "all" || w.status === filter) && (w.customerName.toLowerCase().includes(search.toLowerCase()) || w.productName.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => new Date(a.warrantyExpiryDate).getTime() - new Date(b.warrantyExpiryDate).getTime()), [enriched, filter, search]);

  const addWarranty = () => {
    const { customerName, customerPhone, productName, category, serialNumber, warrantyMonths } = form;
    if (!customerName || !customerPhone || !productName || !category || !warrantyMonths) { toast.error("Fill all required fields"); return; }
    const months = parseInt(warrantyMonths);
    const purchaseDate = new Date().toISOString().split("T")[0];
    const expiry = new Date(); expiry.setMonth(expiry.getMonth() + months);
    const record: WarrantyRecord = { id: `war-${Date.now()}`, customerName, customerPhone, productName, category, serialNumber: serialNumber || undefined, purchaseDate, warrantyMonths: months, warrantyExpiryDate: expiry.toISOString().split("T")[0], status: "active" };
    setWarranties((prev) => [record, ...prev]);
    setForm({ customerName: "", customerPhone: "", productName: "", category: "", serialNumber: "", warrantyMonths: "" });
    setAddDialog(false);
    toast.success("Warranty registered!");
  };

  const notifyCustomer = (w: WarrantyRecord) => {
    const msg = `Dear ${w.customerName}, your ${w.productName} warranty expires on ${w.warrantyExpiryDate}. Visit us for extended warranty options.`;
    navigator.clipboard.writeText(msg);
    toast.success("WhatsApp message copied — paste to send");
  };

  const statusBadge = (s: WarrantyRecord["status"], days: number) => {
    if (s === "active") return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/15 text-green-400">Active</span>;
    if (s === "expiring_soon") return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-400">Expiring in {days}d</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-400">Expired {Math.abs(days)}d ago</span>;
  };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {([["Active", counts.active, "bg-green-500/15 text-green-400"], ["Expiring Soon", counts.expiring, "bg-yellow-500/15 text-yellow-400"], ["Expired", counts.expired, "bg-red-500/15 text-red-400"]] as const).map(([label, count, cls]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold mt-1", cls.split(" ")[1])}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        {(["all", "active", "expiring_soon", "expired"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1 rounded-full text-xs border transition-colors", filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-accent")}>
            {f === "all" ? "All" : f === "expiring_soon" ? "Expiring Soon" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="relative flex-1 max-w-xs ml-auto"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-3 w-3 mr-1" />Add Warranty</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Register Warranty</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Customer Name *</Label><Input value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Phone *</Label><Input value={form.customerPhone} onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Product *</Label><Input value={form.productName} onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Category *</Label><Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Serial Number</Label><Input value={form.serialNumber} onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Warranty (months) *</Label><Input type="number" value={form.warrantyMonths} onChange={(e) => setForm((p) => ({ ...p, warrantyMonths: e.target.value }))} className="mt-1" /></div>
              <Button onClick={addWarranty} className="w-full">Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-secondary/60"><tr>
            <th className="px-3 py-2 text-left">Customer</th>
            <th className="px-3 py-2 text-left">Product</th>
            <th className="px-3 py-2 text-left">Purchase</th>
            <th className="px-3 py-2 text-left">Expiry</th>
            <th className="px-3 py-2 text-center">Status</th>
            <th className="px-3 py-2 text-center">Action</th>
          </tr></thead>
          <tbody>
            {filtered.map((w) => { const days = daysUntilExpiry(w); return (
              <tr key={w.id} className="border-t border-border/50">
                <td className="px-3 py-2"><p className="font-medium text-foreground">{w.customerName}</p><p className="text-muted-foreground">{w.customerPhone}</p></td>
                <td className="px-3 py-2"><p className="text-foreground">{w.productName}</p>{w.serialNumber && <p className="text-muted-foreground">{w.serialNumber}</p>}</td>
                <td className="px-3 py-2 text-muted-foreground">{w.purchaseDate}</td>
                <td className="px-3 py-2 text-muted-foreground">{w.warrantyExpiryDate}</td>
                <td className="px-3 py-2 text-center">{statusBadge(w.status, days)}</td>
                <td className="px-3 py-2 text-center">{w.status === "expiring_soon" && <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => notifyCustomer(w)}><Copy className="h-3 w-3 mr-1" />Notify</Button>}</td>
              </tr>
            ); })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No warranties found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
