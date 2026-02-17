import { useState, useMemo } from "react";
import { competitorPrices as mockCompetitorPrices, priceHistoryData as mockPriceHistoryData, inventoryItems } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus, TrendingUp, TrendingDown, Sparkles, RefreshCw, Search, ChevronRight, DollarSign, Package, Target, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api, { queryKeys, PriceTrackingItem, PriceHistoryEntry, PriceSuggestionsResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Generate mock price tracking data from inventory
function generateMockPriceTracking(): PriceTrackingItem[] {
  return inventoryItems.map((item, idx) => {
    const competitorPrices = {
      amazon: Math.round(item.sellingPrice * (0.92 + Math.random() * 0.1)),
      flipkart: Math.round(item.sellingPrice * (0.95 + Math.random() * 0.08)),
      mdcomputers: Math.round(item.sellingPrice * (0.90 + Math.random() * 0.12)),
      primeabgb: Math.round(item.sellingPrice * (0.93 + Math.random() * 0.09)),
    };
    
    const competitorAvg = Math.round((competitorPrices.amazon + competitorPrices.flipkart + competitorPrices.mdcomputers + competitorPrices.primeabgb) / 4);
    const recommendedPrice = Math.round((competitorAvg + item.purchasePrice) / 2 * 1.15);
    const profitMargin = ((item.sellingPrice - item.purchasePrice) / item.purchasePrice) * 100;
    
    const priceDiff = item.sellingPrice - competitorAvg;
    let priceStatus: 'Higher' | 'Lower' | 'Optimal' = 'Optimal';
    let priceStatusColor: 'red' | 'yellow' | 'green' = 'green';
    
    if (priceDiff > 1000) {
      priceStatus = 'Higher';
      priceStatusColor = 'red';
    } else if (priceDiff < -500) {
      priceStatus = 'Lower';
      priceStatusColor = 'yellow';
    }
    
    return {
      id: item.id,
      productName: item.productName,
      category: item.category,
      purchasePrice: item.purchasePrice,
      yourPrice: item.sellingPrice,
      competitorAvg,
      ...competitorPrices,
      recommendedPrice,
      profitMargin: Math.round(profitMargin * 10) / 10,
      priceStatus,
      priceStatusColor,
      quantity: item.quantity,
      lastSoldDays: item.lastSoldDate ? Math.floor((new Date().getTime() - new Date(item.lastSoldDate).getTime()) / (1000 * 60 * 60 * 24)) : 999,
      demandScore: 50 + Math.floor(Math.random() * 50),
    };
  });
}

// Generate mock price history for a product
function generateMockPriceHistory(productId: string): PriceHistoryEntry[] {
  const product = inventoryItems.find(p => p.id === productId);
  if (!product) return [];
  
  const basePrice = product.sellingPrice;
  const history: PriceHistoryEntry[] = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const variation = Math.random() * 0.06 - 0.03;
    const competitorVariation = Math.random() * 0.08 - 0.04;
    
    history.push({
      date: date.toISOString().split('T')[0],
      yourPrice: Math.round(basePrice * (1 + variation * 0.5)),
      competitorAvg: Math.round(basePrice * 0.95 * (1 + competitorVariation)),
      amazon: Math.round(basePrice * 0.93 * (1 + competitorVariation)),
      flipkart: Math.round(basePrice * 0.96 * (1 + competitorVariation)),
      mdcomputers: Math.round(basePrice * 0.91 * (1 + competitorVariation)),
    });
  }
  
  return history;
}

