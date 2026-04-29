import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Lightbulb, Loader2 } from "lucide-react";
import { marketInsights } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoicePanel } from "@/components/advisor/InvoicePanel";
import { KhataPanel } from "@/components/advisor/KhataPanel";
import { WarrantyPanel } from "@/components/advisor/WarrantyPanel";
import { SupplierPanel } from "@/components/advisor/SupplierPanel";
import { PLPanel } from "@/components/advisor/PLPanel";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  isLoading?: boolean;
}

const QUICK_PROMPTS = [
  "What should I restock?",
  "Show me trending products",
  "Any dead stock?",
  "Profit recommendations",
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "👋 Hello! I'm your AI Profit Advisor. Ask me about **inventory optimization**, **pricing strategies**, **restocking**, **profit opportunities**, or **market trends**.\n\nTry: 'What should I restock?' or 'Show trending products'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage = text.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Add loading placeholder
    setMessages((prev) => [...prev, { role: "ai", content: "", isLoading: true }]);

    try {
      // TODO: Replace with real AI call → POST /api/chat or Gemini API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock response based on query keywords
      const lower = userMessage.toLowerCase();
      let response = "Thanks for your question! I'm currently running on mock data. Connect the backend to get real AI insights.";
      
      if (lower.includes('restock') || lower.includes('stock')) {
        response = "📦 **Restock Suggestions:**\n\n- **NVIDIA RTX 4060** — High demand, only 20 units left. Stock up now.\n- **Corsair Vengeance DDR5** — Fast moving, 5 units sold this week.\n- **AMD Ryzen 7 7800X3D** — Supply constraints expected, prices rising.";
      } else if (lower.includes('trend') || lower.includes('trending')) {
        response = "📈 **Trending Products:**\n\n1. **NVIDIA RTX 4060** — Fastest selling GPU this month\n2. **AMD Ryzen 7 7800X3D** — Gaming CPU demand peaking\n3. **DDR5 RAM** — 40% MoM growth in demand";
      } else if (lower.includes('dead') || lower.includes('slow')) {
        response = "⚠️ **Dead Stock Alert:**\n\n- **AMD RX 7900 XTX** — 130+ days unsold. Consider 10% discount.\n- **WD Blue 1TB HDD** — HDD demand declining. Clear inventory.\n- **Intel Core i9-14900K** — Overpriced vs. market. Price match recommended.";
      } else if (lower.includes('profit') || lower.includes('margin')) {
        response = "💰 **Profit Recommendations:**\n\n- **GPU category** leads with 22.4% avg margin\n- **CPU category** at 18.7% — room to optimize pricing\n- Consider bundling slow-moving HDDs with SSDs to clear stock\n- Price match on RTX 4060 can increase velocity by ~30%";
      }
      
      setMessages((prev) => [
        ...prev.filter(m => !(m.isLoading && m.role === "ai")),
        { role: "ai", content: response, isLoading: false }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter(m => !(m.isLoading && m.role === "ai")),
        { role: "ai", content: "Something went wrong. Please try again.", isLoading: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: string) => {
    if (score === "High") return "text-success bg-success/10";
    if (score === "Medium") return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  };

  const handleQuickPrompt = (prompt: string) => {
    send(prompt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Profit Advisor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get AI-powered insights for your business
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT PANEL — Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="insights" className="text-xs">💡 Insights</TabsTrigger>
              <TabsTrigger value="invoice" className="text-xs">🧾 Invoice</TabsTrigger>
              <TabsTrigger value="khata" className="text-xs">📒 Khata</TabsTrigger>
            </TabsList>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="warranty" className="text-xs">🛡️ Warranty</TabsTrigger>
              <TabsTrigger value="suppliers" className="text-xs">🏭 Suppliers</TabsTrigger>
              <TabsTrigger value="pl" className="text-xs">📊 P&L</TabsTrigger>
            </TabsList>

            {/* Market Insights — existing content, unchanged */}
            <TabsContent value="insights">
              <div className="space-y-4">
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
            </TabsContent>

            {/* New feature tabs */}
            <TabsContent value="invoice"><InvoicePanel /></TabsContent>
            <TabsContent value="khata"><KhataPanel /></TabsContent>
            <TabsContent value="warranty"><WarrantyPanel /></TabsContent>
            <TabsContent value="suppliers"><SupplierPanel /></TabsContent>
            <TabsContent value="pl"><PLPanel /></TabsContent>
          </Tabs>
        </div>

        {/* RIGHT PANEL — Chat Interface (always visible, completely unchanged) */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-border flex flex-col h-[600px] w-full">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">AI Assistant</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-2 w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && send()}
              placeholder="Ask about profit..."
              disabled={isLoading}
              className="flex-1 w-full h-10 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
