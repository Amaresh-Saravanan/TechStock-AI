// Mock data for TechStock AI

// ─── Category Groups (single source of truth) ─────────────────────────────────

export const CATEGORY_GROUPS = [
  {
    group: "Core Components",
    categories: ["CPU","GPU","RAM","SSD","HDD","NVMe","Motherboard","PSU","Case","Cooler","Thermal Paste"],
  },
  {
    group: "Display & Peripherals",
    categories: ["Monitor","Keyboard","Mouse","Headset","Webcam","Speakers"],
  },
  {
    group: "Connectivity & Networking",
    categories: ["Router","Network Card","WiFi Adapter","Ethernet Switch"],
  },
  {
    group: "Storage & Ports",
    categories: ["External HDD","External SSD","USB Hub","NVMe Enclosure"],
  },
  {
    group: "Laptops & Prebuilts",
    categories: ["Laptop","Pre-built PC"],
  },
  {
    group: "Power & Protection",
    categories: ["UPS","Extension Board"],
  },
  {
    group: "Accessories",
    categories: ["Cable Management","RGB Lighting","Controller"],
  },
];

/** Flat list of every valid category string. */
export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories);

/** Find which group a category belongs to. */
export function findGroupForCategory(cat: string): string | undefined {
  return CATEGORY_GROUPS.find(g => g.categories.includes(cat))?.group;
}

