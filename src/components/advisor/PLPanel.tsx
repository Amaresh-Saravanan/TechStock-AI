import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockSalesEntries, mockExpenses as defaultExpenses } from "@/lib/mock-data";
import type { Expense, MonthlyPL } from "@/lib/advisorTypes";

// TODO: GET /api/sales?month=2025-03 → real sales from DB
// TODO: GET /api/expenses?month=2025-03 → real expenses
// TODO: POST /api/expenses → add expense

function formatINR(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

const EXPENSE_LABELS: Record<Expense["category"], string> = {
  rent: "Rent", electricity: "Electricity", salary: "Salary",
  packaging: "Packaging", marketing: "Marketing", misc: "Miscellaneous",
};

export function PLPanel() {
  const [selectedMonth, setSelectedMonth] = useState("2025-03");
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [addDialog, setAddDialog] = useState(false);
  const [expForm, setExpForm] = useState({ category: "misc" as Expense["category"], desc: "", amount: "" });

  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  const navMonth = (dir: -1 | 1) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const calculatePL = (month: string): MonthlyPL => {
    const monthSales = mockSalesEntries.filter((s) => s.date.startsWith(month));
    const revenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const cogs = monthSales.reduce((sum, s) => sum + s.unitPrice * s.quantity * 0.75, 0);
    const grossProfit = revenue - cogs;
    const totalExp = expenses.filter((e) => e.month === month).reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExp;
    return { month, revenue, costOfGoods: Math.round(cogs), grossProfit: Math.round(grossProfit), expenses: totalExp, netProfit: Math.round(netProfit), netMargin: revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0 };
  };

  const currentPL = useMemo(() => calculatePL(selectedMonth), [selectedMonth, expenses]);
  const monthExpenses = useMemo(() => expenses.filter((e) => e.month === selectedMonth), [expenses, selectedMonth]);

  // Last 6 months chart data
  const chartData = useMemo(() => {
    const months: string[] = [];
    const [y, m] = selectedMonth.split("-").map(Number);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return months.map((mo) => {
      const pl = calculatePL(mo);
      return { month: monthLabel(mo).split(" ")[0].slice(0, 3), revenue: pl.revenue, netProfit: pl.netProfit };
    });
  }, [selectedMonth, expenses]);

  const addExpense = () => {
    const amt = parseInt(expForm.amount);
    if (!expForm.desc || !amt) { toast.error("Fill all fields"); return; }
    const exp: Expense = { id: `exp-${Date.now()}`, category: expForm.category, description: expForm.desc, amount: amt, date: new Date().toISOString().split("T")[0], month: selectedMonth };
    setExpenses((prev) => [...prev, exp]);
    setExpForm({ category: "misc", desc: "", amount: "" });
    setAddDialog(false);
    toast.success("Expense added!");
  };

  const marginColor = (m: number) => m > 20 ? "text-green-400" : m > 10 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <h3 className="font-semibold text-foreground">{monthLabel(selectedMonth)}</h3>
        <Button variant="ghost" size="sm" onClick={() => navMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          ["Revenue", currentPL.revenue, null],
          ["Cost of Goods", currentPL.costOfGoods, null],
          ["Gross Profit", currentPL.grossProfit, `${currentPL.grossProfit > 0 ? "" : "-"}${Math.round((currentPL.grossProfit / Math.max(currentPL.revenue, 1)) * 100)}%`],
          ["Net Profit", currentPL.netProfit, `${currentPL.netMargin}%`],
        ] as const).map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-lg font-bold mt-1", label === "Net Profit" && marginColor(currentPL.netMargin))}>{formatINR(value as number)}</p>
            {sub && <p className={cn("text-xs mt-0.5", label === "Net Profit" ? marginColor(currentPL.netMargin) : "text-muted-foreground")}>{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expenses */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">Expenses This Month</h3>
            <Dialog open={addDialog} onOpenChange={setAddDialog}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add</Button></DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select value={expForm.category} onValueChange={(v) => setExpForm((p) => ({ ...p, category: v as Expense["category"] }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{(Object.entries(EXPENSE_LABELS)).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Description</Label><Input value={expForm.desc} onChange={(e) => setExpForm((p) => ({ ...p, desc: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">Amount (₹)</Label><Input type="number" value={expForm.amount} onChange={(e) => setExpForm((p) => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
                  <Button onClick={addExpense} className="w-full">Add Expense</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {monthExpenses.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No expenses recorded</p>}
            {monthExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 text-xs">
                <div>
                  <span className="text-foreground">{EXPENSE_LABELS[e.category]}</span>
                  <p className="text-muted-foreground text-[10px]">{e.description}</p>
                </div>
                <span className="font-medium text-foreground">{formatINR(e.amount)}</span>
              </div>
            ))}
            {monthExpenses.length > 0 && (
              <div className="flex justify-between pt-2 text-xs font-bold text-foreground border-t border-border">
                <span>Total</span>
                <span>{formatINR(currentPL.expenses)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Revenue vs Net Profit (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatINR(value)} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" fill="#06b6d4" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netProfit" fill="#22c55e" name="Net Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
