import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">TechStock AI</h1>
            <p className="text-[11px] text-muted-foreground">Inventory Intelligence</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <h2 className="text-lg font-bold text-card-foreground mb-1">Welcome back</h2>
          <p className="text-xs text-muted-foreground mb-5">Sign in to your account</p>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" placeholder="you@store.com" className="mt-1 bg-secondary border-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-secondary border-none pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
              Sign In
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
