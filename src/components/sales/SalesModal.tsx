import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, TrendingUp, User, Phone, Package, IndianRupee, Minus, Plus, Check, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InventoryItem } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

// TODO: Replace with Neon DB API call → POST /api/sales/record

interface SalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryItem | null;
}

// Mock AI price suggestion
function getMockPriceSuggestion(product: InventoryItem) {
  const aiSuggestedPrice = Math.round(product.sellingPrice * 1.05);
  const competitorAvg = Math.round(product.sellingPrice * 0.97);
  const aiProfitMargin = Math.round(((aiSuggestedPrice - product.purchasePrice) / product.purchasePrice) * 100);
  const marginOptions = [10, 15, 20, 25].map(margin => ({
    margin,
    price: Math.round(product.purchasePrice * (1 + margin / 100)),
  }));
  return {
    aiSuggestedPrice,
    competitorAvg,
    aiProfitMargin,
    demandScore: 72,
    suggestionReason: "Based on current market trends and competitor pricing — slight premium justified by demand.",
    marginOptions,
  };
}

export function SalesModal({ open, onOpenChange, product }: SalesModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [soldPrice, setSoldPrice] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [useAiPrice, setUseAiPrice] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Mock AI price suggestion (no API)
  const priceSuggestion = product ? getMockPriceSuggestion(product) : null;
  const loadingPrice = false;

  // Reset form when product changes
  useEffect(() => {
    if (product && priceSuggestion) {
      setQuantity(1);
      setSoldPrice(priceSuggestion.aiSuggestedPrice);
      setUseAiPrice(true);
    } else if (product) {
      setSoldPrice(product.sellingPrice);
    }
  }, [product]);

  const resetForm = () => {
    setQuantity(1);
    setSoldPrice(0);
    setCustomerName("");
    setCustomerPhone("");
    setUseAiPrice(true);
  };

  const handleSubmit = async () => {
    if (!product) return;
    
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter the customer's name",
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available`,
        variant: "destructive",
      });
      return;
    }

    setIsPending(true);
    try {
      // TODO: Replace with Neon DB API call → POST /api/sales/record
      await new Promise(resolve => setTimeout(resolve, 600));
      toast({
        title: "Sale Recorded! 🎉",
        description: `${product.productName} sold for ₹${soldPrice.toLocaleString()}. Profit: ₹${(soldPrice - product.purchasePrice).toLocaleString()}`,
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error Recording Sale",
        description: "Failed to record sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const profit = soldPrice - (product?.purchasePrice || 0);
  const profitMargin = product?.purchasePrice 
    ? ((profit / product.purchasePrice) * 100).toFixed(1)
    : "0";
  const totalProfit = profit * quantity;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Mark as Sold
          </DialogTitle>
          <DialogDescription>
            Record a sale for {product.productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Product Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{product.productName}</h4>
                  <p className="text-sm text-muted-foreground">{product.brand} • {product.category}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  Stock: {product.quantity}
                </Badge>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span>Purchase: <strong className="text-muted-foreground">₹{product.purchasePrice.toLocaleString()}</strong></span>
                <span>MRP: <strong>₹{product.sellingPrice.toLocaleString()}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
                min={1}
                max={product.quantity}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                of {product.quantity} available
              </span>
            </div>
          </div>

          <Separator />

          {/* AI Price Suggestion */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              AI Suggested Price
            </Label>
            
            {loadingPrice ? (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Getting AI price recommendation...</span>
              </div>
            ) : priceSuggestion ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* AI Recommendation Card */}
                  <Card 
                    className={`cursor-pointer transition-all ${useAiPrice ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                    onClick={() => {
                      setUseAiPrice(true);
                      setSoldPrice(priceSuggestion.aiSuggestedPrice);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">
                              ₹{priceSuggestion.aiSuggestedPrice.toLocaleString()}
                            </span>
                            {useAiPrice && <Check className="h-5 w-5 text-green-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {priceSuggestion.suggestionReason}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0">
                          +{priceSuggestion.aiProfitMargin}% margin
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Competitor avg: ₹{priceSuggestion.competitorAvg.toLocaleString()}</span>
                        <span>Demand: {priceSuggestion.demandScore}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Margin Options */}
                  <div className="grid grid-cols-4 gap-2">
                    {priceSuggestion.marginOptions.map((option) => (
                      <Button
                        key={option.margin}
                        variant={!useAiPrice && soldPrice === option.price ? "default" : "outline"}
                        size="sm"
                        className="flex-col h-auto py-2"
                        onClick={() => {
                          setUseAiPrice(false);
                          setSoldPrice(option.price);
                        }}
                      >
                        <span className="font-bold">{option.margin}%</span>
                        <span className="text-xs">₹{(option.price / 1000).toFixed(1)}k</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-yellow-500/10 rounded-lg text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Unable to get AI suggestion. Using MRP.</span>
              </div>
            )}

            {/* Custom Price */}
            <div className="space-y-2">
              <Label>Or enter custom price</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => {
                    setUseAiPrice(false);
                    setSoldPrice(parseInt(e.target.value) || 0);
                  }}
                  className="pl-9"
                  placeholder="Enter selling price"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div className="space-y-3">
            <Label>Customer Details</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Name *
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sale Summary */}
          <Card className={profit >= 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sale Value</p>
                  <p className="text-2xl font-bold">
                    ₹{(soldPrice * quantity).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Profit</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{totalProfit.toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="secondary" className={profit >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                    {profitMargin}% margin
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubmit}
            disabled={isPending || !customerName.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording Sale...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Sale
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