// Generate mock AI suggestions
function generateMockSuggestions(): PriceSuggestionsResponse {
  const items = generateMockPriceTracking();
  const sortedByProfit = [...items].sort((a, b) => b.profitMargin - a.profitMargin);
  const sortedByDemand = [...items].sort((a, b) => b.demandScore - a.demandScore);
  
  const bestToSell = sortedByProfit[0];
  const bestToStock = sortedByDemand.find(i => i.quantity <= 10);
  
  return {
    bestToSell: bestToSell ? {
      product: bestToSell.productName,
      productId: bestToSell.id,
      profitMargin: bestToSell.profitMargin,
      demandScore: bestToSell.demandScore,
      currentStock: bestToSell.quantity,
      yourPrice: bestToSell.yourPrice,
      competitorAvg: bestToSell.competitorAvg,
      priceAdvantage: Math.round(((bestToSell.competitorAvg - bestToSell.yourPrice) / bestToSell.competitorAvg) * 100 * 10) / 10,
    } : null,
    bestToStock: bestToStock ? {
      product: bestToStock.productName,
      productId: bestToStock.id,
      profitMargin: bestToStock.profitMargin,
      demandScore: bestToStock.demandScore,
      currentStock: bestToStock.quantity,
    } : null,
    suggestions: items.slice(0, 6).map(item => ({
      product: item.productName,
      type: item.profitMargin > 20 ? 'sell' : item.quantity < 5 ? 'restock' : 'price_reduce' as const,
      reason: item.profitMargin > 20 
        ? `High profit margin (${item.profitMargin}%) with demand score ${item.demandScore}%`
        : item.quantity < 5 
        ? `Low stock (${item.quantity} units) with high demand`
        : `Price optimization opportunity`,
      priority: item.profitMargin > 20 ? 'high' : 'medium' as const,
    })),
    aiInsight: {
      title: "AI Price Intelligence",
      message: `Based on current market analysis, ${bestToSell?.productName || 'NVIDIA RTX 4060'} is the best product to sell now. It has a ${bestToSell?.profitMargin || 25}% profit margin with strong market demand.`,
      recommendation: "Focus on high-margin, high-demand items for maximum profitability.",
    },
    generatedAt: new Date().toISOString(),
  };
}

// Price status badge component
function PriceStatusBadge({ status, color }: { status: string; color: string }) {
  const colors = {
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" },
    yellow: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" },
    green: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" },
  };
  
  const colorStyle = colors[color as keyof typeof colors] || colors.green;
  
  return (
    <span 
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: colorStyle.bg, color: colorStyle.text }}
    >
      {status === 'Higher' && <ArrowUp className="h-3 w-3" />}
      {status === 'Lower' && <ArrowDown className="h-3 w-3" />}
      {status === 'Optimal' && <Minus className="h-3 w-3" />}
      {status}
    </span>
  );
}

