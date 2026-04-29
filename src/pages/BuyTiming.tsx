import { useState, useEffect, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fetchTop5Predictions } from "@/lib/predictionService";
import type { ProductPrediction } from "@/lib/predictionTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

// ─── Recommendation Badge ─────────────────────────────────────────────────────

function RecBadge({ rec }: { rec: ProductPrediction["recommendation"] }) {
  const cfg = {
    "BUY NOW": {
      cls: "bg-green-500/15 text-green-400 border-green-500/30",
      icon: <TrendingUp className="h-3 w-3" />,
      label: "BUY NOW",
    },
    WAIT: {
      cls: "bg-red-500/15 text-red-400 border-red-500/30",
      icon: <TrendingDown className="h-3 w-3" />,
      label: "WAIT",
    },
    HOLD: {
      cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      icon: <Minus className="h-3 w-3" />,
      label: "HOLD",
    },
  }[rec];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
        cfg.cls
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Custom Tooltip for the chart ─────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 p-3 shadow-lg text-xs space-y-1 backdrop-blur-sm">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value != null ? formatINR(p.value) : "—"}
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyTiming() {
  const [predictions, setPredictions] = useState<ProductPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProductPrediction | null>(null);
  const [dataSource, setDataSource] = useState<"mock" | "live">("mock");
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchTop5Predictions();
      setPredictions(result.products);
      setDataSource(result.dataSource);
      setGeneratedAt(result.generatedAt);
      // Auto-select first product only on initial load
      setSelected((prev) => prev ?? result.products[0] ?? null);
    } catch (err) {
      console.error("Prediction fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Chart data: concat history (actual) + predictions (dashed) ──
  const chartData = useMemo(() => {
    if (!selected) return [];
    const todayStr = new Date().toISOString().split("T")[0];
    return [
      ...selected.priceHistory.map((h) => ({
        date: formatDate(h.date),
        actual: h.price,
        predicted: null as number | null,
        lower: null as number | null,
        upper: null as number | null,
        isPast: true,
      })),
      ...selected.predictedPrices.map((p) => ({
        date: formatDate(p.date),
        actual: null as number | null,
        predicted: p.predictedPrice,
        lower: p.lowerBound,
        upper: p.upperBound,
        isPast: false,
      })),
    ];
  }, [selected]);

  // The index in chartData where past ends / prediction begins
  const splitIndex = selected ? selected.priceHistory.length : 0;
  const splitLabel = splitIndex < chartData.length ? chartData[splitIndex]?.date : undefined;

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[340px] w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Buy Timing Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered purchase timing recommendations for top products
          </p>
        </div>
      </div>

      {/* ── Chart Card ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            {/* Data source banner + refresh button */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {dataSource === "mock" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Demo data · Connect PriceAPI + Gemini for live predictions
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                    <span className="text-xs text-green-400">
                      Live AI predictions ·{" "}
                      {generatedAt
                        ? `Updated ${Math.round((Date.now() - generatedAt.getTime()) / 60000)} min ago`
                        : "Just refreshed"}
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(true)}
                disabled={refreshing}
                className="shrink-0"
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
                />
                {refreshing ? "Analysing…" : "Refresh Predictions"}
              </Button>
            </div>

            {/* Product selector tabs */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {predictions.map((p) => (
                <button
                  key={p.productId}
                  onClick={() => setSelected(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    selected?.productId === p.productId
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-background hover:bg-accent text-muted-foreground border-border"
                  )}
                >
                  {p.productName.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>

            {selected && (
              <div className="flex items-center gap-3 mt-3">
                <CardTitle className="text-sm font-semibold text-card-foreground">
                  {selected.productName}
                </CardTitle>
                <RecBadge rec={selected.recommendation} />
                <span className="text-xs text-muted-foreground">
                  {selected.confidence}% confidence
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  width={52}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value) =>
                    value === "actual"
                      ? "Actual Price"
                      : value === "predicted"
                      ? "AI Forecast"
                      : value === "upper"
                      ? "Upper Bound"
                      : "Lower Bound"
                  }
                  wrapperStyle={{ fontSize: 11 }}
                />

                {/* Confidence band (shaded area between bounds) */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confBand)"
                  legendType="none"
                  dot={false}
                  activeDot={false}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="white"
                  fillOpacity={0}
                  legendType="none"
                  dot={false}
                  activeDot={false}
                  connectNulls
                />

                {/* Past / actual price — solid cyan */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  name="actual"
                />

                {/* AI predicted price — dashed orange */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  name="predicted"
                />

                {/* Vertical divider at "today" / split point */}
                {splitLabel && (
                  <ReferenceLine
                    x={splitLabel}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    label={{
                      value: "AI Forecast →",
                      position: "insideTopRight",
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 10,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recommendation Cards ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            AI Recommendations
          </h2>
          <span className="text-xs text-muted-foreground">
            · click a card to view its chart
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((p, idx) => {
            const isSelected = selected?.productId === p.productId;
            const priceUp = p.priceChangePercent > 0;
            return (
              <motion.div
                key={p.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => setSelected(p)}
                className={cn(
                  "rounded-xl border p-4 cursor-pointer transition-all",
                  "hover:border-primary/50 hover:shadow-md",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-card-foreground truncate">
                      {p.productName}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {p.category}
                    </span>
                    <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      #{predictions.indexOf(p) + 1} Top Seller
                      {p.totalUnitsSold ? ` · ${p.totalUnitsSold} sold` : ""}
                    </span>
                  </div>
                  <RecBadge rec={p.recommendation} />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatINR(p.currentPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Predicted (30d)
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        priceUp ? "text-red-400" : "text-green-400"
                      )}
                    >
                      {formatINR(p.predictedPrice30Days)}
                      <span className="ml-1 text-[10px] font-medium">
                        ({priceUp ? "+" : ""}
                        {p.priceChangePercent}%)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                  {p.reasoning}
                </p>

                {/* Key factors */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.keyFactors.slice(0, 2).map((f) => (
                    <span
                      key={f}
                      className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border pt-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {p.confidence}% confidence
                  </span>
                  {p.waitDays && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Wait {p.waitDays}d
                    </span>
                  )}
                  {p.bestBuyDate && (
                    <span>Best: {formatDate(p.bestBuyDate)}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
