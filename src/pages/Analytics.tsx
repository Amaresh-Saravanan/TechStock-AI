import { salesData, profitByCategory } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingCart, Percent } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function Analytics() {
  const totalProfit = profitByCategory.reduce((s, c) => s + c.profit, 0);
  const avgMargin = (profitByCategory.reduce((s, c) => s + c.margin, 0) / profitByCategory.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Profit Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your profit performance and trends.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Profit (6mo)" value={`₹${(totalProfit / 100000).toFixed(1)}L`} change="+15.3% YoY" changeType="up" icon={DollarSign} />
        <StatCard title="Avg Margin" value={`${avgMargin}%`} change="Healthy" changeType="up" icon={Percent} />
        <StatCard title="Best Category" value="GPU" change="₹1.85L profit" changeType="up" icon={TrendingUp} />
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
