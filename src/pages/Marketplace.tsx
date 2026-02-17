import { ShoppingCart, Star, TrendingDown } from "lucide-react";
import { marketplaceItems } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Marketplace() {
  const getDiscountPercent = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find the best deals from verified vendors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketplaceItems.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group"
          >
            {/* Product Image Placeholder */}
            <div className="h-32 bg-secondary rounded-lg mb-4 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                {item.originalPrice > item.price && (
                  <Badge variant="destructive" className="text-xs">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {getDiscountPercent(item.originalPrice, item.price)}% OFF
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                {item.name}
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm text-muted-foreground">
                    {item.rating}
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {item.seller}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  ₹{item.price.toLocaleString()}
                </span>
                {item.originalPrice > item.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{item.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {item.stock} units available
              </p>

              <Button className="w-full mt-2 gradient-primary border-0 text-primary-foreground">
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