export interface InventoryItem {
  id: string;
  productName: string;
  category: string;
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
  // ── Cooler ──
  { id: '11', productName: 'Noctua NH-D15', category: 'Cooler', brand: 'Noctua', model: 'NH-D15', purchasePrice: 7500, sellingPrice: 9499, quantity: 10, distributor: 'Aditya Infotech', purchaseDate: '2025-01-18', lastSoldDate: '2025-02-10', generation: 'Dual Tower' },
  { id: '12', productName: 'Corsair H150i Elite', category: 'Cooler', brand: 'Corsair', model: 'H150i Elite', purchasePrice: 11000, sellingPrice: 13999, quantity: 6, distributor: 'Savex', purchaseDate: '2025-01-20', lastSoldDate: '2025-02-12', generation: 'AIO 360mm' },
  // ── Thermal Paste ──
  { id: '13', productName: 'Thermal Grizzly Kryonaut', category: 'Thermal Paste', brand: 'Thermal Grizzly', model: 'Kryonaut 1g', purchasePrice: 450, sellingPrice: 699, quantity: 50, distributor: 'Aditya Infotech', purchaseDate: '2025-01-05', lastSoldDate: '2025-02-14', generation: 'Thermal Compound' },
  { id: '14', productName: 'Arctic MX-6', category: 'Thermal Paste', brand: 'Arctic', model: 'MX-6 4g', purchasePrice: 350, sellingPrice: 549, quantity: 40, distributor: 'Redington', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-11', generation: 'Thermal Compound' },
  // ── NVMe ──
  { id: '15', productName: 'WD Black SN850X 1TB', category: 'NVMe', brand: 'Western Digital', model: 'SN850X', purchasePrice: 7500, sellingPrice: 9499, quantity: 14, distributor: 'Redington', purchaseDate: '2025-01-06', lastSoldDate: '2025-02-13', generation: 'PCIe 4.0' },
  { id: '16', productName: 'Crucial T700 2TB', category: 'NVMe', brand: 'Crucial', model: 'T700', purchasePrice: 16000, sellingPrice: 19999, quantity: 5, distributor: 'Ingram', purchaseDate: '2025-01-15', lastSoldDate: '2025-02-09', generation: 'PCIe 5.0' },
  // ── Monitor ──
  { id: '17', productName: 'LG 27GP850-B', category: 'Monitor', brand: 'LG', model: '27GP850-B', purchasePrice: 25000, sellingPrice: 31999, quantity: 7, distributor: 'Redington', purchaseDate: '2025-01-12', lastSoldDate: '2025-02-08', generation: '27" QHD 165Hz' },
  { id: '18', productName: 'Samsung Odyssey G7 32"', category: 'Monitor', brand: 'Samsung', model: 'G7 C32G75', purchasePrice: 32000, sellingPrice: 39999, quantity: 4, distributor: 'Savex', purchaseDate: '2025-01-08', lastSoldDate: '2025-02-11', generation: '32" QHD 240Hz' },
  // ── Keyboard ──
  { id: '19', productName: 'Keychron Q1 Pro', category: 'Keyboard', brand: 'Keychron', model: 'Q1 Pro', purchasePrice: 12000, sellingPrice: 14999, quantity: 10, distributor: 'Aditya Infotech', purchaseDate: '2025-01-14', lastSoldDate: '2025-02-13', generation: 'Wireless Mechanical' },
  { id: '20', productName: 'Logitech G Pro X TKL', category: 'Keyboard', brand: 'Logitech', model: 'G Pro X TKL', purchasePrice: 8500, sellingPrice: 10999, quantity: 12, distributor: 'Savex', purchaseDate: '2025-01-18', lastSoldDate: '2025-02-14', generation: 'Wired Mechanical' },
  // ── Mouse ──
  { id: '21', productName: 'Logitech G502 X Plus', category: 'Mouse', brand: 'Logitech', model: 'G502 X Plus', purchasePrice: 9000, sellingPrice: 11499, quantity: 15, distributor: 'Savex', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-12', generation: 'Wireless Gaming' },
  { id: '22', productName: 'Razer DeathAdder V3', category: 'Mouse', brand: 'Razer', model: 'DeathAdder V3', purchasePrice: 5500, sellingPrice: 6999, quantity: 20, distributor: 'Ingram', purchaseDate: '2025-01-15', lastSoldDate: '2025-02-15', generation: 'Wired Gaming' },
  // ── Headset ──
  { id: '23', productName: 'Sony WH-1000XM5', category: 'Headset', brand: 'Sony', model: 'WH-1000XM5', purchasePrice: 22000, sellingPrice: 27999, quantity: 8, distributor: 'Redington', purchaseDate: '2025-01-05', lastSoldDate: '2025-02-10', generation: 'ANC Wireless' },
  { id: '24', productName: 'HyperX Cloud Alpha', category: 'Headset', brand: 'HyperX', model: 'Cloud Alpha', purchasePrice: 5500, sellingPrice: 6999, quantity: 18, distributor: 'Savex', purchaseDate: '2025-01-12', lastSoldDate: '2025-02-14', generation: 'Wired Gaming' },
  // ── Webcam ──
  { id: '25', productName: 'Logitech C920 HD Pro', category: 'Webcam', brand: 'Logitech', model: 'C920', purchasePrice: 5500, sellingPrice: 7499, quantity: 12, distributor: 'Savex', purchaseDate: '2025-01-16', lastSoldDate: '2025-02-08', generation: '1080p 30fps' },
  { id: '26', productName: 'Elgato Facecam', category: 'Webcam', brand: 'Elgato', model: 'Facecam', purchasePrice: 12000, sellingPrice: 14999, quantity: 5, distributor: 'Aditya Infotech', purchaseDate: '2025-01-20', lastSoldDate: '2025-02-13', generation: '1080p 60fps' },
  // ── Speakers ──
  { id: '27', productName: 'Edifier R1280T', category: 'Speakers', brand: 'Edifier', model: 'R1280T', purchasePrice: 5000, sellingPrice: 6499, quantity: 10, distributor: 'Redington', purchaseDate: '2025-01-11', lastSoldDate: '2025-02-09', generation: 'Bookshelf' },
  { id: '28', productName: 'Creative Pebble Pro', category: 'Speakers', brand: 'Creative', model: 'Pebble Pro', purchasePrice: 3200, sellingPrice: 3999, quantity: 25, distributor: 'Savex', purchaseDate: '2025-01-09', lastSoldDate: '2025-02-15', generation: 'USB-C Desktop' },
  // ── Router ──
  { id: '29', productName: 'TP-Link Archer AX73', category: 'Router', brand: 'TP-Link', model: 'Archer AX73', purchasePrice: 6500, sellingPrice: 8499, quantity: 8, distributor: 'Redington', purchaseDate: '2025-01-14', lastSoldDate: '2025-02-12', generation: 'WiFi 6' },
  { id: '30', productName: 'Asus RT-AX88U Pro', category: 'Router', brand: 'Asus', model: 'RT-AX88U Pro', purchasePrice: 18000, sellingPrice: 22999, quantity: 3, distributor: 'Aditya Infotech', purchaseDate: '2025-01-18', lastSoldDate: '2025-02-06', generation: 'WiFi 6' },
  // ── Network Card ──
  { id: '31', productName: 'Intel I225-V 2.5G', category: 'Network Card', brand: 'Intel', model: 'I225-V', purchasePrice: 2200, sellingPrice: 2999, quantity: 15, distributor: 'Savex', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-11', generation: '2.5GbE PCIe' },
  { id: '32', productName: 'Asus PCE-AX3000', category: 'Network Card', brand: 'Asus', model: 'PCE-AX3000', purchasePrice: 3000, sellingPrice: 3999, quantity: 10, distributor: 'Aditya Infotech', purchaseDate: '2025-01-15', lastSoldDate: '2025-02-13', generation: 'WiFi 6 PCIe' },
  // ── WiFi Adapter ──
  { id: '33', productName: 'TP-Link Archer T3U Plus', category: 'WiFi Adapter', brand: 'TP-Link', model: 'Archer T3U Plus', purchasePrice: 900, sellingPrice: 1299, quantity: 30, distributor: 'Redington', purchaseDate: '2025-01-05', lastSoldDate: '2025-02-14', generation: 'AC1300 USB' },
  { id: '34', productName: 'Asus USB-AX56', category: 'WiFi Adapter', brand: 'Asus', model: 'USB-AX56', purchasePrice: 2800, sellingPrice: 3699, quantity: 12, distributor: 'Aditya Infotech', purchaseDate: '2025-01-12', lastSoldDate: '2025-02-10', generation: 'WiFi 6 USB' },
  // ── Ethernet Switch ──
  { id: '35', productName: 'TP-Link TL-SG108', category: 'Ethernet Switch', brand: 'TP-Link', model: 'TL-SG108', purchasePrice: 1800, sellingPrice: 2499, quantity: 20, distributor: 'Redington', purchaseDate: '2025-01-08', lastSoldDate: '2025-02-12', generation: '8-Port Gigabit' },
  { id: '36', productName: 'Netgear GS308 v3', category: 'Ethernet Switch', brand: 'Netgear', model: 'GS308 v3', purchasePrice: 2000, sellingPrice: 2699, quantity: 14, distributor: 'Savex', purchaseDate: '2025-01-11', lastSoldDate: '2025-02-09', generation: '8-Port Gigabit' },
  // ── External HDD ──
  { id: '37', productName: 'Seagate Expansion 2TB', category: 'External HDD', brand: 'Seagate', model: 'STKM2000400', purchasePrice: 4500, sellingPrice: 5499, quantity: 15, distributor: 'Redington', purchaseDate: '2025-01-06', lastSoldDate: '2025-02-13', generation: 'USB 3.0' },
  { id: '38', productName: 'WD Elements 4TB', category: 'External HDD', brand: 'Western Digital', model: 'WDBU6Y0040BBK', purchasePrice: 7500, sellingPrice: 9499, quantity: 8, distributor: 'Ingram', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-11', generation: 'USB 3.0' },
  // ── External SSD ──
  { id: '39', productName: 'Samsung T7 1TB', category: 'External SSD', brand: 'Samsung', model: 'T7 1TB', purchasePrice: 7000, sellingPrice: 8999, quantity: 12, distributor: 'Savex', purchaseDate: '2025-01-14', lastSoldDate: '2025-02-14', generation: 'USB 3.2 Gen2' },
  { id: '40', productName: 'WD My Passport SSD 1TB', category: 'External SSD', brand: 'Western Digital', model: 'My Passport SSD', purchasePrice: 6500, sellingPrice: 8499, quantity: 10, distributor: 'Redington', purchaseDate: '2025-01-16', lastSoldDate: '2025-02-10', generation: 'USB 3.2 Gen2' },
  // ── USB Hub ──
  { id: '41', productName: 'Anker 7-Port USB 3.0 Hub', category: 'USB Hub', brand: 'Anker', model: 'A7505', purchasePrice: 1800, sellingPrice: 2499, quantity: 20, distributor: 'Aditya Infotech', purchaseDate: '2025-01-08', lastSoldDate: '2025-02-12', generation: 'USB 3.0' },
  { id: '42', productName: 'Belkin USB-C 6-in-1 Hub', category: 'USB Hub', brand: 'Belkin', model: 'AVC008', purchasePrice: 3500, sellingPrice: 4499, quantity: 10, distributor: 'Savex', purchaseDate: '2025-01-12', lastSoldDate: '2025-02-09', generation: 'USB-C' },
  // ── NVMe Enclosure ──
  { id: '43', productName: 'ORICO M2PV-C3 NVMe', category: 'NVMe Enclosure', brand: 'ORICO', model: 'M2PV-C3', purchasePrice: 1500, sellingPrice: 1999, quantity: 18, distributor: 'Aditya Infotech', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-13', generation: 'USB 3.2 Gen2' },
  { id: '44', productName: 'Sabrent EC-SNVE', category: 'NVMe Enclosure', brand: 'Sabrent', model: 'EC-SNVE', purchasePrice: 2200, sellingPrice: 2999, quantity: 12, distributor: 'Ingram', purchaseDate: '2025-01-15', lastSoldDate: '2025-02-08', generation: 'USB 3.2 Gen2' },
  // ── Laptop ──
  { id: '45', productName: 'ASUS ROG Zephyrus G14', category: 'Laptop', brand: 'ASUS', model: 'GA403UV', purchasePrice: 95000, sellingPrice: 119999, quantity: 3, distributor: 'Savex', purchaseDate: '2025-01-20', lastSoldDate: '2025-02-14', generation: 'Ryzen 9 + RTX 4060' },
  { id: '46', productName: 'Lenovo Legion 5 15"', category: 'Laptop', brand: 'Lenovo', model: '82JH0035IN', purchasePrice: 72000, sellingPrice: 89999, quantity: 5, distributor: 'Ingram', purchaseDate: '2025-01-18', lastSoldDate: '2025-02-11', generation: 'Ryzen 7 + RTX 4050' },
  // ── Pre-built PC ──
  { id: '47', productName: 'Acer Predator Orion 3000', category: 'Pre-built PC', brand: 'Acer', model: 'PO3-640', purchasePrice: 85000, sellingPrice: 104999, quantity: 2, distributor: 'Redington', purchaseDate: '2025-01-15', lastSoldDate: '2025-02-07', generation: 'i7 + RTX 4060 Ti' },
  { id: '48', productName: 'HP Omen 25L', category: 'Pre-built PC', brand: 'HP', model: 'GT15-1077in', purchasePrice: 78000, sellingPrice: 94999, quantity: 3, distributor: 'Ingram', purchaseDate: '2025-01-20', lastSoldDate: '2025-02-13', generation: 'Ryzen 7 + RTX 4060' },
  // ── UPS ──
  { id: '49', productName: 'APC Back-UPS 1500VA', category: 'UPS', brand: 'APC', model: 'BX1500G-IN', purchasePrice: 7500, sellingPrice: 9499, quantity: 8, distributor: 'Redington', purchaseDate: '2025-01-11', lastSoldDate: '2025-02-10', generation: '1500VA / 900W' },
  { id: '50', productName: 'Zebronics ZEB-U725', category: 'UPS', brand: 'Zebronics', model: 'ZEB-U725', purchasePrice: 2500, sellingPrice: 3299, quantity: 15, distributor: 'Savex', purchaseDate: '2025-01-08', lastSoldDate: '2025-02-14', generation: '600VA' },
  // ── Extension Board ──
  { id: '51', productName: 'Belkin 8-Outlet Surge Protector', category: 'Extension Board', brand: 'Belkin', model: 'BSV804sa2M', purchasePrice: 1800, sellingPrice: 2399, quantity: 20, distributor: 'Aditya Infotech', purchaseDate: '2025-01-06', lastSoldDate: '2025-02-12', generation: '8-Outlet Surge' },
  { id: '52', productName: 'APC PM8-IN Surge Strip', category: 'Extension Board', brand: 'APC', model: 'PM8-IN', purchasePrice: 2500, sellingPrice: 3199, quantity: 14, distributor: 'Redington', purchaseDate: '2025-01-10', lastSoldDate: '2025-02-09', generation: '8-Outlet Surge' },
  // ── Cable Management ──
  { id: '53', productName: 'Velcro Cable Ties 100-Pack', category: 'Cable Management', brand: 'Velcro', model: 'ONE-WRAP 100', purchasePrice: 400, sellingPrice: 599, quantity: 50, distributor: 'Aditya Infotech', purchaseDate: '2025-01-05', lastSoldDate: '2025-02-15', generation: 'Reusable' },
  { id: '54', productName: 'CableMod Pro ModMesh Kit', category: 'Cable Management', brand: 'CableMod', model: 'Pro ModMesh C-Series', purchasePrice: 3500, sellingPrice: 4499, quantity: 8, distributor: 'Savex', purchaseDate: '2025-01-14', lastSoldDate: '2025-02-10', generation: 'PSU Extension' },
  // ── RGB Lighting ──
  { id: '55', productName: 'Govee LED Strip Kit 5m', category: 'RGB Lighting', brand: 'Govee', model: 'H6159', purchasePrice: 1200, sellingPrice: 1699, quantity: 25, distributor: 'Redington', purchaseDate: '2025-01-09', lastSoldDate: '2025-02-13', generation: 'WiFi RGBWW' },
  { id: '56', productName: 'Corsair iCUE LS100 Kit', category: 'RGB Lighting', brand: 'Corsair', model: 'LS100', purchasePrice: 4500, sellingPrice: 5999, quantity: 6, distributor: 'Savex', purchaseDate: '2025-01-16', lastSoldDate: '2025-02-08', generation: 'Smart Ambient' },
  // ── Controller ──
  { id: '57', productName: 'Xbox Wireless Controller', category: 'Controller', brand: 'Microsoft', model: 'Xbox Series', purchasePrice: 4200, sellingPrice: 5499, quantity: 15, distributor: 'Ingram', purchaseDate: '2025-01-12', lastSoldDate: '2025-02-14', generation: 'Bluetooth/USB-C' },
  { id: '58', productName: 'PS5 DualSense Controller', category: 'Controller', brand: 'Sony', model: 'DualSense', purchasePrice: 4800, sellingPrice: 5999, quantity: 12, distributor: 'Redington', purchaseDate: '2025-01-18', lastSoldDate: '2025-02-12', generation: 'Haptic Feedback' },
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

// ─── Record Sale Feature ─────────────────────────────────────────────────────

export type SaleCategory =
  | 'CPU' | 'GPU' | 'RAM' | 'Storage' | 'Motherboard'
  | 'Laptop' | 'Monitor' | 'Peripheral' | 'Other';

export type PaymentMethod =
  | 'Cash' | 'UPI' | 'Card' | 'Net Banking' | 'Bank Transfer';

export interface NewSaleEntry {
  id: string;
  date: string;              // ISO date string
  productName: string;
  category: SaleCategory;
  quantity: number;
  unitPrice: number;
  totalAmount: number;       // quantity × unitPrice
  customerName: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export const mockSalesEntries: NewSaleEntry[] = [
  {
    id: 'sale-1',
    date: '2025-02-15T10:30:00.000Z',
    productName: 'NVIDIA RTX 4060',
    category: 'GPU',
    quantity: 1,
    unitPrice: 29999,
    totalAmount: 29999,
    customerName: 'Arjun Singh',
    paymentMethod: 'UPI',
    notes: 'Regular customer, gave 1% loyalty discount verbally.',
  },
  {
    id: 'sale-2',
    date: '2025-02-14T15:45:00.000Z',
    productName: 'AMD Ryzen 7 7800X3D',
    category: 'CPU',
    quantity: 1,
    unitPrice: 34999,
    totalAmount: 34999,
    customerName: 'Priya Patel',
    paymentMethod: 'Card',
    notes: '',
  },
  {
    id: 'sale-3',
    date: '2025-02-14T11:20:00.000Z',
    productName: 'Corsair Vengeance DDR5 32GB',
    category: 'RAM',
    quantity: 2,
    unitPrice: 8999,
    totalAmount: 17998,
    customerName: 'Ravi Kumar',
    paymentMethod: 'Cash',
    notes: 'Buying for gaming PC build.',
  },
  {
    id: 'sale-4',
    date: '2025-02-13T09:15:00.000Z',
    productName: 'Samsung 990 Pro 2TB',
    category: 'Storage',
    quantity: 1,
    unitPrice: 14499,
    totalAmount: 14499,
    customerName: 'Deepa Nair',
    paymentMethod: 'Net Banking',
    notes: '',
  },
  {
    id: 'sale-5',
    date: '2025-02-12T16:30:00.000Z',
    productName: 'NVIDIA RTX 4060',
    category: 'GPU',
    quantity: 2,
    unitPrice: 29999,
    totalAmount: 59998,
    customerName: 'Suresh Reddy',
    paymentMethod: 'UPI',
    notes: 'Bulk order for cybercafe.',
  },
  {
    id: 'sale-6',
    date: '2025-02-11T14:00:00.000Z',
    productName: 'Corsair RM850x PSU',
    category: 'Other',
    quantity: 1,
    unitPrice: 10499,
    totalAmount: 10499,
    customerName: 'Anjali Sharma',
    paymentMethod: 'Card',
    notes: '',
  },
  {
    id: 'sale-7',
    date: '2025-02-10T10:00:00.000Z',
    productName: 'ASUS ROG Strix B650E-F',
    category: 'Motherboard',
    quantity: 1,
    unitPrice: 22999,
    totalAmount: 22999,
    customerName: 'Vikram Mehta',
    paymentMethod: 'Cash',
    notes: 'First-time customer from referral.',
  },
  {
    id: 'sale-8',
    date: '2025-02-09T12:30:00.000Z',
    productName: 'MSI Optix G27C4 Monitor',
    category: 'Monitor',
    quantity: 1,
    unitPrice: 18499,
    totalAmount: 18499,
    customerName: 'Kavya Iyer',
    paymentMethod: 'Bank Transfer',
    notes: 'Delivered to office address.',
  },
];

// ─── ADVISOR FEATURE MOCK DATA ──────────────────────────────────────────────

import type { Invoice, KhataCustomer, WarrantyRecord, Supplier, PurchaseOrder, Expense } from "./advisorTypes";

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1", invoiceNumber: "INV-2025-0001", date: "2025-03-10",
    customerName: "Rajesh Kumar", customerPhone: "9876543210",
    items: [{ productId: "2", productName: "NVIDIA RTX 4070 Ti Super", category: "GPU", quantity: 1, unitPrice: 64999, gstRate: 18, gstAmount: 11700, totalAmount: 76699 }],
    subTotal: 64999, totalGST: 11700, cgst: 5850, sgst: 5850, igst: 0,
    grandTotal: 76699, paymentMethod: "UPI", isInterState: false, status: "paid",
  },
  {
    id: "inv-2", invoiceNumber: "INV-2025-0002", date: "2025-03-12",
    customerName: "Meena Enterprises", customerPhone: "9988776655", customerGSTIN: "27AABCU9603R1ZM",
    items: [
      { productId: "1", productName: "AMD Ryzen 7 7800X3D", category: "CPU", quantity: 2, unitPrice: 34999, gstRate: 18, gstAmount: 12600, totalAmount: 82598 },
      { productId: "3", productName: "Corsair Vengeance DDR5 32GB", category: "RAM", quantity: 2, unitPrice: 8999, gstRate: 18, gstAmount: 3240, totalAmount: 21238 },
    ],
    subTotal: 87996, totalGST: 15840, cgst: 7920, sgst: 7920, igst: 0,
    grandTotal: 103836, paymentMethod: "Net Banking", isInterState: false, status: "paid",
  },
  {
    id: "inv-3", invoiceNumber: "INV-2025-0003", date: "2025-03-14",
    customerName: "Deepak Nair", customerPhone: "9123456789",
    items: [{ productId: "4", productName: "Samsung 990 Pro 2TB", category: "SSD", quantity: 1, unitPrice: 14499, gstRate: 18, gstAmount: 2610, totalAmount: 17109 }],
    subTotal: 14499, totalGST: 2610, cgst: 1305, sgst: 1305, igst: 0,
    grandTotal: 17109, paymentMethod: "Card", isInterState: false, status: "pending",
  },
];

export const mockKhataCustomers: KhataCustomer[] = [
  {
    id: "kh-1", name: "Suresh Enterprises", phone: "9988776655",
    totalOutstanding: 45000, lastTransaction: "2025-03-12",
    entries: [
      { id: "ke-1", customerName: "Suresh Enterprises", customerPhone: "9988776655", type: "credit", amount: 65000, description: "2x RTX 4070 purchased on credit", date: "2025-03-01", balanceAfter: 65000 },
      { id: "ke-2", customerName: "Suresh Enterprises", customerPhone: "9988776655", type: "payment", amount: 20000, description: "Partial payment received – UPI", date: "2025-03-12", balanceAfter: 45000 },
    ],
  },
  {
    id: "kh-2", name: "Amit Trading Co.", phone: "9876500123",
    totalOutstanding: 12500, lastTransaction: "2025-03-08",
    entries: [
      { id: "ke-3", customerName: "Amit Trading Co.", customerPhone: "9876500123", type: "credit", amount: 12500, description: "1x Ryzen 7 7800X3D on credit", date: "2025-03-08", balanceAfter: 12500 },
    ],
  },
  {
    id: "kh-3", name: "Priya Computers", phone: "9111222333",
    totalOutstanding: 0, lastTransaction: "2025-02-28",
    entries: [
      { id: "ke-4", customerName: "Priya Computers", customerPhone: "9111222333", type: "credit", amount: 18000, description: "Monitor + keyboard combo", date: "2025-02-15", balanceAfter: 18000 },
      { id: "ke-5", customerName: "Priya Computers", customerPhone: "9111222333", type: "payment", amount: 18000, description: "Full settlement – Bank transfer", date: "2025-02-28", balanceAfter: 0 },
    ],
  },
];

export const mockWarranties: WarrantyRecord[] = [
  { id: "war-1", customerName: "Priya Sharma", customerPhone: "9123456789", productName: "ASUS ROG Strix B650E-F", category: "Motherboard", serialNumber: "SN-2024-MB-001", purchaseDate: "2024-03-15", warrantyMonths: 36, warrantyExpiryDate: "2027-03-15", status: "active" },
  { id: "war-2", customerName: "Amit Patel", customerPhone: "9234567890", productName: "Corsair H150i Elite", category: "Cooler", purchaseDate: "2024-02-20", warrantyMonths: 13, warrantyExpiryDate: "2025-03-20", status: "expiring_soon" },
  { id: "war-3", customerName: "Ravi Kumar", customerPhone: "9345678901", productName: "WD Blue 1TB HDD", category: "HDD", serialNumber: "SN-2023-HD-042", purchaseDate: "2023-01-10", warrantyMonths: 24, warrantyExpiryDate: "2025-01-10", status: "expired" },
  { id: "war-4", customerName: "Deepa Nair", customerPhone: "9456789012", productName: "Samsung 990 Pro 2TB", category: "SSD", serialNumber: "SN-2024-SSD-019", purchaseDate: "2024-06-01", warrantyMonths: 60, warrantyExpiryDate: "2029-06-01", status: "active" },
  { id: "war-5", customerName: "Vikram Mehta", customerPhone: "9567890123", productName: "Corsair RM850x PSU", category: "PSU", purchaseDate: "2024-12-01", warrantyMonths: 4, warrantyExpiryDate: "2025-04-01", status: "expiring_soon" },
];

export const mockSuppliers: Supplier[] = [
  { id: "sup-1", name: "Rashi Peripherals", contactPerson: "Vikram Singh", phone: "9111222333", email: "vikram@rashi.com", categories: ["GPU", "CPU", "Motherboard"], paymentTerms: "Net 15", totalPurchased: 850000, outstandingPayment: 120000 },
  { id: "sup-2", name: "Redington India", contactPerson: "Meena Iyer", phone: "9444555666", email: "meena@redington.co.in", categories: ["Laptop", "Monitor", "Keyboard"], paymentTerms: "Net 30", totalPurchased: 420000, outstandingPayment: 0 },
  { id: "sup-3", name: "Savex Technologies", contactPerson: "Arjun Desai", phone: "9777888999", categories: ["RAM", "SSD", "PSU"], paymentTerms: "Net 7", totalPurchased: 310000, outstandingPayment: 45000 },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: "po-1", supplierId: "sup-1", supplierName: "Rashi Peripherals", date: "2025-03-01", items: [{ productName: "NVIDIA RTX 4070 Ti Super", quantity: 5, unitCost: 52000, totalCost: 260000 }], totalAmount: 260000, status: "received", paymentStatus: "pending" },
  { id: "po-2", supplierId: "sup-1", supplierName: "Rashi Peripherals", date: "2025-03-15", items: [{ productName: "AMD Ryzen 7 7800X3D", quantity: 10, unitCost: 28500, totalCost: 285000 }], totalAmount: 285000, status: "ordered", paymentStatus: "paid" },
  { id: "po-3", supplierId: "sup-3", supplierName: "Savex Technologies", date: "2025-03-10", items: [{ productName: "Corsair Vengeance DDR5 32GB", quantity: 20, unitCost: 7200, totalCost: 144000 }, { productName: "Samsung 990 Pro 2TB", quantity: 10, unitCost: 11500, totalCost: 115000 }], totalAmount: 259000, status: "received", paymentStatus: "partial" },
];

export const mockExpenses: Expense[] = [
  { id: "exp-1", category: "rent", description: "Shop rent March 2025", amount: 18000, date: "2025-03-01", month: "2025-03" },
  { id: "exp-2", category: "electricity", description: "EB bill March", amount: 3200, date: "2025-03-05", month: "2025-03" },
  { id: "exp-3", category: "salary", description: "Staff salary March", amount: 22000, date: "2025-03-31", month: "2025-03" },
  { id: "exp-4", category: "packaging", description: "Bubble wrap and boxes", amount: 1500, date: "2025-03-08", month: "2025-03" },
  { id: "exp-5", category: "rent", description: "Shop rent Feb 2025", amount: 18000, date: "2025-02-01", month: "2025-02" },
  { id: "exp-6", category: "electricity", description: "EB bill Feb", amount: 2800, date: "2025-02-05", month: "2025-02" },
  { id: "exp-7", category: "salary", description: "Staff salary Feb", amount: 22000, date: "2025-02-28", month: "2025-02" },
  { id: "exp-8", category: "marketing", description: "Google ads Jan", amount: 5000, date: "2025-01-15", month: "2025-01" },
  { id: "exp-9", category: "rent", description: "Shop rent Jan 2025", amount: 18000, date: "2025-01-01", month: "2025-01" },
  { id: "exp-10", category: "salary", description: "Staff salary Jan", amount: 22000, date: "2025-01-31", month: "2025-01" },
];
