import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  User,
  Package,
  IndianRupee,
  Plus,
  Tag,
  Layers,
  Banknote,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { NewSaleEntry, mockSalesEntries } from "@/lib/mock-data";
import { RecordSaleModal } from "@/components/sales/RecordSaleModal";
import { exportToCSV } from "@/lib/utils";

// ─── Payment Badge Colors ─────────────────────────────────────────────────────

const PAYMENT_COLORS: Record<string, string> = {
  Cash: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  UPI: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Card: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Net Banking": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Bank Transfer": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function topCategory(sales: NewSaleEntry[]): string {
  if (!sales.length) return "—";
  const counts: Record<string, number> = {};
  for (const s of sales) counts[s.category] = (counts[s.category] || 0) + s.quantity;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesDashboard() {
  const [sales, setSales] = useState<NewSaleEntry[]>(mockSalesEntries);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  // ── Derived stats (reactive to sales state) ────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
    const transactions = sales.length;
    const bestCategory = topCategory(sales);
    // Sorted newest first
    const sortedSales = [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return { totalRevenue, totalUnits, transactions, bestCategory, sortedSales };
  }, [sales]);

  // ── Top selling by totalAmount ─────────────────────────────────────────────
  const topSelling = useMemo(() => {
    const byProduct: Record<string, { qty: number; revenue: number }> = {};
    for (const s of sales) {
      if (!byProduct[s.productName]) byProduct[s.productName] = { qty: 0, revenue: 0 };
      byProduct[s.productName].qty += s.quantity;
      byProduct[s.productName].revenue += s.totalAmount;
    }
    return Object.entries(byProduct)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // ── Handle new sale submission ─────────────────────────────────────────────
  const handleNewSale = (
    sale: Omit<NewSaleEntry, "id" | "date" | "totalAmount">
  ) => {
    const entry: NewSaleEntry = {
      ...sale,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      totalAmount: sale.quantity * sale.unitPrice,
    };
    // TODO: Replace with Neon DB API call → POST /api/sales
    setSales((prev) => [entry, ...prev]);
    setIsRecordSaleOpen(false);
    toast.success("Sale recorded successfully!", {
      description: `${entry.productName} — ₹${entry.totalAmount.toLocaleString("en-IN")}`,
    });
  };

  // ── Export sales to CSV ────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (stats.sortedSales.length === 0) {
      toast.error("No sales to export");
      return;
    }
    // TODO: Replace with Neon DB API call → GET /api/sales/export
    const csvData = stats.sortedSales.map((sale) => ({
      Date: new Date(sale.date).toLocaleDateString("en-IN"),
      "Time": new Date(sale.date).toLocaleTimeString("en-IN"),
      Product: sale.productName,
      Category: sale.category,
      Qty: sale.quantity,
      "Unit Price": sale.unitPrice,
      Total: sale.totalAmount,
      Customer: sale.customerName || "Walk-in",
      "Payment Method": sale.paymentMethod,
      Notes: sale.notes || "—",
    }));
    exportToCSV(csvData, "sales");
    toast.success("Sales data exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sales Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.transactions} transactions · live in-memory data
          </p>
        </div>
        <Button
          onClick={() => setIsRecordSaleOpen(true)}
          className={`flex items-center gap-2 gradient-primary text-primary-foreground shadow-glow transition-all ${
            sales.length === 0
              ? "animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-background"
              : ""
          }`}
        >
          <Plus className="h-4 w-4" />
          Record Sale
        </Button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold font-mono">
                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Units Sold */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Units Sold</p>
                  <p className="text-lg font-bold font-mono">{stats.totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Layers className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Top Category</p>
                  <p className="text-lg font-bold">{stats.bestCategory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold font-mono">{stats.transactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Top Selling Products ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSelling.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sales yet — record your first sale above.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topSelling.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.qty} unit{item.qty !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary font-mono">
                        ₹{item.revenue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Sales Table ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                Recent Sales
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={stats.sortedSales.length === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export CSV
                </Button>
                <span className="text-xs text-muted-foreground">
                  {Math.min(10, stats.sortedSales.length)}/{stats.sortedSales.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {stats.sortedSales.slice(0, 10).map((sale, i) => (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0, y: -10, backgroundColor: "hsl(var(--primary) / 0.08)" }}
                        animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                        transition={{ duration: 0.3, delay: i === 0 ? 0 : 0 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-4 py-3 font-medium max-w-[160px]">
                          <span className="block truncate" title={sale.productName}>
                            {sale.productName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {sale.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{sale.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          ₹{sale.unitPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-primary">
                          ₹{sale.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 max-w-[120px]">
                          <span className="block truncate text-xs" title={sale.customerName}>
                            {sale.customerName || "Walk-in Customer"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              PAYMENT_COLORS[sale.paymentMethod] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[140px]">
                          <span
                            className="block truncate text-xs text-muted-foreground"
                            title={sale.notes}
                          >
                            {sale.notes || "—"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {stats.sortedSales.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-25" />
                        <p className="text-sm">No sales recorded yet.</p>
                        <p className="text-xs mt-1">
                          Click{" "}
                          <button
                            onClick={() => setIsRecordSaleOpen(true)}
                            className="text-primary underline underline-offset-2"
                          >
                            Record Sale
                          </button>{" "}
                          to add your first entry.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Record Sale Modal ────────────────────────────────────────── */}
      <RecordSaleModal
        open={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
        onSubmit={handleNewSale}
      />
    </div>
  );
}
