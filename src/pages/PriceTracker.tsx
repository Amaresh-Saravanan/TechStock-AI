import { competitorPrices, priceHistoryData } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export default function PriceTracker() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Price Tracker</h1>
        <p className="text-sm text-muted-foreground">Monitor competitor prices and find optimal pricing.</p>
      </div>

      {/* Price Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-1">AMD Ryzen 7 7800X3D — Price Trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Historical prices with AI-predicted future trend</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={priceHistoryData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={[30000, 38000]} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="price" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} name="Actual" connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(var(--chart-3))" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="6 3" name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Competitor Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-card-foreground">Competitor Price Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Your Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amazon</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Flipkart</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">MD Computers</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">PrimeABGB</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Recommended</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {competitorPrices.map((item) => {
                const diff = item.yourPrice - item.recommendedPrice;
                const isOverpriced = diff > 500;
                return (
                  <tr key={item.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-card-foreground">{item.productName}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-medium text-card-foreground">₹{item.yourPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">₹{item.amazonPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">₹{item.flipkartPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">₹{item.mdcomputersPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">₹{item.primeabgbPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-medium text-primary">₹{item.recommendedPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {isOverpriced ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                          <ArrowUp className="h-3 w-3" /> Overpriced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                          <Minus className="h-3 w-3" /> Competitive
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
