import { alerts as mockAlerts } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Package, Shield, Bell, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api, { queryKeys, Alert } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, any> = {
  price_drop: TrendingDown,
  dead_stock: Package,
  low_stock: AlertTriangle,
  warranty_expiry: Shield,
};

export default function Alerts() {
  const { 
    data: alertsData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: queryKeys.alerts,
    queryFn: api.getAlerts,
    refetchInterval: 30000,
    retry: 0,
    staleTime: 30000,
  });

  // Merge API alerts with mock alerts as fallback
  const alerts: (Alert | any)[] = alertsData?.alerts || mockAlerts;
  const unread = alertsData?.summary?.unread || alerts.filter((a: any) => !a.read).length;
  const criticalCount = alertsData?.summary?.critical || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Price Alerts</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading alerts..." : `${unread} unread alerts${criticalCount > 0 ? `, ${criticalCount} critical` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-glow">
            <Bell className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No alerts at the moment</p>
          </div>
        ) : (
          alerts.map((alert: any, i: number) => {
            const alertType = alert.alertType || alert.type;
            const Icon = iconMap[alertType] || AlertTriangle;
            const createdAt = typeof alert.createdAt === 'string' && alert.createdAt.includes('T')
              ? new Date(alert.createdAt).toLocaleString()
              : alert.createdAt;
              
            return (
              <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md ${
                  !alert.read ? 'border-primary/20 shadow-glow' : 'border-border'
                }`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  alertType === 'price_drop' ? 'bg-destructive/10' : alertType === 'dead_stock' ? 'bg-warning/10' : alertType === 'low_stock' ? 'bg-destructive/10' : 'bg-primary/10'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    alertType === 'price_drop' ? 'text-destructive' : alertType === 'dead_stock' ? 'text-warning' : alertType === 'low_stock' ? 'text-destructive' : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">{alert.productName}</p>
                    {!alert.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{createdAt}</p>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  alertType === 'price_drop' ? 'bg-destructive/10 text-destructive' : alertType === 'dead_stock' ? 'bg-warning/10 text-warning' : alertType === 'low_stock' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`}>
                  {alertType?.replace('_', ' ').toUpperCase()}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
