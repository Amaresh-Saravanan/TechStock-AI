import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products, categories..."
          className="pl-10 bg-secondary border-none text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
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
