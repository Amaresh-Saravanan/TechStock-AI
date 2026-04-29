import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, Sun, Moon, Package, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { inventoryItems } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// TODO: Replace with Neon DB API call → GET /api/inventory (for search)

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Use mock inventory items for search
  const products = inventoryItems;
  
  const displayProducts = searchQuery.trim() 
    ? products.filter(product => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          product.productName.toLowerCase().includes(lowerQuery) ||
          product.category.toLowerCase().includes(lowerQuery) ||
          product.brand.toLowerCase().includes(lowerQuery)
        );
      }).slice(0, 5)
    : products.slice(0, 5); // Default suggested products when empty

  // Handle clicking outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="relative w-80 max-w-md" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder="Search products, categories..."
          className="pl-10 bg-secondary border-none text-sm relative z-10"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
        />
        
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50 flex flex-col"
            >
              <div className="max-h-[350px] overflow-y-auto">
                {displayProducts.length > 0 ? (
                  <div className="p-2 flex flex-col">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {searchQuery.trim() ? "Search Results" : "Suggested Products"}
                    </p>
                    {displayProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchOpen(false);
                          navigate('/inventory');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none mb-1 group-hover:text-primary transition-colors">
                              {product.productName}
                            </p>
                            <p className="text-xs text-muted-foreground flex gap-2">
                              <span>{product.category}</span>
                              <span>•</span>
                              <span>{product.brand}</span>
                              <span>•</span>
                              <span>₹{product.sellingPrice.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-secondary"
          title={`Switch to Theme ${theme === "A" ? "B" : "A"}`}
        >
          {theme === "A" ? (
            <>
              <Moon className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline text-muted-foreground">Dark</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 text-warning" />
              <span className="hidden sm:inline text-muted-foreground">Light</span>
            </>
          )}
        </button>

        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary">
            <User className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Rahul Sharma</p>
            <p className="text-[10px] text-muted-foreground">Retailer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
