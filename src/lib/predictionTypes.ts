// ─── Prediction Types ─────────────────────────────────────────────────────────
// Shared types used by predictionService.ts and BuyTiming.tsx.
// These types define the contract between the data layer and the UI.
// They NEVER change — whether the data comes from mock or live APIs.

/** A single point on the 30-day historical price chart (real data). */
export interface PriceHistoryPoint {
  date: string;           // "YYYY-MM-DD"
  price: number;          // actual price in ₹
  source: "amazon" | "flipkart" | "mock";
}

/** A single point on the AI prediction chart (next 30 days). */
export interface PredictionPoint {
  date: string;           // "YYYY-MM-DD" future date
  predictedPrice: number;
  lowerBound: number;     // 95% confidence lower range
  upperBound: number;     // 95% confidence upper range
}

/** Full AI prediction result for one product. */
export interface ProductPrediction {
  productId: string;
  productName: string;
  category: string;
  amazonAsin?: string;

  // Price data
  currentPrice: number;
  priceHistory: PriceHistoryPoint[];    // last 30 days (real / mock)
  predictedPrices: PredictionPoint[];   // next 30 days (AI / mock)

  // AI recommendation
  recommendation: "BUY NOW" | "WAIT" | "HOLD";
  predictedPrice30Days: number;
  priceChangePercent: number;           // e.g. -8.5 or +3.2
  confidence: number;                   // 0–100
  reasoning: string;                    // Gemini's explanation
  keyFactors: string[];                 // e.g. ["RTX 50 series launch"]
  waitDays?: number;                    // only present when recommendation === "WAIT"
  bestBuyDate?: string;                 // "YYYY-MM-DD" if WAIT

  // Meta
  totalUnitsSold?: number;        // computed from sales data (context for UI)
  dataSource: "mock" | "live";
  lastUpdated: Date;
}

/** The full response returned by fetchTop5Predictions(). */
export interface Top5Predictions {
  products: ProductPrediction[];
  generatedAt: Date;
  dataSource: "mock" | "live";
}
