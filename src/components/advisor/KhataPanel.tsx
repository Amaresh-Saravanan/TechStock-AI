import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockKhataCustomers } from "@/lib/mock-data";
import type { KhataCustomer, KhataEntry } from "@/lib/advisorTypes";

// TODO: GET /api/khata/customers → load from DB
// TODO: POST /api/khata/entry → save credit/payment entry
// TODO: POST /api/khata/notify/:customerId → WhatsApp API

function formatINR(n: number) { return `₹${n.toLocaleString("en-IN")}`; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }

export function KhataPanel() {
  const [customers, setCustomers] = useState<KhataCustomer[]>(mockKhataCustomers);
  const [selected, setSelected] = useState<KhataCustomer | null>(customers[0] ?? null);
  const [search, setSearch] = useState("");
  const [payDialog, setPayDialog] = useState(false);
  const [creditDialog, setCreditDialog] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [creditForm, setCreditForm] = useState({ name: "", phone: "", amount: "", desc: "" });

  const totalOutstanding = useMemo(() => customers.reduce((s, c) => s + c.totalOutstanding, 0), [customers]);
  const filtered = useMemo(() => customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.totalOutstanding - a.totalOutstanding), [customers, search]);

  const dotColor = (amt: number) => amt > 20000 ? "bg-red-500" : amt > 0 ? "bg-yellow-500" : "bg-green-500";

  const recordPayment = () => {
    const amt = parseInt(payAmount);
    if (!amt || amt <= 0 || !selected) { toast.error("Enter a valid amount"); return; }
    const entry: KhataEntry = {
      id: `ke-${Date.now()}`, customerName: selected.name, customerPhone: selected.phone,
      type: "payment", amount: amt, description: `Payment received`,
      date: new Date().toISOString().split("T")[0],
      balanceAfter: Math.max(0, selected.totalOutstanding - amt),
    };
    setCustomers((prev) => prev.map((c) => c.id === selected.id ? { ...c, totalOutstanding: entry.balanceAfter, lastTransaction: entry.date, entries: [...c.entries, entry] } : c));
    setSelected((prev) => prev ? { ...prev, totalOutstanding: entry.balanceAfter, entries: [...prev.entries, entry], lastTransaction: entry.date } : null);
    setPayAmount("");
    setPayDialog(false);
    toast.success(`${formatINR(amt)} payment recorded for ${selected.name}`);
  };

  const addCredit = () => {
    const { name, phone, amount, desc } = creditForm;
    const amt = parseInt(amount);
    if (!name.trim() || !phone.trim() || !amt || !desc.trim()) { toast.error("Fill all fields"); return; }
    const existing = customers.find((c) => c.phone === phone.trim());
    const entry: KhataEntry = {
      id: `ke-${Date.now()}`, customerName: name.trim(), customerPhone: phone.trim(),
      type: "credit", amount: amt, description: desc.trim(),
      date: new Date().toISOString().split("T")[0],
      balanceAfter: (existing?.totalOutstanding ?? 0) + amt,
    };
    if (existing) {
      setCustomers((prev) => prev.map((c) => c.id === existing.id ? { ...c, totalOutstanding: entry.balanceAfter, lastTransaction: entry.date, entries: [...c.entries, entry] } : c));
    } else {
      const newCust: KhataCustomer = { id: `kh-${Date.now()}`, name: name.trim(), phone: phone.trim(), totalOutstanding: amt, lastTransaction: entry.date, entries: [entry] };
      setCustomers((prev) => [newCust, ...prev]);
    }
    setCreditForm({ name: "", phone: "", amount: "", desc: "" });
    setCreditDialog(false);
    toast.success(`Credit of ${formatINR(amt)} recorded`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Customer List */}
      <div className="md:col-span-2 rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Khata Book</h3>
            <p className="text-xs text-muted-foreground">Total due: {formatINR(totalOutstanding)}</p>
          </div>
          <Dialog open={creditDialog} onOpenChange={setCreditDialog}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />New</Button></DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>New Credit Entry</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-xs">Customer</Label><Input value={creditForm.name} onChange={(e) => setCreditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={creditForm.phone} onChange={(e) => setCreditForm((p) => ({ ...p, phone: e.target.value }))} placeholder="98XXXXXXXX" className="mt-1" /></div>
                <div><Label className="text-xs">Amount (₹)</Label><Input type="number" value={creditForm.amount} onChange={(e) => setCreditForm((p) => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Description</Label><Input value={creditForm.desc} onChange={(e) => setCreditForm((p) => ({ ...p, desc: e.target.value }))} placeholder="What was purchased" className="mt-1" /></div>
                <Button onClick={addCredit} className="w-full">Record Credit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className={cn("w-full text-left rounded-lg px-3 py-2.5 text-xs transition-colors", selected?.id === c.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary")}>
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", dotColor(c.totalOutstanding))} />
                <span className="font-medium text-foreground truncate">{c.name}</span>
              </div>
              <div className="ml-4 text-muted-foreground mt-0.5">
                {c.totalOutstanding > 0 ? <span className="text-red-400">{formatINR(c.totalOutstanding)} due</span> : <span className="text-green-400">Settled</span>}
                <span className="ml-2">· {formatDate(c.lastTransaction)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ledger */}
      <div className="md:col-span-3 rounded-xl border border-border bg-card p-4 space-y-3">
        {selected ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">Ph: {selected.phone} · Outstanding: <span className={selected.totalOutstanding > 0 ? "text-red-400" : "text-green-400"}>{formatINR(selected.totalOutstanding)}</span></p>
              </div>
              {selected.totalOutstanding > 0 && (
                <Dialog open={payDialog} onOpenChange={setPayDialog}>
                  <DialogTrigger asChild><Button size="sm">Record Payment</Button></DialogTrigger>
                  <DialogContent className="max-w-xs">
                    <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Outstanding: {formatINR(selected.totalOutstanding)}</p>
                      <div><Label className="text-xs">Amount (₹)</Label><Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="mt-1" /></div>
                      <Button onClick={recordPayment} className="w-full">Confirm Payment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-secondary/60"><tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right text-red-400">Debit</th><th className="px-3 py-2 text-right text-green-400">Credit</th><th className="px-3 py-2 text-right">Balance</th></tr></thead>
                <tbody>
                  {selected.entries.map((e) => (
                    <tr key={e.id} className="border-t border-border/50">
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(e.date)}</td>
                      <td className="px-3 py-2 text-foreground">{e.description}</td>
                      <td className="px-3 py-2 text-right">{e.type === "credit" ? formatINR(e.amount) : ""}</td>
                      <td className="px-3 py-2 text-right">{e.type === "payment" ? formatINR(e.amount) : ""}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatINR(e.balanceAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Select a customer to view ledger</p>
        )}
      </div>
    </div>
  );
}
