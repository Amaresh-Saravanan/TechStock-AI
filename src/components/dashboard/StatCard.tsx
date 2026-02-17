import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:shadow-glow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-card-foreground tracking-tight">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${
              changeType === 'up' ? 'text-success' : changeType === 'down' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
