import { useState } from "react";
import { pcBuilds, PCBuild } from "@/lib/mock-data";
import { Cpu, MonitorSpeaker, HardDrive, Zap, CircuitBoard, MemoryStick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function BuildGenerator() {
  const [purpose, setPurpose] = useState("Gaming");
  const [budget, setBudget] = useState("150000");
  const [results, setResults] = useState<PCBuild[]>([]);

  const generate = () => {
    const b = parseInt(budget) || 999999;
    setResults(pcBuilds.filter((build) => build.purpose === purpose && build.totalPrice <= b));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">PC Build Generator</h1>
        <p className="text-sm text-muted-foreground">AI-powered build recommendations based on budget and purpose.</p>
      </div>

      {/* Generator Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Purpose</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger className="mt-1 bg-secondary border-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Editing">Content Creation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Max Budget (₹)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-1 bg-secondary border-none font-mono" />
          </div>
          <Button onClick={generate} className="gradient-primary text-primary-foreground font-semibold shadow-glow gap-1.5">
            <Zap className="h-4 w-4" /> Generate Builds
          </Button>
        </div>
      </motion.div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {results.map((build, i) => (
            <motion.div key={build.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-glow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-card-foreground">{build.name}</h3>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{build.purpose}</span>
                </div>
                <p className="text-xl font-bold text-primary font-mono">₹{build.totalPrice.toLocaleString()}</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: Cpu, label: 'CPU', value: build.cpu },
                  { icon: MonitorSpeaker, label: 'GPU', value: build.gpu },
                  { icon: MemoryStick, label: 'RAM', value: build.ram },
                  { icon: HardDrive, label: 'Storage', value: build.storage },
                  { icon: CircuitBoard, label: 'Motherboard', value: build.motherboard },
                  { icon: Zap, label: 'PSU', value: build.psu },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
                    <spec.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground w-20">{spec.label}</span>
                    <span className="text-xs font-medium text-card-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
          <Cpu className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Select purpose & budget, then click Generate</p>
        </div>
      )}
    </div>
  );
}
