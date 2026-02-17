import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and store preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-card-foreground">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input defaultValue="Rahul Sharma" className="mt-1 bg-secondary border-none" /></div>
          <div><Label className="text-xs text-muted-foreground">Email</Label><Input defaultValue="rahul@techzone.in" className="mt-1 bg-secondary border-none" /></div>
          <div><Label className="text-xs text-muted-foreground">Store Name</Label><Input defaultValue="TechZone Mumbai" className="mt-1 bg-secondary border-none" /></div>
          <div><Label className="text-xs text-muted-foreground">Location</Label><Input defaultValue="Mumbai, India" className="mt-1 bg-secondary border-none" /></div>
        </div>
        <Button className="gradient-primary text-primary-foreground font-semibold shadow-glow">Save Changes</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-card-foreground">Dead Stock Threshold</h3>
        <p className="text-xs text-muted-foreground">Mark products as dead stock after this many days unsold.</p>
        <Input type="number" defaultValue="90" className="max-w-[120px] bg-secondary border-none font-mono" />
      </motion.div>
    </div>
  );
}
