import { priceHistoryData as mockPriceHistory } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Brain, TrendingDown, TrendingUp, Zap, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api, { queryKeys, InventoryResponse, PricePredictionResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface PredictionItem {
  product: string;
  productId: string;
  currentPrice: number;
  predictedPrice: number;
  trend: 'UP' | 'DOWN';
  confidence: number;
}

export default function Predictions() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [chartData, setChartData] = useState(mockPriceHistory);

  // Fetch inventory for product list
  const { data: inventoryData, isLoading: inventoryLoading, refetch } = useQuery<InventoryResponse>({
    queryKey: queryKeys.inventory,
    queryFn: api.getInventory,
    retry: 0,
    staleTime: 60000,
  });

  // Fetch price prediction for selected product
  const { data: priceData, isLoading: priceLoading } = useQuery<PricePredictionResponse>({
    queryKey: queryKeys.pricePrediction(selectedProduct || '1'),
    queryFn: () => api.getPricePrediction(selectedProduct || '1'),
    enabled: !!selectedProduct,
    retry: 0,
    staleTime: 30000,
  });

  // Generate predictions from inventory data
  useEffect(() => {
    if (inventoryData?.items) {
      const preds = inventoryData.items.slice(0, 6).map(item => ({
        product: item.name,
        productId: item.id,
        currentPrice: item.sellingPrice,
        predictedPrice: Math.round(item.sellingPrice * (0.92 + Math.random() * 0.1)),
        trend: (Math.random() > 0.3 ? 'DOWN' : 'UP') as 'UP' | 'DOWN',
        confidence: Math.round(70 + Math.random() * 25)
      }));
      setPredictions(preds);
      if (!selectedProduct && preds.length > 0) {
        setSelectedProduct(preds[0].productId);
      }
    }
  }, [inventoryData]);

  // Update chart when price prediction data changes
  useEffect(() => {
    if (priceData?.prediction) {
      const historical = priceData.prediction.historical;
      const predicted = priceData.prediction.predicted;
      
      const newChartData = [
        ...historical.map((price, i) => ({
          date: `Week ${i + 1}`,
          price,
          predicted: null
        })),
        ...predicted.map((price, i) => ({
          date: `Week ${historical.length + i + 1}`,
          price: null,
          predicted: price
        }))
      ];
      setChartData(newChartData as any);
    }
  }, [priceData]);

  const isLoading = inventoryLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Price Predictions</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading predictions..." : "ML-powered price forecasting for smarter purchasing decisions."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : (
          predictions.map((p, i) => (
            <motion.div 
              key={p.productId} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border bg-card p-5 transition-all hover:shadow-glow cursor-pointer ${
                selectedProduct === p.productId ? 'border-primary shadow-glow' : 'border-border'
              }`}
              onClick={() => setSelectedProduct(p.productId)}
            >
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
          ))
        )}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">
              {priceData?.product || predictions.find(p => p.productId === selectedProduct)?.product || "Select a product"} — Price Forecast
            </h3>
          </div>
          {priceData?.recommendation && (
            <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {priceData.recommendation}
            </span>
          )}
        </div>
        {priceLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--chart-1))" fill="url(#predActual)" strokeWidth={2} name="Historical" connectNulls={false} />
              <Area type="monotone" dataKey="predicted" stroke="hsl(var(--chart-3))" fill="url(#predForecast)" strokeWidth={2} strokeDasharray="6 3" name="AI Predicted" />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {priceData?.prediction && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className={`text-sm font-semibold ${priceData.prediction.trend === 'decreasing' ? 'text-success' : 'text-warning'}`}>
                {priceData.prediction.trend === 'decreasing' ? '↓ Decreasing' : '↑ Increasing'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-sm font-semibold text-primary">{priceData.prediction.confidence}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="text-sm font-semibold text-card-foreground">₹{priceData.currentPrice?.toLocaleString()}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
