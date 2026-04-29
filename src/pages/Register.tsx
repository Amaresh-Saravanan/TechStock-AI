import { useState, FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [role, setRole] = useState("retailer");
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const from = location.state?.from?.pathname || "/dashboard";

  // TODO: Backend call handled in AuthContext
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !storeName || !role) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Simulate brief loading state
      await new Promise(resolve => setTimeout(resolve, 600));
      register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
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
          <h2 className="text-lg font-bold text-card-foreground mb-1">Create account</h2>
          <p className="text-xs text-muted-foreground mb-5">Get started with TechStock AI</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md">
                {error}
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input 
                placeholder="Rahul Sharma" 
                className="mt-1 bg-secondary border-none text-white" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input 
                type="email" 
                placeholder="you@store.com" 
                className="mt-1 bg-secondary border-none text-white" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="bg-secondary border-none pr-10 text-white" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" disabled={isSubmitting}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Store Name</Label>
                <Input 
                  placeholder="TechZone" 
                  className="mt-1 bg-secondary border-none text-white" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
                  <SelectTrigger className="mt-1 bg-secondary border-none text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retailer">Retailer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
