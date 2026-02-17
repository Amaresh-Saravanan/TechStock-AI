import { priceHistoryData } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Brain, TrendingDown, TrendingUp, Zap } from "lucide-react";

const predictions = [
  { product: 'AMD Ryzen 7 7800X3D', currentPrice: 34999, predictedPrice: 32500, trend: 'DOWN' as const, confidence: 87 },
  { product: 'NVIDIA RTX 4070 Ti Super', currentPrice: 64999, predictedPrice: 62000, trend: 'DOWN' as const, confidence: 82 },
  { product: 'Corsair Vengeance DDR5 32GB', currentPrice: 8999, predictedPrice: 9200, trend: 'UP' as const, confidence: 74 },
  { product: 'Samsung 990 Pro 2TB', currentPrice: 14499, predictedPrice: 13200, trend: 'DOWN' as const, confidence: 91 },
  { product: 'NVIDIA RTX 4060', currentPrice: 29999, predictedPrice: 28500, trend: 'DOWN' as const, confidence: 85 },
];

export default function Predictions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Price Predictions</h1>
        <p className="text-sm text-muted-foreground">ML-powered price forecasting for smarter purchasing decisions.</p>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {predictions.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-glow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                p.trend === 'DOWN' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {p.trend === 'DOWN' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {p.trend}
              </span>
            </div>
            <p className="text-sm font-semibold text-card-foreground">{p.product}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground line-through">₹{p.currentPrice.toLocaleString()}</span>
              <span className="text-lg font-bold text-primary font-mono">₹{p.predictedPrice.toLocaleString()}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold text-card-foreground">{p.confidence}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full rounded-full gradient-primary" style={{ width: `${p.confidence}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-card-foreground">Ryzen 7 7800X3D — Price Forecast</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceHistoryData}>
            <defs>
              <linearGradient id="predActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis domain={[30000, 38000]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="price" stroke="hsl(var(--chart-1))" fill="url(#predActual)" strokeWidth={2} name="Historical" connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(var(--chart-3))" fill="url(#predForecast)" strokeWidth={2} strokeDasharray="6 3" name="AI Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
