import { useState, useEffect, useMemo } from "react";
import { inventoryItems as mockInventoryItems, InventoryItem } from "@/lib/mock-data";
import { Plus, Search, Edit, Trash2, Filter, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Package, ArrowUpCircle, ArrowDownCircle, Sparkles, Clock, DollarSign, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api, { queryKeys, InventoryResponse, InventoryItem as APIInventoryItem } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesModal } from "@/components/sales/SalesModal";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Transform API inventory to local format
function transformAPIItem(item: APIInventoryItem): InventoryItem & { demand?: any; status?: string } {
  return {
    id: item.id,
    productName: item.name,
    category: item.category as any, // Cast to any to avoid strict union type mismatch
    brand: item.brand,
    model: "", // Add missing field if needed or keep existing logic
    purchasePrice: item.purchasePrice,
    sellingPrice: item.sellingPrice,
    quantity: item.quantity,
    distributor: "Distributor",
    purchaseDate: "", // Missing from API
    lastSoldDate: null,
    generation: "", // Missing from API
    demand: item.demand,
    status: item.status,
  };
}

// Get quantity status with color
function getQuantityStatus(quantity: number): { status: string; color: string; bgColor: string } {
  if (quantity === 0) {
    return { status: "Out of Stock", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" };
  } else if (quantity <= 10) {
    return { status: "Low Stock", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" };
  } else {
    return { status: "In Stock", color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.1)" };
  }
}

// Get profit margin color
function getProfitMarginColor(profit: number): { color: string; bgColor: string } {
  if (profit > 2000) {
    return { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.1)" };
  } else if (profit >= 500) {
    return { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" };
  } else {
    return { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" };
  }
}

// Check if item is dead stock (not sold in 30+ days)
function isDeadStock(lastSoldDate: string | undefined | null): boolean {
  if (!lastSoldDate) return true;
  const lastSold = new Date(lastSoldDate);
  const now = new Date();
  const daysSinceLastSold = Math.floor((now.getTime() - lastSold.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceLastSold >= 30;
}

// Get days since last sold
function getDaysSinceLastSold(lastSoldDate: string | undefined | null): number {
  if (!lastSoldDate) return 999;
  const lastSold = new Date(lastSoldDate);
  const now = new Date();
  return Math.floor((now.getTime() - lastSold.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Inventory() {
  const {
    data: inventoryData,
    isLoading,
    refetch
  } = useQuery<InventoryResponse>({
    queryKey: queryKeys.inventory,
    queryFn: api.getInventory,
    refetchInterval: 60000,
    retry: 0,
    staleTime: 60000,
  });

  const [items, setItems] = useState<(InventoryItem & { demand?: any; status?: string })[]>(mockInventoryItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Update items when API data arrives
  useEffect(() => {
    if (inventoryData?.items) {
      setItems(inventoryData.items.map(transformAPIItem));
    }
  }, [inventoryData]);

  // Computed metrics
  const metrics = useMemo(() => {
    const totalProfit = items.reduce((sum, item) => {
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity;
      return sum + profit;
    }, 0);

    const deadStockItems = items.filter(item => isDeadStock(item.lastSoldDate));
    const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 10);
    const outOfStockItems = items.filter(item => item.quantity === 0);

    // Stock More suggestions - high demand or low quantity items that sell well
    const stockMoreItems = items
      .filter(item => {
        const demand = item.demand?.level || 'Medium';
        const profit = item.sellingPrice - item.purchasePrice;
        return ((demand === 'High' || demand === 'Peak') && item.quantity <= 15) ||
          (profit > 2000 && item.quantity <= 10 && !isDeadStock(item.lastSoldDate));
      })
      .slice(0, 4);

    // Reduce Stock suggestions - dead stock or overstock items
    const reduceStockItems = items
      .filter(item => isDeadStock(item.lastSoldDate) || item.quantity > 20)
      .slice(0, 4);

    return {
      totalProfit,
      deadStockCount: deadStockItems.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      deadStockItems,
      stockMoreItems,
      reduceStockItems,
    };
  }, [items]);

  const filtered = items.filter((item) => {
    const matchSearch = item.productName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleDelete = (id: string) => setItems(items.filter((i) => i.id !== id));

  const totalValue = inventoryData?.summary?.totalValue || items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
  const avgMargin = inventoryData?.summary?.avgProfitMargin || 18.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${items.length} products · Total: ₹${(totalValue / 100000).toFixed(1)}L · Avg margin: ${avgMargin}%`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-1.5 font-semibold shadow-glow">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Product Name</Label><Input placeholder="e.g. RTX 4060" className="mt-1 bg-secondary border-none" /></div>
                  <div><Label className="text-xs text-muted-foreground">Category</Label>
                    <Select><SelectTrigger className="mt-1 bg-secondary border-none"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{['CPU', 'GPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'PSU', 'Case'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Purchase Price</Label><Input type="number" placeholder="₹" className="mt-1 bg-secondary border-none" /></div>
                  <div><Label className="text-xs text-muted-foreground">Selling Price</Label><Input type="number" placeholder="₹" className="mt-1 bg-secondary border-none" /></div>
                  <div><Label className="text-xs text-muted-foreground">Quantity</Label><Input type="number" placeholder="0" className="mt-1 bg-secondary border-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Brand</Label><Input placeholder="e.g. NVIDIA" className="mt-1 bg-secondary border-none" /></div>
                  <div><Label className="text-xs text-muted-foreground">Distributor</Label><Input placeholder="e.g. Savex" className="mt-1 bg-secondary border-none" /></div>
                </div>
                <Button className="mt-2 gradient-primary text-primary-foreground font-semibold" onClick={() => setDialogOpen(false)}>Add Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sales Modal Component - kept outside of Select and Dialog */}
      <SalesModal open={salesModalOpen} onOpenChange={setSalesModalOpen} product={selectedProduct} />

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                  <DollarSign className="h-5 w-5" style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Profit</p>
                  <p className="text-lg font-bold text-foreground">₹{(metrics.totalProfit / 1000).toFixed(1)}K</p>
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
                  <Clock className="h-5 w-5" style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dead Stock</p>
                  <p className="text-lg font-bold text-foreground">{metrics.deadStockCount} items</p>
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
                  <AlertTriangle className="h-5 w-5" style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className="text-lg font-bold text-foreground">{metrics.lowStockCount} items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                  <Package className="h-5 w-5" style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                  <p className="text-lg font-bold text-foreground">{metrics.outOfStockCount} items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Inventory Optimization AI Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Stock More Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                  <ArrowUpCircle className="h-4 w-4" style={{ color: "#22C55E" }} />
                </div>
                <span className="text-foreground">Stock More</span>
                <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Suggestion
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {metrics.stockMoreItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No items need restocking</p>
                ) : (
                  metrics.stockMoreItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.brand} · {item.quantity} in stock</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium" style={{ color: "#22C55E" }}>
                          {item.demand?.level === 'Peak' || item.demand?.level === 'High' ? 'High Demand' : 'Fast Seller'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Stock up now</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reduce Stock Card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                  <ArrowDownCircle className="h-4 w-4" style={{ color: "#EF4444" }} />
                </div>
                <span className="text-foreground">Reduce Stock</span>
                <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Suggestion
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {metrics.reduceStockItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No items need reduction</p>
                ) : (
                  metrics.reduceStockItems.map((item, idx) => {
                    const daysSinceLastSold = getDaysSinceLastSold(item.lastSoldDate);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.brand} · {item.quantity} in stock</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium" style={{ color: "#EF4444" }}>
                            {daysSinceLastSold >= 30 ? `${daysSinceLastSold}+ days unsold` : 'Overstock'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Consider discount</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dead Stock Alert Section */}
      {metrics.deadStockItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-2" style={{ borderColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" style={{ color: "#EF4444" }} />
                <span style={{ color: "#EF4444" }}>Dead Stock Alert</span>
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {metrics.deadStockItems.length} products not sold in 30+ days
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {metrics.deadStockItems.slice(0, 6).map((item) => {
                  const daysSinceLastSold = getDaysSinceLastSold(item.lastSoldDate);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.category} · Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold" style={{ color: "#EF4444" }}>
                          {daysSinceLastSold === 999 ? 'Never sold' : `${daysSinceLastSold} days`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">unsold</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-none" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-secondary border-none">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {['CPU', 'GPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'PSU', 'Case'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Purchase</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Selling</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Profit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Qty</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Stock Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Last Sold</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const profit = item.sellingPrice - item.purchasePrice;
                  const profitColor = getProfitMarginColor(profit);
                  const quantityStatus = getQuantityStatus(item.quantity);
                  const daysSinceLastSold = getDaysSinceLastSold(item.lastSoldDate);
                  const isItemDeadStock = isDeadStock(item.lastSoldDate);

                  return (
                    <tr key={item.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-card-foreground">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground">{item.brand} · {item.distributor}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{item.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">₹{item.purchasePrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-card-foreground font-medium">₹{item.sellingPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="font-mono text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ color: profitColor.color, backgroundColor: profitColor.bgColor }}
                        >
                          ₹{profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="font-mono text-xs font-bold px-2 py-1 rounded-md"
                          style={{ color: quantityStatus.color, backgroundColor: quantityStatus.bgColor }}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                          style={{ color: quantityStatus.color, backgroundColor: quantityStatus.bgColor }}
                        >
                          {quantityStatus.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-xs font-medium"
                          style={{ color: isItemDeadStock ? "#EF4444" : "#22C55E" }}
                        >
                          {daysSinceLastSold === 999 ? 'Never' : `${daysSinceLastSold}d ago`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                            setSelectedProduct(item);
                            setSalesModalOpen(true);
                          }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}