import { Clock, TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { buyTimingItems, buyTimingChartData } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function BuyTiming() {
  const getRecommendationStyle = (rec: string) => {
    if (rec === "BUY NOW")
      return "bg-success/10 text-success border-success/20";
    if (rec === "WAIT")
      return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-warning/10 text-warning border-warning/20";
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec === "BUY NOW") return TrendingUp;
    if (rec === "WAIT") return TrendingDown;
    return Minus;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Buy Timing Intelligence
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered purchase timing recommendations
        </p>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Price Prediction Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={buyTimingChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`₹${value?.toLocaleString()}`, ""]}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--warning))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--warning))" }}
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buyTimingItems.map((item) => {
          const Icon = getRecommendationIcon(item.recommendation);
          return (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">{item.product}</h3>
                <Badge
                  className={`${getRecommendationStyle(item.recommendation)} border`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {item.recommendation}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="text-lg font-semibold text-foreground">
                    ₹{item.currentPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Predicted</p>
                  <p
                    className={`text-lg font-semibold ${
                      item.predictedPrice < item.currentPrice
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    ₹{item.predictedPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.confidence}% confidence
                </div>
                {item.daysToWait && (
                  <span>• Wait {item.daysToWait} days</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
