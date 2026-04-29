import type {
  PriceHistoryPoint,
  PredictionPoint,
  ProductPrediction,
  Top5Predictions,
} from "./predictionTypes";
import { mockSalesEntries, inventoryItems } from "./mock-data";

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER A — MOCK DATA FUNCTIONS (active now)
// To connect real data, replace each function BODY only (never the signature).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Returns the top 5 products to analyse.
 * FUTURE: replace body with → GET /api/products?sort=sales&limit=5
 */
async function getTop5Products_MOCK(): Promise<
  {
    productId: string;
    productName: string;
    category: string;
    currentPrice: number;
    amazonAsin?: string;
    totalUnitsSold: number;
  }[]
> {
  // STEP 1: Count total units sold per product name
  const salesCount: Record<string, number> = {};
  mockSalesEntries.forEach((sale) => {
    salesCount[sale.productName] = (salesCount[sale.productName] ?? 0) + sale.quantity;
  });

  // STEP 2: Rank inventory items by total units sold (desc)
  const ranked = inventoryItems
    .map((item) => ({
      ...item,
      totalUnitsSold: salesCount[item.productName] ?? 0,
    }))
    .sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);

  // STEP 3: Take top 5
  return ranked.slice(0, 5).map((p) => ({
    productId: p.id,
    productName: p.productName,
    category: p.category,
    currentPrice: p.sellingPrice,
    amazonAsin: undefined, // will come from DB later
    totalUnitsSold: p.totalUnitsSold,
  }));
  // FUTURE: replace body with →
  // const res = await fetch('/api/products/top-selling?limit=5');
  // return res.json();
}

/**
 * Returns 30-day price history for a product.
 * FUTURE: replace body with → getPriceHistory_REAL(product.amazonAsin)
 */
async function getPriceHistory_MOCK(
  _productId: string,
  currentPrice: number
): Promise<PriceHistoryPoint[]> {
  const history: PriceHistoryPoint[] = [];
  const today = new Date();
  let price = currentPrice * 1.08; // start slightly higher 30 days ago

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Random ±1.5% daily variance with a slight downward trend
    price = price * (1 + Math.random() * 0.03 - 0.018);
    price = Math.round(price / 10) * 10; // round to nearest ₹10
    history.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price),
      source: "mock",
    });
  }
  return history;
}

/**
 * Returns AI recommendation + predicted future prices.
 * FUTURE: replace body with → getGeminiPrediction_REAL(...)
 */
