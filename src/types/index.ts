export type ItemCategory =
  | 'Vegetables'
  | 'Meat'
  | 'Dairy'
  | 'Spices'
  | 'Seafood'
  | 'Bakery & Dry Goods'
  | 'Luxury & Deli';

export type UnitOfMeasurement = 'kg' | 'liters' | 'grams' | 'bottles' | 'tins' | 'bunches' | 'portions';

export type StockStatus = 'Safe' | 'Low Stock' | 'Out of Stock';

export interface StorageZone {
  id: string;
  name: string;
  type: 'walk_in_cooler' | 'deep_freezer' | 'dry_pantry' | 'wine_cellar' | 'aging_room';
  targetTemp: number; // Celsius
  currentTemp: number;
  tempTolerance: number;
  status: 'Nominal' | 'Warning' | 'Critical';
  humidity: number; // %
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  rating: number; // 1-5
  categoriesSupplied: ItemCategory[];
  accountNumber: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ItemCategory;
  currentStock: number;
  unit: UnitOfMeasurement;
  reorderThreshold: number;
  optimalLevel: number;
  costPerUnit: number;
  storageZoneId: string;
  storageZoneName: string;
  supplierId: string;
  supplierName: string;
  status: StockStatus;
  lastRestocked: string;
  origin?: string;
  grade?: string;
  batchNumber?: string;
}

export interface ConsumptionDataPoint {
  timestamp: string;
  timeLabel: string;
  vegetables: number;
  meat: number;
  dairy: number;
  seafood: number;
  luxury: number;
  total: number;
  serviceShift: 'Breakfast' | 'Lunch Service' | 'Dinner Service' | 'Late Prep';
}

export interface TemperatureTelemetryPoint {
  timestamp: string;
  timeLabel: string;
  walkInFreezer: number; // target: -20°C
  meatChiller: number;   // target: 1.5°C
  seafoodCryo: number;   // target: -2.0°C
  pastryVault: number;   // target: 14.0°C
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'Low Stock' | 'Cold Storage Temp' | 'Spoilage Risk' | 'PO Auto-Trigger' | 'System Test';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  recipientEmail: string;
  smtpStatus: 'Delivered' | 'Queued' | 'Failed';
  smtpResponseCode: string;
  metadata?: {
    itemName?: string;
    currentStock?: number;
    threshold?: number;
    zoneName?: string;
    tempRecorded?: number;
    poNumber?: string;
  };
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  authPasswordMasked: string;
  senderEmail: string;
  senderName: string;
  executiveChefEmail: string;
  purchasingManagerEmail: string;
  sousChefEmail: string;
  dailyReportCron: string;
  dailyReportTime: string;
  reportFormat: 'PDF' | 'Excel' | 'JSON';
  autoAlertOnThreshold: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unit: UnitOfMeasurement;
    unitCost: number;
    lineTotal: number;
  }[];
  totalAmount: number;
  status: 'Draft' | 'Sent via SMTP' | 'Confirmed' | 'Delivered';
  createdAt: string;
  expectedDelivery: string;
  deliveryNotes?: string;
}
