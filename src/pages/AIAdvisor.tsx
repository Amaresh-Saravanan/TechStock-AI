import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Lightbulb } from "lucide-react";
import { marketInsights } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

const cannedResponses: Record<string, string> = {
  profit:
    "Based on your current inventory, the top profit opportunities are:\n\n1. **Logitech G Pro X Superlight** — 50.5% margin\n2. **Kingston Fury Beast DDR5** — 53.3% margin\n3. **Corsair Vengeance DDR5 32GB** — 44.9% margin\n\nConsider increasing stock of these high-margin items.",
  gpu: "GPU market analysis: RTX 4090 prices are trending down (-8% in 30 days). RTX 5090 launch will accelerate this. Recommendation: Reduce RTX 40-series inventory, wait for RTX 50-series to establish pricing.",
  stock:
    "You have 2 items out of stock: AMD RX 7900 XTX and Razer Huntsman V3 Pro. The RX 7900 XTX has declining demand — consider dropping it. The Huntsman V3 Pro has strong demand — reorder immediately.",
  default:
    "I can help you with inventory analysis, pricing strategies, vendor recommendations, and profit optimization. Try asking about:\n• Top profit opportunities\n• GPU market trends\n• Stock alerts and reorder suggestions",
};

export default function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "Hello! I'm your AI Profit Advisor. Ask me about inventory optimization, pricing strategies, or profit opportunities.",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;

    const userMessage = input.trim().toLowerCase();
    setMessages((prev) => [...prev, { role: "user", content: input.trim() }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let response = cannedResponses.default;
      if (userMessage.includes("profit")) response = cannedResponses.profit;
      else if (userMessage.includes("gpu") || userMessage.includes("graphics"))
        response = cannedResponses.gpu;
      else if (userMessage.includes("stock") || userMessage.includes("inventory"))
        response = cannedResponses.stock;

      setMessages((prev) => [...prev, { role: "ai", content: response }]);
    }, 800);
  };

  const getScoreColor = (score: string) => {
    if (score === "High") return "text-success bg-success/10";
    if (score === "Medium") return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Profit Advisor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get AI-powered insights for your business
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Insights */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Market Insights
          </h2>
          {marketInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground text-sm">
                  {insight.title}
                </h3>
                <Badge className={getScoreColor(insight.score)}>
                  {insight.score}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {insight.description}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {insight.category}
              </span>
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col h-[600px]">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">AI Assistant</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about profits, pricing, or inventory..."
              className="flex-1 h-10 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={send}
              className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
