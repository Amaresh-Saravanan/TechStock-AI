// Mock data for TechStock AI

export interface InventoryItem {
  id: string;
  productName: string;
  category: 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'HDD' | 'Motherboard' | 'PSU' | 'Case';
  brand: string;
  model: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  distributor: string;
  purchaseDate: string;
  lastSoldDate: string | null;
  generation: string;
}

export interface CompetitorPrice {
  id: string;
  productName: string;
  yourPrice: number;
  amazonPrice: number;
  flipkartPrice: number;
  mdcomputersPrice: number;
  primeabgbPrice: number;
  recommendedPrice: number;
  lastUpdated: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  predicted?: number;
}

export interface Alert {
  id: string;
  productName: string;
  alertType: 'price_drop' | 'dead_stock' | 'low_stock' | 'warranty_expiry';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface PCBuild {
  id: string;
  name: string;
  purpose: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  motherboard: string;
  psu: string;
  totalPrice: number;
}

export const inventoryItems: InventoryItem[] = [
  { id: '1', productName: 'AMD Ryzen 7 7800X3D', category: 'CPU', brand: 'AMD', model: '7800X3D', purchasePrice: 28500, sellingPrice: 34999, quantity: 12, distributor: 'Savex', purchaseDate: '2024-12-15', lastSoldDate: '2025-02-10', generation: 'Zen 4' },
  { id: '2', productName: 'NVIDIA RTX 4070 Ti Super', category: 'GPU', brand: 'NVIDIA', model: 'RTX 4070 Ti Super', purchasePrice: 52000, sellingPrice: 64999, quantity: 5, distributor: 'Ingram', purchaseDate: '2025-01-05', lastSoldDate: '2025-02-12', generation: 'Ada Lovelace' },
  { id: '3', productName: 'Corsair Vengeance DDR5 32GB', category: 'RAM', brand: 'Corsair', model: 'CMK32GX5M2B5600', purchasePrice: 7200, sellingPrice: 8999, quantity: 25, distributor: 'Aditya Infotech', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-14', generation: 'DDR5' },
  { id: '4', productName: 'Samsung 990 Pro 2TB', category: 'SSD', brand: 'Samsung', model: '990 Pro', purchasePrice: 11500, sellingPrice: 14499, quantity: 18, distributor: 'Redington', purchaseDate: '2025-01-12', lastSoldDate: '2025-02-08', generation: 'PCIe 4.0' },
  { id: '5', productName: 'Intel Core i9-14900K', category: 'CPU', brand: 'Intel', model: 'i9-14900K', purchasePrice: 42000, sellingPrice: 49999, quantity: 3, distributor: 'Savex', purchaseDate: '2024-11-20', lastSoldDate: '2025-01-15', generation: '14th Gen' },
  { id: '6', productName: 'AMD RX 7900 XTX', category: 'GPU', brand: 'AMD', model: 'RX 7900 XTX', purchasePrice: 65000, sellingPrice: 79999, quantity: 2, distributor: 'Ingram', purchaseDate: '2024-10-10', lastSoldDate: null, generation: 'RDNA 3' },
  { id: '7', productName: 'WD Blue 1TB HDD', category: 'HDD', brand: 'Western Digital', model: 'WD10EZEX', purchasePrice: 2800, sellingPrice: 3499, quantity: 40, distributor: 'Redington', purchaseDate: '2024-09-01', lastSoldDate: '2024-11-15', generation: '7200RPM' },
  { id: '8', productName: 'ASUS ROG Strix B650E-F', category: 'Motherboard', brand: 'ASUS', model: 'ROG Strix B650E-F', purchasePrice: 18500, sellingPrice: 22999, quantity: 8, distributor: 'Aditya Infotech', purchaseDate: '2025-01-20', lastSoldDate: '2025-02-11', generation: 'AM5' },
  { id: '9', productName: 'Corsair RM850x', category: 'PSU', brand: 'Corsair', model: 'RM850x', purchasePrice: 8500, sellingPrice: 10499, quantity: 15, distributor: 'Savex', purchaseDate: '2025-01-08', lastSoldDate: '2025-02-13', generation: '80+ Gold' },
  { id: '10', productName: 'NVIDIA RTX 4060', category: 'GPU', brand: 'NVIDIA', model: 'RTX 4060', purchasePrice: 24000, sellingPrice: 29999, quantity: 20, distributor: 'Ingram', purchaseDate: '2025-01-15', lastSoldDate: '2025-02-15', generation: 'Ada Lovelace' },
];

export const competitorPrices: CompetitorPrice[] = [
  { id: '1', productName: 'AMD Ryzen 7 7800X3D', yourPrice: 34999, amazonPrice: 33499, flipkartPrice: 34299, mdcomputersPrice: 33999, primeabgbPrice: 34199, recommendedPrice: 33749, lastUpdated: '2025-02-15' },
  { id: '2', productName: 'NVIDIA RTX 4070 Ti Super', yourPrice: 64999, amazonPrice: 63999, flipkartPrice: 65499, mdcomputersPrice: 62999, primeabgbPrice: 63499, recommendedPrice: 63749, lastUpdated: '2025-02-15' },
  { id: '3', productName: 'Corsair Vengeance DDR5 32GB', yourPrice: 8999, amazonPrice: 8499, flipkartPrice: 8799, mdcomputersPrice: 8599, primeabgbPrice: 8699, recommendedPrice: 8599, lastUpdated: '2025-02-15' },
  { id: '4', productName: 'Samsung 990 Pro 2TB', yourPrice: 14499, amazonPrice: 13999, flipkartPrice: 14299, mdcomputersPrice: 13799, primeabgbPrice: 14099, recommendedPrice: 13999, lastUpdated: '2025-02-15' },
  { id: '5', productName: 'NVIDIA RTX 4060', yourPrice: 29999, amazonPrice: 28999, flipkartPrice: 29499, mdcomputersPrice: 28499, primeabgbPrice: 29199, recommendedPrice: 29049, lastUpdated: '2025-02-15' },
];

export const priceHistoryData: PriceHistory[] = [
  { date: 'Sep', price: 36000, predicted: undefined },
  { date: 'Oct', price: 35500, predicted: undefined },
  { date: 'Nov', price: 35200, predicted: undefined },
  { date: 'Dec', price: 34800, predicted: undefined },
  { date: 'Jan', price: 34999, predicted: undefined },
  { date: 'Feb', price: 34500, predicted: 34500 },
  { date: 'Mar', price: undefined as any, predicted: 33800 },
  { date: 'Apr', price: undefined as any, predicted: 33200 },
  { date: 'May', price: undefined as any, predicted: 32500 },
];

export const salesData = [
  { month: 'Sep', revenue: 420000, profit: 68000 },
  { month: 'Oct', revenue: 510000, profit: 82000 },
  { month: 'Nov', revenue: 680000, profit: 112000 },
  { month: 'Dec', revenue: 890000, profit: 145000 },
  { month: 'Jan', revenue: 720000, profit: 118000 },
  { month: 'Feb', revenue: 650000, profit: 105000 },
];

export const categoryDistribution = [
  { name: 'GPU', value: 35, fill: 'hsl(var(--chart-1))' },
  { name: 'CPU', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'RAM', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'SSD', value: 12, fill: 'hsl(var(--chart-4))' },
  { name: 'Others', value: 13, fill: 'hsl(var(--chart-5))' },
];

export const alerts: Alert[] = [
  { id: '1', productName: 'AMD Ryzen 7 7800X3D', alertType: 'price_drop', message: 'Amazon price dropped below your selling price by ₹1,500', createdAt: '2025-02-15', read: false },
  { id: '2', productName: 'AMD RX 7900 XTX', alertType: 'dead_stock', message: 'Unsold for 130+ days. Consider discounting.', createdAt: '2025-02-14', read: false },
  { id: '3', productName: 'WD Blue 1TB HDD', alertType: 'dead_stock', message: 'Unsold for 90+ days. HDD demand declining.', createdAt: '2025-02-13', read: true },
  { id: '4', productName: 'Samsung 990 Pro 2TB', alertType: 'price_drop', message: 'MD Computers price is ₹700 lower than yours', createdAt: '2025-02-12', read: true },
  { id: '5', productName: 'Corsair Vengeance DDR5', alertType: 'low_stock', message: 'High demand detected. Consider restocking.', createdAt: '2025-02-11', read: false },
];

export const pcBuilds: PCBuild[] = [
  { id: '1', name: 'Budget Gaming', purpose: 'Gaming', cpu: 'AMD Ryzen 5 5600', gpu: 'NVIDIA RTX 4060', ram: '16GB DDR4 3200MHz', storage: '1TB NVMe SSD', motherboard: 'MSI B550M Pro', psu: 'Corsair CV550', totalPrice: 58000 },
  { id: '2', name: 'Pro Gaming', purpose: 'Gaming', cpu: 'AMD Ryzen 7 7800X3D', gpu: 'NVIDIA RTX 4070 Ti Super', ram: '32GB DDR5 5600MHz', storage: '2TB NVMe SSD', motherboard: 'ASUS ROG Strix B650E-F', psu: 'Corsair RM850x', totalPrice: 145000 },
  { id: '3', name: 'Office Workstation', purpose: 'Office', cpu: 'Intel Core i5-13400', gpu: 'Intel UHD 730', ram: '16GB DDR4 3200MHz', storage: '512GB NVMe SSD', motherboard: 'Gigabyte B660M DS3H', psu: 'Cooler Master MWE 450', totalPrice: 32000 },
  { id: '4', name: 'Content Creator', purpose: 'Editing', cpu: 'AMD Ryzen 9 7950X', gpu: 'NVIDIA RTX 4080 Super', ram: '64GB DDR5 5600MHz', storage: '4TB NVMe SSD', motherboard: 'ASUS ProArt X670E', psu: 'Corsair RM1000x', totalPrice: 225000 },
];

export const recommendations = [
  { product: 'NVIDIA RTX 4060', action: 'Increase Stock', reason: 'High demand, fast turnover (avg 3 days)', priority: 'high' as const },
  { product: 'WD Blue 1TB HDD', action: 'Reduce Stock', reason: 'Declining demand, 90+ days unsold', priority: 'high' as const },
  { product: 'AMD RX 7900 XTX', action: 'Discount 10%', reason: '130+ days unsold, consider clearance', priority: 'medium' as const },
  { product: 'Corsair Vengeance DDR5', action: 'Restock Soon', reason: 'Stock depleting fast, 5 units sold this week', priority: 'medium' as const },
  { product: 'Samsung 990 Pro 2TB', action: 'Price Match', reason: 'Competitors ₹700 lower on average', priority: 'low' as const },
];

export const profitByCategory = [
  { category: 'GPU', profit: 185000, margin: 22.4 },
  { category: 'CPU', profit: 98000, margin: 18.7 },
  { category: 'RAM', profit: 44975, margin: 20.0 },
  { category: 'SSD', profit: 53982, margin: 20.7 },
  { category: 'Motherboard', profit: 35992, margin: 19.6 },
  { category: 'PSU', profit: 29985, margin: 19.0 },
];

// Stock-Smart additional data



export interface BuyTimingItem {
  id: string;
  product: string;
  currentPrice: number;
  predictedPrice: number;
  recommendation: 'BUY NOW' | 'WAIT' | 'HOLD';
  confidence: number;
  reason: string;
  daysToWait?: number;
}

export const buyTimingItems: BuyTimingItem[] = [
  { id: '1', product: 'NVIDIA RTX 4070 Super', currentPrice: 52999, predictedPrice: 48999, recommendation: 'WAIT', confidence: 85, reason: 'Price expected to drop with RTX 50 series announcement', daysToWait: 30 },
  { id: '2', product: 'AMD Ryzen 7 7800X3D', currentPrice: 34999, predictedPrice: 36999, recommendation: 'BUY NOW', confidence: 92, reason: 'Supply constraints expected, prices likely to rise' },
  { id: '3', product: 'Corsair Vengeance DDR5 32GB', currentPrice: 8999, predictedPrice: 8499, recommendation: 'HOLD', confidence: 68, reason: 'Slight price drop possible, but not significant' },
  { id: '4', product: 'Samsung 990 Pro 2TB', currentPrice: 14499, predictedPrice: 12999, recommendation: 'WAIT', confidence: 78, reason: 'New models coming, current gen will see discounts', daysToWait: 45 },
  { id: '5', product: 'Intel Core i9-14900K', currentPrice: 49999, predictedPrice: 52999, recommendation: 'BUY NOW', confidence: 88, reason: 'Limited stock, high demand in enterprise segment' },
];

export const buyTimingChartData = [
  { month: 'Sep', actual: 35000, predicted: 35000 },
  { month: 'Oct', actual: 34500, predicted: 34800 },
  { month: 'Nov', actual: 34000, predicted: 34200 },
  { month: 'Dec', actual: 34999, predicted: 33800 },
  { month: 'Jan', actual: 34500, predicted: 33500 },
  { month: 'Feb', actual: null, predicted: 33000 },
  { month: 'Mar', actual: null, predicted: 32500 },
  { month: 'Apr', actual: null, predicted: 32000 },
];

export const marketInsights = [
  { id: '1', title: 'GPU Market Shift', description: 'RTX 40 series prices declining as RTX 50 announcement approaches. Consider reducing inventory.', score: 'High', category: 'Market Trend' },
  { id: '2', title: 'DDR5 Adoption Rising', description: 'DDR5 RAM demand increasing 40% month-over-month. Stock up on popular configurations.', score: 'High', category: 'Opportunity' },
  { id: '3', title: 'SSD Price War', description: 'NAND flash prices continue to fall. Expect 10-15% price drops in next quarter.', score: 'Medium', category: 'Price Alert' },
  { id: '4', title: 'AMD CPU Demand', description: 'Ryzen 7000X3D series seeing exceptional demand. Limited supply from distributors.', score: 'High', category: 'Supply Alert' },
  { id: '5', title: 'Peripheral Slowdown', description: 'Gaming peripheral sales slowing. Consider clearance sales on slow-moving inventory.', score: 'Low', category: 'Market Trend' },
];

export const profitTrendData = [
  { month: 'Sep', profit: 68000 },
  { month: 'Oct', profit: 82000 },
  { month: 'Nov', profit: 112000 },
  { month: 'Dec', profit: 145000 },
  { month: 'Jan', profit: 118000 },
  { month: 'Feb', profit: 105000 },
];