async function getGeminiPrediction_MOCK(
  _productName: string,
  category: string,
  currentPrice: number,
  priceHistory: PriceHistoryPoint[]
): Promise<{
  recommendation: "BUY NOW" | "WAIT" | "HOLD";
  predictedPrice30Days: number;
  priceChangePercent: number;
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  waitDays?: number;
  bestBuyDate?: string;
  predictedPrices: PredictionPoint[];
}> {
  // Simulate AI latency (makes it feel authentic)
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));

  // Derive a simple linear trend from the 30-day history
  const firstPrice = priceHistory[0]?.price ?? currentPrice;
  const lastPrice = priceHistory[priceHistory.length - 1]?.price ?? currentPrice;
  const trend = (lastPrice - firstPrice) / firstPrice;

  // Generate 30-day future prediction points (every 3 days)
  const today = new Date();
  const predictedPrices: PredictionPoint[] = [];
  let futurePrice = currentPrice;

  for (let i = 1; i <= 30; i += 3) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    futurePrice =
      futurePrice * (1 + trend * 0.1 + (Math.random() * 0.01 - 0.005));
    futurePrice = Math.round(futurePrice / 10) * 10;
    predictedPrices.push({
      date: date.toISOString().split("T")[0],
      predictedPrice: Math.round(futurePrice),
      lowerBound: Math.round(futurePrice * 0.95),
      upperBound: Math.round(futurePrice * 1.05),
    });
  }

  const finalPrice =
    predictedPrices[predictedPrices.length - 1].predictedPrice;
  const changePercent = ((finalPrice - currentPrice) / currentPrice) * 100;

  let recommendation: "BUY NOW" | "WAIT" | "HOLD";
  if (changePercent > 3) recommendation = "BUY NOW";
  else if (changePercent < -5) recommendation = "WAIT";
  else recommendation = "HOLD";

  const reasoningMap: Record<string, string> = {
    GPU: "New GPU generation launch expected. Current gen prices are softening.",
    CPU: "Strong demand with limited supply. Prices are trending upward short-term.",
    RAM: "Stable market. Minor fluctuations expected over the next 30 days.",
    SSD: "Oversupply in NAND market is driving prices down steadily.",
    Motherboard: "Platform maturity means prices are stabilising near current levels.",
  };

  return {
    recommendation,
    predictedPrice30Days: finalPrice,
    priceChangePercent: Math.round(changePercent * 10) / 10,
    confidence: Math.round(70 + Math.random() * 25),
    reasoning:
      reasoningMap[category] ??
      "Price trend analysis suggests current levels are stable.",
    keyFactors: [
      `${Math.abs(changePercent).toFixed(1)}% ${changePercent > 0 ? "increase" : "decrease"} predicted`,
      `30-day trend: ${trend > 0 ? "Upward" : "Downward"}`,
      `Market: ${category} segment`,
    ],
    waitDays: recommendation === "WAIT" ? 30 : undefined,
    bestBuyDate:
      recommendation === "WAIT"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        : undefined,
    predictedPrices,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER B — REAL API STUBS (uncomment when ready to connect)
// ═══════════════════════════════════════════════════════════════════════════════

// TODO FUTURE — REAL GEMINI API CALL
// Uncomment this block and swap the call in fetchTop5Predictions when ready.
//
// async function getGeminiPrediction_REAL(
//   productName: string,
//   category: string,
//   currentPrice: number,
//   priceHistory: PriceHistoryPoint[]
// ) {
//   const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
//   const MODEL    = import.meta.env.VITE_GEMINI_MODEL;
//
//   const historyText = priceHistory
//     .map(p => `${p.date}: ₹${p.price}`)
//     .join("\n");
//
//   const prompt = `
//     You are an expert price analyst for the Indian tech retail market.
//     Product: ${productName}
//     Category: ${category}
//     Current Price: ₹${currentPrice}
//     30-Day Price History (Amazon.in):
//     ${historyText}
//     Analyse the trend and predict the next 30 days.
//     Consider: recent launches, Indian seasonal patterns (festivals, sales),
//     supply chain trends, and price vs historical average.
//     Respond ONLY with valid JSON, no extra text:
//     {
//       "recommendation": "BUY NOW"|"WAIT"|"HOLD",
//       "predictedPrice30Days": number,
//       "priceChangePercent": number,
//       "confidence": number,
//       "reasoning": "2-sentence string",
//       "keyFactors": ["f1","f2","f3"],
//       "waitDays": number|null,
//       "bestBuyDate": "YYYY-MM-DD"|null,
//       "predictedPrices": [
//         {"date":"YYYY-MM-DD","predictedPrice":number,
//          "lowerBound":number,"upperBound":number}
//       ]
//     }
//   `;
//   const res  = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
//     { method:"POST", headers:{"Content-Type":"application/json"},
//       body: JSON.stringify({
//         contents:[{parts:[{text:prompt}]}],
//         generationConfig:{ temperature:0.3, maxOutputTokens:1000 }
//       })
//     }
//   );
//   const data = await res.json();
//   const text = data.candidates[0].content.parts[0].text;
//   return JSON.parse(text.replace(/```json|```/g,"").trim());
// }

// TODO FUTURE — REAL PRICEAPI HISTORY CALL
// async function getPriceHistory_REAL(asin: string): Promise<PriceHistoryPoint[]> {
//   const BASE  = import.meta.env.VITE_PRICE_API_BASE;
//   const TOKEN = import.meta.env.VITE_PRICE_API_TOKEN;
//   const jobRes = await fetch(`${BASE}/jobs`, {
//     method:"POST", headers:{"Content-Type":"application/json"},
//     body: JSON.stringify({
//       token:TOKEN, source:"amazon", country:"in",
//       topic:"product_search", key:"asin", values:asin
//     })
//   });
//   const { job_id } = await jobRes.json();
//   const results = await pollJob(job_id); // implement pollJob separately
//   return results.map(r => ({
//     date: r.date, price: parseFloat(r.content.price), source:"amazon"
//   }));
// }

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER C — MAIN EXPORTED FUNCTION (signature never changes)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetches top-5 product predictions and returns them in a unified shape.
 *
 * TO CONNECT REAL DATA — make only these 3 swaps in this function body:
 *   SWAP 1: getTop5Products_MOCK()  → fetch('/api/products?sort=sales&limit=5')
 *   SWAP 2: getPriceHistory_MOCK()  → getPriceHistory_REAL(product.amazonAsin)
 *   SWAP 3: getGeminiPrediction_MOCK() → getGeminiPrediction_REAL(...)
 *   Also change dataSource: "mock" → "live"
 *
 * Nothing in BuyTiming.tsx needs to change.
 */
export async function fetchTop5Predictions(): Promise<Top5Predictions> {
  // STEP 1 — Get top 5 products
  const products = await getTop5Products_MOCK();
  // → REAL: const products = await fetch('/api/products?sort=sales&limit=5').then(r => r.json());

  // STEP 2 — Fetch history + AI prediction in parallel for all products
  const predictions = await Promise.all(
    products.map(async (product) => {
      const history = await getPriceHistory_MOCK(
        product.productId,
        product.currentPrice
      );
      // → REAL: const history = await getPriceHistory_REAL(product.amazonAsin);

      const prediction = await getGeminiPrediction_MOCK(
        product.productName,
        product.category,
        product.currentPrice,
        history
      );
      // → REAL: const prediction = await getGeminiPrediction_REAL(...same args...);

      return {
        ...product,
        priceHistory: history,
        ...prediction,
        dataSource: "mock" as const,
        // → REAL: dataSource: "live" as const,
        lastUpdated: new Date(),
      } satisfies ProductPrediction;
    })
  );

  return {
    products: predictions,
    generatedAt: new Date(),
    dataSource: "mock",
  };
}
