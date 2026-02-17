import { useMemo } from "react";
import { DollarSign, Package, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, RefreshCw, Clock, ShoppingCart, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { salesData as mockSalesData, categoryDistribution as mockCategoryDistribution, inventoryItems as mockInventoryItems } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api, { queryKeys, DashboardResponse, AnalyticsResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Helper functions for inventory calculations
function isDeadStock(lastSoldDate: string | undefined | null): boolean {
  if (!lastSoldDate) return true;
  const lastSold = new Date(lastSoldDate);
  const now = new Date();
  const daysSinceLastSold = Math.floor((now.getTime() - lastSold.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceLastSold >= 30;
}

function getDaysSinceLastSold(lastSoldDate: string | undefined | null): number {
  if (!lastSoldDate) return 999;
  const lastSold = new Date(lastSoldDate);
  const now = new Date();
  return Math.floor((now.getTime() - lastSold.getTime()) / (1000 * 60 * 60 * 24));
}

// Chart colors
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useQuery<DashboardResponse>({
    queryKey: queryKeys.dashboard,
    queryFn: api.getDashboard,
    refetchInterval: 30000,
    retry: 0, // Don't retry - fail fast
    staleTime: 30000, // Data stays fresh for 30s
  });

  // Fetch analytics data
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading,
  } = useQuery<AnalyticsResponse>({
    queryKey: queryKeys.analytics,
    queryFn: api.getAnalytics,
    refetchInterval: 60000,
    retry: 0,
    staleTime: 60000,
  });

  // Use API data or fallback to mock
  const stats = dashboardData?.stats;
  const aiInsight = dashboardData?.aiInsight;
  const recommendations = dashboardData?.recommendations || [];
  const alerts = dashboardData?.alerts || [];
  const salesData = analyticsData?.salesTrend || mockSalesData;
  const categoryDistribution = analyticsData?.categoryDistribution?.map((cat, i) => ({
    name: cat.name,
    value: cat.value,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  })) || mockCategoryDistribution;

  // Calculate inventory metrics from mock data
  const inventoryMetrics = useMemo(() => {
    const items = mockInventoryItems;
    
    const totalProfit = items.reduce((sum, item) => {
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity;
      return sum + profit;
    }, 0);

    const deadStockItems = items.filter(item => isDeadStock(item.lastSoldDate));
    const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 10);
    const outOfStockItems = items.filter(item => item.quantity === 0);

    // Stock More suggestions - high demand or fast selling items with low quantity
    const stockMoreItems = items
      .filter(item => {
        const profit = item.sellingPrice - item.purchasePrice;
        return profit > 2000 && item.quantity <= 10 && !isDeadStock(item.lastSoldDate);
      })
      .slice(0, 3);

    // Reduce Stock suggestions - dead stock items
    const reduceStockItems = items
      .filter(item => isDeadStock(item.lastSoldDate) || item.quantity > 20)
      .slice(0, 3);

    return {
      totalProfit,
      deadStockCount: deadStockItems.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      stockMoreItems,
      reduceStockItems,
    };
  }, []);

  const isLoading = dashboardLoading || analyticsLoading;
  const hasError = dashboardError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading data..." : hasError ? "Using cached data" : "Real-time ML insights"}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetchDashboard()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* AI Insight Card */}
      {dashboardLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 gradient-primary"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-primary-foreground">AI Insight</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-primary-foreground rounded-full">
                    ML Powered
                  </span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left - Recommended Asset */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 mb-1">
                  Recommended Asset
                </p>
                <h4 className="text-2xl font-bold text-primary-foreground mb-4">
                  {aiInsight?.product || "NVIDIA RTX 4070 Ti"}
                </h4>
                <p className="text-sm text-primary-foreground/80 leading-relaxed">
                  Market intelligence indicates a <span className="text-success font-semibold underline underline-offset-2">
                    {aiInsight?.surgePct || 45}% surge
                  </span> in demand. 
                  {aiInsight?.insight || "Current valuation is 18% above acquisition cost. Inventory levels are reaching critical thresholds across major regional distributors."}
                </p>
              </div>

              {/* Right - Stats */}
              <div className="flex items-center justify-end gap-8">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 mb-1">Profit</p>
                  <p className="text-2xl font-bold text-primary-foreground">
                    {aiInsight?.profitFormatted || "+₹12.5K"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 mb-1">Demand</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {aiInsight?.demandLevel || "Peak"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 mb-1">Supply</p>
                  <p className="text-2xl font-bold text-warning">
                    {aiInsight?.supplyLevel || "Critical"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Profit" 
              value={`₹${(inventoryMetrics.totalProfit / 1000).toFixed(1)}K`} 
              change="From current inventory" 
              changeType="up" 
              icon={DollarSign} 
            />
            <StatCard 
              title="Dead Stock" 
              value={String(stats?.deadStockCount ?? inventoryMetrics.deadStockCount)} 
              change={inventoryMetrics.deadStockCount > 0 ? "30+ days unsold" : "All stock moving"} 
              changeType={inventoryMetrics.deadStockCount > 0 ? "down" : "up"} 
              icon={Clock} 
            />
            <StatCard 
              title="Low Stock" 
              value={String(inventoryMetrics.lowStockCount)} 
              change={inventoryMetrics.lowStockCount > 0 ? "Needs restocking" : "Stock levels healthy"} 
              changeType={inventoryMetrics.lowStockCount > 3 ? "down" : "neutral"} 
              icon={AlertTriangle} 
            />
            <StatCard 
              title="Out of Stock" 
              value={String(inventoryMetrics.outOfStockCount)} 
              change={inventoryMetrics.outOfStockCount > 0 ? "Missing sales" : "All products available"} 
              changeType={inventoryMetrics.outOfStockCount > 0 ? "down" : "up"} 
              icon={ShoppingCart} 
            />
          </>
        )}
      </div>

      {/* Optimization Suggestions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} 
          className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
              <ArrowUpCircle className="h-4 w-4" style={{ color: "#22C55E" }} />
            </div>
            <h3 className="text-sm font-semibold text-card-foreground">Stock More</h3>
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>
          <div className="space-y-2">
            {inventoryMetrics.stockMoreItems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No items need restocking</p>
            ) : (
              inventoryMetrics.stockMoreItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.productName}</p>
                    <p className="text-[10px] text-muted-foreground">{item.quantity} in stock</p>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: "#22C55E" }}>High Demand</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
          className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
              <ArrowDownCircle className="h-4 w-4" style={{ color: "#EF4444" }} />
            </div>
            <h3 className="text-sm font-semibold text-card-foreground">Reduce Stock</h3>
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>
          <div className="space-y-2">
            {inventoryMetrics.reduceStockItems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No items need reduction</p>
            ) : (
              inventoryMetrics.reduceStockItems.map((item) => {
                const days = getDaysSinceLastSold(item.lastSoldDate);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.productName}</p>
                      <p className="text-[10px] text-muted-foreground">{item.quantity} in stock</p>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: "#EF4444" }}>
                      {days >= 30 ? `${days}d unsold` : 'Overstock'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-card-foreground">AI Recommendations</h3>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="space-y-2.5">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recommendations at the moment</p>
            ) : (
              recommendations.slice(0, 4).map((rec, i) => (
                <div key={rec.productId || i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
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
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Recent Alerts</h3>
          <div className="space-y-2.5">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts at the moment</p>
            ) : (
              alerts.slice(0, 4).map((alert) => {
                const alertType = (alert as any).alertType || alert.type;
                return (
                  <div key={alert.id} className={`flex items-start gap-3 rounded-lg p-3 ${!alert.read ? 'bg-primary/5 border border-primary/10' : 'bg-secondary/50'}`}>
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      alertType === 'price_drop' ? 'bg-destructive' : alertType === 'dead_stock' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="text-xs font-semibold text-card-foreground">{alert.productName}</p>
                      <p className="text-[11px] text-muted-foreground">{alert.message}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {typeof alert.createdAt === 'string' && alert.createdAt.includes('T') 
                          ? new Date(alert.createdAt).toLocaleString() 
                          : alert.createdAt}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
