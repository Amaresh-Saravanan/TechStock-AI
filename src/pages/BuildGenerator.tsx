import { useState } from "react";
import { PCBuild } from "@/lib/mock-data";
import { Cpu, MonitorSpeaker, HardDrive, Zap, CircuitBoard, MemoryStick, Loader2, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";



// Extended interface for AI builds
interface AIBuild extends PCBuild {
  description?: string;
  source?: 'AI' | 'Rule-Based';
  case?: string;
}

export default function BuildGenerator() {
  const [purpose, setPurpose] = useState("Gaming");
  const [budget, setBudget] = useState("100000");
  const [results, setResults] = useState<AIBuild[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const b = parseInt(budget) || 100000;
      // TODO: Replace with real AI call → POST /api/generate-build
      await new Promise(resolve => setTimeout(resolve, 900));
      
      // Generate mock build based on purpose and budget
      const build: AIBuild = {
        id: Date.now().toString(),
        name: `${purpose} Build — ₹${b.toLocaleString()}`,
        purpose,
        description: `Optimized ${purpose.toLowerCase()} PC for ₹${b.toLocaleString()} budget with best price-to-performance components.`,
        cpu: b >= 60000 ? 'AMD Ryzen 7 7700X' : 'Intel Core i5-13400F',
        gpu: purpose === 'Office' ? 'Intel UHD 730 (Integrated)' : b >= 80000 ? 'NVIDIA RTX 4060 Ti' : b >= 50000 ? 'NVIDIA RTX 4060' : 'AMD RX 7600',
        ram: b >= 80000 ? 'Corsair Vengeance DDR5 32GB 5600MHz' : 'G.Skill Ripjaws DDR4 16GB 3200MHz',
        storage: b >= 80000 ? 'Samsung 990 Pro 2TB NVMe' : 'WD Black SN770 1TB NVMe',
        motherboard: b >= 80000 ? 'ASUS ROG Strix B650E-F ATX' : 'MSI MAG B550 TOMAHAWK ATX',
        psu: b >= 80000 ? 'Corsair RM850x 850W Gold' : 'Seasonic Focus GX-650 650W Gold',
        totalPrice: Math.round(b * 0.95),
        source: 'AI',
        case: 'NZXT H510 Mid-Tower',
      };
      setResults([build]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate build. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          PC Build Generator
          <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> AI Powered
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">Get custom PC recommendations powered by real-time AI analysis.</p>
      </div>

      {/* Generator Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Purpose</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger className="mt-1 bg-secondary border-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Office">Office / Productivity</SelectItem>
                <SelectItem value="Editing">Video Editing / 3D</SelectItem>
                <SelectItem value="Streaming">Streaming</SelectItem>
                <SelectItem value="Programming">Programming / Dev</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Max Budget (₹)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-1 bg-secondary border-none font-mono" />
          </div>
          <Button
            onClick={generate}
            disabled={isLoading}
            className="gradient-primary text-primary-foreground font-semibold shadow-glow gap-1.5 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Generate Build
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {results.map((build, i) => (
            <motion.div key={build.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-glow">

              {/* Header */}
              <div className="p-6 border-b border-border bg-secondary/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                      {build.name}
                      {build.source === 'AI' && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                          <Bot className="w-3 h-3" /> AI Generated
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{build.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary font-mono">₹{build.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Est. Total Cost</p>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Cpu, label: 'CPU', value: build.cpu },
                  { icon: MonitorSpeaker, label: 'GPU', value: build.gpu },
                  { icon: MemoryStick, label: 'RAM', value: build.ram },
                  { icon: HardDrive, label: 'Storage', value: build.storage },
                  { icon: CircuitBoard, label: 'Motherboard', value: build.motherboard },
                  { icon: Zap, label: 'PSU', value: build.psu },
                  { icon: CircuitBoard, label: 'Case', value: build.case || 'Standard ATX Case' },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-start gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                    <div className="mt-1 p-1.5 rounded-md bg-background shadow-sm shrink-0">
                      <spec.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-0.5">{spec.label}</span>
                      <span className="text-sm font-medium text-card-foreground block leading-tight">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setResults([])}>Clear</Button>
                <Button size="sm" className="bg-primary text-primary-foreground">Save Build</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
          <div className="h-16 w-16 rounded-full bg-secondary/80 flex items-center justify-center mb-4">
            <Cpu className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Generate your perfect PC</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Select your primary usage and budget above, and our AI will configure the best price-to-performance build for you.
          </p>
        </div>
      )}
    </div>
  );
}
