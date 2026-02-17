import { DollarSign, Package, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { salesData, categoryDistribution, alerts, recommendations, priceHistoryData } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back — here's your store overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Inventory Value" value="₹24.8L" change="+12.5% from last month" changeType="up" icon={Package} />
        <StatCard title="Monthly Profit" value="₹1.05L" change="+8.2% from last month" changeType="up" icon={DollarSign} />
        <StatCard title="Dead Stock Items" value="2" change="Needs attention" changeType="down" icon={AlertTriangle} />
        <StatCard title="Price Alerts" value="3" change="Action required" changeType="neutral" icon={TrendingUp} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Revenue & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                {categoryDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-3 justify-center">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                <span className="text-[11px] text-muted-foreground">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">AI Recommendations</h3>
          <div className="space-y-2.5">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  rec.priority === 'high' ? 'bg-destructive/15 text-destructive' : rec.priority === 'medium' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
                }`}>
                  {rec.priority === 'high' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{rec.action}: {rec.product}</p>
                  <p className="text-[11px] text-muted-foreground">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Recent Alerts</h3>
          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 rounded-lg p-3 ${!alert.read ? 'bg-primary/5 border border-primary/10' : 'bg-secondary/50'}`}>
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  alert.alertType === 'price_drop' ? 'bg-destructive' : alert.alertType === 'dead_stock' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{alert.productName}</p>
                  <p className="text-[11px] text-muted-foreground">{alert.message}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{alert.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
