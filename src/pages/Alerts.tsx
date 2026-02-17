import { alerts } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Package, Shield, Bell } from "lucide-react";

const iconMap = {
  price_drop: TrendingDown,
  dead_stock: Package,
  low_stock: AlertTriangle,
  warranty_expiry: Shield,
};

const colorMap = {
  price_drop: 'destructive',
  dead_stock: 'warning',
  low_stock: 'primary',
  warranty_expiry: 'chart-4',
};

export default function Alerts() {
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Price Alerts</h1>
          <p className="text-sm text-muted-foreground">{unread} unread alerts requiring your attention.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-glow">
          <Bell className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.alertType];
          return (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md ${
                !alert.read ? 'border-primary/20 shadow-glow' : 'border-border'
              }`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                alert.alertType === 'price_drop' ? 'bg-destructive/10' : alert.alertType === 'dead_stock' ? 'bg-warning/10' : 'bg-primary/10'
              }`}>
                <Icon className={`h-4 w-4 ${
                  alert.alertType === 'price_drop' ? 'text-destructive' : alert.alertType === 'dead_stock' ? 'text-warning' : 'text-primary'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-card-foreground">{alert.productName}</p>
                  {!alert.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{alert.createdAt}</p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                alert.alertType === 'price_drop' ? 'bg-destructive/10 text-destructive' : alert.alertType === 'dead_stock' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
              }`}>
                {alert.alertType.replace('_', ' ').toUpperCase()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