export default function PriceTracker() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch price tracking data
  const { data: priceTrackingData, isLoading: trackingLoading, refetch } = useQuery({
    queryKey: queryKeys.priceTracking,
    queryFn: api.getPriceTracking,
    retry: 0,
    staleTime: 60000,
  });

  // Fetch price suggestions
  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: queryKeys.priceSuggestions,
    queryFn: api.getPriceSuggestions,
    retry: 0,
    staleTime: 60000,
  });

  // Fetch price history for selected product
  const { data: priceHistoryData, isLoading: historyLoading } = useQuery({
    queryKey: queryKeys.priceHistory(selectedProduct || ''),
    queryFn: () => api.getPriceHistory(selectedProduct || ''),
    enabled: !!selectedProduct,
    retry: 0,
    staleTime: 30000,
  });

  // Fetch price prediction for selected product
  const { data: predictionData, isLoading: predictionLoading } = useQuery({
    queryKey: queryKeys.pricePredictionDetailed(selectedProduct || ''),
    queryFn: () => api.getPricePredictionDetailed(selectedProduct || ''),
    enabled: !!selectedProduct,
    retry: 0,
    staleTime: 30000,
  });

  // Use mock data as fallback
  const products = priceTrackingData?.products || generateMockPriceTracking();
  const suggestions = suggestionsData || generateMockSuggestions();
  const priceHistory = priceHistoryData?.history || (selectedProduct ? generateMockPriceHistory(selectedProduct) : []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Chart data with predictions
  const chartData = useMemo(() => {
    if (!priceHistory.length) return [];
    
    // Add prediction data
    const baseData = priceHistory.map(h => ({
      ...h,
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Add predicted future dates
    if (predictionData?.predictions) {
      const lastDate = new Date(priceHistory[priceHistory.length - 1]?.date || new Date());
      predictionData.predictions.forEach((pred, idx) => {
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + pred.days);
        baseData.push({
          date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          yourPrice: idx === 0 ? baseData[baseData.length - 1]?.yourPrice : undefined as any,
          competitorAvg: undefined as any,
          predicted: pred.predictedPrice,
        } as any);
      });
    }

    return baseData;
  }, [priceHistory, predictionData]);

  const selectedProductData = selectedProduct ? products.find(p => p.id === selectedProduct) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Price Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Monitor competitor prices, track trends, and get AI-powered pricing recommendations
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={trackingLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${trackingLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                  <DollarSign className="h-5 w-5" style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Optimal Prices</p>
                  <p className="text-lg font-bold text-foreground">
                    {products.filter(p => p.priceStatus === 'Optimal').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                  <ArrowUp className="h-5 w-5" style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overpriced</p>
                  <p className="text-lg font-bold text-foreground">
                    {products.filter(p => p.priceStatus === 'Higher').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
                  <ArrowDown className="h-5 w-5" style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Underpriced</p>
                  <p className="text-lg font-bold text-foreground">
                    {products.filter(p => p.priceStatus === 'Lower').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                  <Package className="h-5 w-5" style={{ color: "#6366F1" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                  <p className="text-lg font-bold text-foreground">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Suggestion Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-6 gradient-primary"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-primary-foreground">{suggestions.aiInsight.title}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-primary-foreground rounded-full">
                  AI Powered
                </span>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-2">{suggestions.aiInsight.message}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best to Sell */}
            {suggestions.bestToSell && (
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-300" />
                  <span className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">Best to Sell Now</span>
                </div>
                <p className="text-lg font-bold text-primary-foreground">{suggestions.bestToSell.product}</p>
                <div className="flex gap-4 mt-2 text-xs text-primary-foreground/80">
                  <span>Margin: {suggestions.bestToSell.profitMargin}%</span>
                  <span>Demand: {suggestions.bestToSell.demandScore}%</span>
                  <span>Stock: {suggestions.bestToSell.currentStock}</span>
                </div>
              </div>
            )}
            
            {/* Best to Stock */}
            {suggestions.bestToStock && (
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">Restock Priority</span>
                </div>
                <p className="text-lg font-bold text-primary-foreground">{suggestions.bestToStock.product}</p>
                <div className="flex gap-4 mt-2 text-xs text-primary-foreground/80">
                  <span>Demand: {suggestions.bestToStock.demandScore}%</span>
                  <span>Stock: {suggestions.bestToStock.currentStock} units</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-10 bg-secondary border-none" 
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-secondary border-none">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Tracking Table */}
        <div className="lg:col-span-2">
          {trackingLoading ? (
            <Skeleton className="h-[500px] rounded-xl" />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="p-5 pb-3 border-b border-border">
                <h3 className="text-sm font-semibold text-card-foreground">All Products - Price Comparison</h3>
                <p className="text-xs text-muted-foreground mt-1">Click on a product to view detailed price history</p>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-secondary/80 backdrop-blur-sm">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Your Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Comp. Avg</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Recommended</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Margin</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr 
                        key={product.id} 
                        className={`border-b border-border/50 transition-colors cursor-pointer hover:bg-secondary/50 ${selectedProduct === product.id ? 'bg-primary/10' : ''}`}
                        onClick={() => setSelectedProduct(product.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-card-foreground">{product.productName}</p>
                            {selectedProduct === product.id && (
                              <ChevronRight className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-medium text-card-foreground">
                          ₹{product.yourPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                          ₹{product.competitorAvg.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-medium text-primary">
                          ₹{product.recommendedPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span 
                            className="font-mono text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{ 
                              color: product.profitMargin > 20 ? "#22C55E" : product.profitMargin > 10 ? "#F59E0B" : "#EF4444",
                              backgroundColor: product.profitMargin > 20 ? "rgba(34, 197, 94, 0.1)" : product.profitMargin > 10 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)"
                            }}
                          >
                            {product.profitMargin}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <PriceStatusBadge status={product.priceStatus} color={product.priceStatusColor} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Price Details Panel */}
        <div className="space-y-4">
          {selectedProduct && selectedProductData ? (
            <>
              {/* Product Info Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-card-foreground mb-3">
                  {selectedProductData.productName}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Your Price</span>
                    <span className="font-mono text-sm font-medium text-foreground">
                      ₹{selectedProductData.yourPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Amazon</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      ₹{selectedProductData.amazon?.toLocaleString() || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Flipkart</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      ₹{selectedProductData.flipkart?.toLocaleString() || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">MD Computers</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      ₹{selectedProductData.mdcomputers?.toLocaleString() || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">PrimeABGB</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      ₹{selectedProductData.primeabgb?.toLocaleString() || '-'}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Recommended</span>
                    <span className="font-mono text-sm font-medium text-primary">
                      ₹{selectedProductData.recommendedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Prediction Card */}
              {predictionData && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Price Prediction
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: predictionData.trend === 'UP' ? "rgba(34, 197, 94, 0.1)" : predictionData.trend === 'DOWN' ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)"
                      }}
                    >
                      {predictionData.trend === 'UP' ? (
                        <TrendingUp className="h-5 w-5" style={{ color: "#22C55E" }} />
                      ) : predictionData.trend === 'DOWN' ? (
                        <TrendingDown className="h-5 w-5" style={{ color: "#EF4444" }} />
                      ) : (
                        <Minus className="h-5 w-5" style={{ color: "#6366F1" }} />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        ₹{predictionData.predictedPrice.toLocaleString()}
                      </p>
                      <p 
                        className="text-xs font-medium"
                        style={{ 
                          color: predictionData.predictedChangePercent > 0 ? "#22C55E" : predictionData.predictedChangePercent < 0 ? "#EF4444" : "#6366F1"
                        }}
                      >
                        {predictionData.predictedChangePercent > 0 ? '+' : ''}{predictionData.predictedChangePercent}% predicted
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Confidence: {predictionData.confidence}%
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a product from the table to view detailed price analysis
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price History Chart */}
      {selectedProduct && priceHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              {selectedProductData?.productName} — Price History & Prediction
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days historical data with AI-predicted future trend
            </p>
          </div>
          
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorYourPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompetitor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={false} 
                tickLine={false}
                interval={4}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: 8, 
                  fontSize: 12 
                }}
                formatter={(value: number) => [`₹${value?.toLocaleString() || '-'}`, '']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="yourPrice" 
                stroke="#22C55E" 
                fill="url(#colorYourPrice)" 
                strokeWidth={2} 
                name="Your Price"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="competitorAvg" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                name="Competitor Avg"
                dot={false}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#F97316" 
                strokeWidth={2} 
                strokeDasharray="6 3" 
                name="Predicted"
                dot={{ fill: '#F97316', strokeWidth: 0, r: 4 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Your Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">Competitor Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-500" style={{ borderStyle: 'dashed', borderWidth: 1 }} />
              <span className="text-xs text-muted-foreground">Predicted (Next 30 days)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Suggestions List */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Pricing Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.suggestions.map((suggestion, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-1.5 rounded-md shrink-0 mt-0.5"
                  style={{
                    backgroundColor: suggestion.priority === 'high' ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)"
                  }}
                >
                  {suggestion.type === 'sell' ? (
                    <TrendingUp className="h-3.5 w-3.5" style={{ color: "#22C55E" }} />
                  ) : suggestion.type === 'restock' ? (
                    <Package className="h-3.5 w-3.5" style={{ color: "#F59E0B" }} />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{suggestion.product}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{suggestion.reason}</p>
                  <span 
                    className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: suggestion.type === 'sell' ? "rgba(34, 197, 94, 0.1)" : suggestion.type === 'restock' ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: suggestion.type === 'sell' ? "#22C55E" : suggestion.type === 'restock' ? "#F59E0B" : "#EF4444"
                    }}
                  >
                    {suggestion.type === 'sell' ? 'Best Seller' : suggestion.type === 'restock' ? 'Restock' : 'Reduce Price'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
