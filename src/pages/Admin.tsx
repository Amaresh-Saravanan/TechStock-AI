import { motion } from "framer-motion";
import { Users, Package, BarChart3, Shield } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

const users = [
  { name: 'Rahul Sharma', email: 'rahul@techzone.in', role: 'retailer', store: 'TechZone Mumbai', joined: '2024-08-15' },
  { name: 'Priya Patel', email: 'priya@compuhub.in', role: 'retailer', store: 'CompuHub Pune', joined: '2024-09-22' },
  { name: 'Admin User', email: 'admin@techstock.ai', role: 'admin', store: 'System', joined: '2024-01-01' },
  { name: 'Vikram Singh', email: 'vikram@distribute.in', role: 'distributor', store: 'Savex Technologies', joined: '2024-10-05' },
];

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">System overview and user management.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="4" icon={Users} />
        <StatCard title="Active Stores" value="3" icon={Package} />
        <StatCard title="Total Products" value="148" icon={BarChart3} />
        <StatCard title="System Health" value="99.9%" change="All services running" changeType="up" icon={Shield} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-card-foreground">User Management</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Store</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                <td className="px-5 py-3 font-medium text-card-foreground">{u.name}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    u.role === 'admin' ? 'bg-destructive/10 text-destructive' : u.role === 'distributor' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                  }`}>{u.role}</span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{u.store}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
