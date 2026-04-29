import { useState, useMemo } from "react";
import { salesData as mockSalesData, profitByCategory as mockProfitByCategory, CATEGORY_GROUPS, mockSalesEntries } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingCart, Percent, Download, Filter } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/utils";

export default function Analytics() {
  const [period, setPeriod] = useState<"3m" | "6m" | "1y">("6m");
  
  // TODO: Replace with Neon DB API call → GET /api/analytics?period=6m
  const salesData = mockSalesData;
  const profitByCategory = mockProfitByCategory;
  
  const totalProfit = profitByCategory.reduce((s, c) => s + c.profit, 0);
  const avgMargin = (profitByCategory.reduce((s, c) => s + c.margin, 0) / profitByCategory.length).toFixed(1);
  
  // Find best category
  const bestCategory = profitByCategory.reduce((best, curr) => 
    curr.profit > best.profit ? curr : best, profitByCategory[0]);

  // Calculate payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Cash': 0,
      'UPI': 0,
      'Card': 0,
      'Net Banking': 0,
      'Bank Transfer': 0,
    };
    mockSalesEntries.forEach(sale => {
      counts[sale.paymentMethod] = (counts[sale.paymentMethod] || 0) + sale.totalAmount;
    });
    return Object.entries(counts)
      .filter(([, amount]) => amount > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        fill: name === 'Cash' ? 'hsl(var(--chart-1))' : 
              name === 'UPI' ? 'hsl(var(--chart-2))' :
              name === 'Card' ? 'hsl(var(--chart-3))' :
              name === 'Net Banking' ? 'hsl(var(--chart-4))' :
              'hsl(var(--chart-5))'
      }));
  }, []);

  // Export handler
  const handleExportCSV = () => {
    if (profitByCategory.length === 0) {
      toast.error("No data to export");
      return;
    }
    // TODO: Replace with Neon DB API call → GET /api/analytics/export
    const csvData = profitByCategory.map((cat) => ({
      Category: cat.category,
      'Total Profit': cat.profit,
      'Margin %': cat.margin,
    }));
    exportToCSV(csvData, 'profit-analytics');
    toast.success("Analytics data exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Profit Analytics</h1>
          <p className="text-sm text-muted-foreground">ML-powered insights into your profit performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={period === "3m" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("3m")}
          >
            3M
          </Button>
          <Button
            variant={period === "6m" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("6m")}
          >
            6M
          </Button>
          <Button
            variant={period === "1y" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("1y")}
          >
            1Y
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Profit (6mo)" value={`₹${(totalProfit / 100000).toFixed(1)}L`} change="+15.3% YoY" changeType="up" icon={DollarSign} />
        <StatCard title="Avg Margin" value={`${avgMargin}%`} change="Healthy" changeType="up" icon={Percent} />
        <StatCard title="Best Category" value={bestCategory?.category || "GPU"} change={`₹${((bestCategory?.profit || 185000) / 100000).toFixed(2)}L profit`} changeType="up" icon={TrendingUp} />
        <StatCard title="Units Sold (Feb)" value="148" change="+12 from Jan" changeType="up" icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profit by Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Profit by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={profitByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="profit" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fill="url(#analyticsRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Payment Method Breakdown */}
      {paymentBreakdown.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Payment Method Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie 
                data={paymentBreakdown} 
                cx="50%" 
                cy="50%" 
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="value"
              >
                {paymentBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Margin Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-card-foreground">Category Margin Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Total Profit</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Avg Margin</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Performance</th>
            </tr>
          </thead>
          <tbody>
            {profitByCategory.map((cat) => (
              <tr key={cat.category} className="border-b border-border/50">
                <td className="px-5 py-3 font-medium text-card-foreground">{cat.category}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-card-foreground">₹{cat.profit.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-success">{cat.margin}%</td>
                <td className="px-5 py-3">
                  <div className="h-1.5 w-28 rounded-full bg-secondary">
                    <div className="h-full rounded-full gradient-primary" style={{ width: `${(cat.margin / 25) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
