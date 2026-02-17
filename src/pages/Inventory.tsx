import { useState } from "react";
import { inventoryItems, InventoryItem } from "@/lib/mock-data";
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function Inventory() {
  const [items, setItems] = useState(inventoryItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = items.filter((item) => {
    const matchSearch = item.productName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleDelete = (id: string) => setItems(items.filter((i) => i.id !== id));

  const totalValue = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">{items.length} products · Total value: ₹{(totalValue / 100000).toFixed(1)}L</p>
        </div>
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
                    <SelectContent>{['CPU','GPU','RAM','SSD','HDD','Motherboard','PSU','Case'].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
            {['CPU','GPU','RAM','SSD','HDD','Motherboard','PSU','Case'].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Purchase</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Selling</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Margin</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Qty</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const margin = (((item.sellingPrice - item.purchasePrice) / item.purchasePrice) * 100).toFixed(1);
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
                      <span className="font-mono text-xs font-medium text-success">{margin}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-card-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
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
