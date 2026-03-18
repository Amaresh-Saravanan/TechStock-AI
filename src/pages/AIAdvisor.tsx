import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Lightbulb, Loader2 } from "lucide-react";
import { marketInsights } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const loadingId = Date.now();
    setMessages((prev) => [...prev, { role: "ai", content: "", isLoading: true }]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev.filter(m => !(m.isLoading && m.role === "ai")),
        { role: "ai", content: data.response, isLoading: false }
      ]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Connection error";
      setMessages((prev) => [
        ...prev.filter(m => !(m.isLoading && m.role === "ai")),
        { 
          role: "ai", 
          content: `⚠️ Couldn't connect to AI service. Make sure the backend is running:\n\n\`python app.py\` in the backend folder\n\nError: ${errorMsg}`,
          isLoading: false 
        }
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
            <div className="px-4 pb-3 flex flex-wrap gap-2">
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
          <div className="p-4 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && send()}
              placeholder="Ask about profit, inventory, pricing..."
              disabled={isLoading}
              className="flex-1 h-10 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
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
