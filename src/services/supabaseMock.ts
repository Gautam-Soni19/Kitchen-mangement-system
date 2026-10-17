import { InventoryItem, StockStatus, StorageZone, Vendor, PurchaseOrder } from '@/types';
import { smtpService } from './smtpService';

export const INITIAL_STORAGE_ZONES: StorageZone[] = [
  {
    id: 'zone-1',
    name: 'Walk-In Deep Freezer Alpha',
    type: 'deep_freezer',
    targetTemp: -20.0,
    currentTemp: -20.4,
    tempTolerance: 2.0,
    status: 'Nominal',
    humidity: 45,
  },
  {
    id: 'zone-2',
    name: 'Meat & Charcuterie Ageing Vault',
    type: 'aging_room',
    targetTemp: 1.5,
    currentTemp: 1.8,
    tempTolerance: 1.0,
    status: 'Nominal',
    humidity: 78,
  },
  {
    id: 'zone-3',
    name: 'Sub-Zero Poissonier Chest',
    type: 'deep_freezer',
    targetTemp: -2.0,
    currentTemp: -1.9,
    tempTolerance: 0.8,
    status: 'Nominal',
    humidity: 60,
  },
  {
    id: 'zone-4',
    name: 'Pastry & Chocolate Cellar',
    type: 'walk_in_cooler',
    targetTemp: 14.0,
    currentTemp: 14.2,
    tempTolerance: 1.5,
    status: 'Nominal',
    humidity: 50,
  },
  {
    id: 'zone-5',
    name: 'Grand Cru Wine & Spirit Sanctum',
    type: 'wine_cellar',
    targetTemp: 12.0,
    currentTemp: 12.1,
    tempTolerance: 1.0,
    status: 'Nominal',
    humidity: 68,
  },
  {
    id: 'zone-6',
    name: 'Dry Larder & Spices Reserve',
    type: 'dry_pantry',
    targetTemp: 19.0,
    currentTemp: 19.5,
    tempTolerance: 3.0,
    status: 'Nominal',
    humidity: 40,
  },
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    name: 'Miyazaki Wagyu Purveyors Japan',
    contactPerson: 'Kenji Takahashi',
    email: 'orders@miyazaki-beef-export.jp',
    phone: '+81 3 5555 0192',
    leadTimeDays: 2,
    rating: 5,
    categoriesSupplied: ['Meat'],
    accountNumber: 'ETOILE-JP-9941',
  },
  {
    id: 'ven-2',
    name: 'Maison de la Truffe Périgord',
    contactPerson: 'Élise Bonneville',
    email: 'appro@truffes-perigord.fr',
    phone: '+33 5 53 01 22 40',
    leadTimeDays: 1,
    rating: 5,
    categoriesSupplied: ['Luxury & Deli', 'Spices'],
    accountNumber: 'ETOILE-FR-4412',
  },
  {
    id: 'ven-3',
    name: 'Verdant Organic Orchards & Greens',
    contactPerson: 'Marcus Thorne',
    email: 'chefdesk@verdantfarms.org',
    phone: '+44 20 7946 0912',
    leadTimeDays: 1,
    rating: 4.8,
    categoriesSupplied: ['Vegetables'],
    accountNumber: 'ETOILE-UK-1108',
  },
  {
    id: 'ven-4',
    name: 'Finest Brittany Artisanal Seafood',
    contactPerson: 'Hervé Le Gall',
    email: 'maree@brittany-seafood.fr',
    phone: '+33 2 98 44 88 12',
    leadTimeDays: 1,
    rating: 4.9,
    categoriesSupplied: ['Seafood'],
    accountNumber: 'ETOILE-FR-8891',
  },
  {
    id: 'ven-5',
    name: 'Fromagerie Beillevaire & Laiterie',
    contactPerson: 'Claire Renard',
    email: 'commande@beillevaire-luxe.fr',
    phone: '+33 1 42 33 00 99',
    leadTimeDays: 2,
    rating: 4.9,
    categoriesSupplied: ['Dairy'],
    accountNumber: 'ETOILE-FR-2204',
  },
  {
    id: 'ven-6',
    name: 'Valrhona & Grand Épicerie Distributeurs',
    contactPerson: 'Pierre Dupont',
    email: 'service.pro@valrhona-supply.com',
    phone: '+33 4 75 07 90 90',
    leadTimeDays: 3,
    rating: 5,
    categoriesSupplied: ['Bakery & Dry Goods', 'Spices'],
    accountNumber: 'ETOILE-FR-5501',
  },
];

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-101',
    sku: 'WGY-A5-01',
    name: 'Miyazaki A5 Wagyu Tenderloin (BMS 11)',
    category: 'Meat',
    currentStock: 4.2,
    unit: 'kg',
    reorderThreshold: 8.0,
    optimalLevel: 20.0,
    costPerUnit: 240.0,
    storageZoneId: 'zone-2',
    storageZoneName: 'Meat & Charcuterie Ageing Vault',
    supplierId: 'ven-1',
    supplierName: 'Miyazaki Wagyu Purveyors Japan',
    status: 'Low Stock',
    lastRestocked: '2026-10-12',
    origin: 'Miyazaki Prefecture, Japan',
    grade: 'A5 BMS 11',
    batchNumber: 'LOT-2026-W99',
  },
  {
    id: 'item-102',
    sku: 'TRF-BLK-02',
    name: 'Fresh Black Winter Truffles (Tuber melanosporum)',
    category: 'Luxury & Deli',
    currentStock: 0.65,
    unit: 'kg',
    reorderThreshold: 1.5,
    optimalLevel: 3.5,
    costPerUnit: 1450.0,
    storageZoneId: 'zone-4',
    storageZoneName: 'Pastry & Chocolate Cellar',
    supplierId: 'ven-2',
    supplierName: 'Maison de la Truffe Périgord',
    status: 'Low Stock',
    lastRestocked: '2026-10-14',
    origin: 'Dordogne, France',
    grade: 'Extra Whole Extra',
    batchNumber: 'LOT-2026-TR14',
  },
  {
    id: 'item-103',
    sku: 'TOM-SAN-03',
    name: 'San Marzano Heirloom Vine Tomatoes',
    category: 'Vegetables',
    currentStock: 24.5,
    unit: 'kg',
    reorderThreshold: 10.0,
    optimalLevel: 40.0,
    costPerUnit: 12.5,
    storageZoneId: 'zone-6',
    storageZoneName: 'Dry Larder & Spices Reserve',
    supplierId: 'ven-3',
    supplierName: 'Verdant Organic Orchards & Greens',
    status: 'Safe',
    lastRestocked: '2026-10-15',
    origin: 'Campania Organic Basin',
    grade: 'DOP Grade 1',
    batchNumber: 'LOT-2026-T77',
  },
  {
    id: 'item-104',
    sku: 'SEA-LOB-04',
    name: 'Live Brittany Blue Lobster (Homarus gammarus)',
    category: 'Seafood',
    currentStock: 3.0,
    unit: 'kg',
    reorderThreshold: 7.0,
    optimalLevel: 18.0,
    costPerUnit: 95.0,
    storageZoneId: 'zone-3',
    storageZoneName: 'Sub-Zero Poissonier Chest',
    supplierId: 'ven-4',
    supplierName: 'Finest Brittany Artisanal Seafood',
    status: 'Low Stock',
    lastRestocked: '2026-10-14',
    origin: 'Roscoff Coast, Brittany',
    grade: 'A+ Alive in Vats',
    batchNumber: 'LOT-2026-LB02',
  },
  {
    id: 'item-105',
    sku: 'DAI-BUT-05',
    name: 'Isigny Sainte-Mère Baratte AOP Butter',
    category: 'Dairy',
    currentStock: 18.0,
    unit: 'kg',
    reorderThreshold: 6.0,
    optimalLevel: 25.0,
    costPerUnit: 22.0,
    storageZoneId: 'zone-4',
    storageZoneName: 'Pastry & Chocolate Cellar',
    supplierId: 'ven-5',
    supplierName: 'Fromagerie Beillevaire & Laiterie',
    status: 'Safe',
    lastRestocked: '2026-10-13',
    origin: 'Normandy, France',
    grade: 'AOP Unsalted 82% Fat',
    batchNumber: 'LOT-2026-B81',
  },
  {
    id: 'item-106',
    sku: 'SPC-SAF-06',
    name: 'Saffron Coupe Threads (Pure Sargol)',
    category: 'Spices',
    currentStock: 160.0,
    unit: 'grams',
    reorderThreshold: 60.0,
    optimalLevel: 250.0,
    costPerUnit: 9.8,
    storageZoneId: 'zone-6',
    storageZoneName: 'Dry Larder & Spices Reserve',
    supplierId: 'ven-2',
    supplierName: 'Maison de la Truffe Périgord',
    status: 'Safe',
    lastRestocked: '2026-09-28',
    origin: 'Khorasan Highland',
    grade: 'Category I ISO 3632',
    batchNumber: 'LOT-2026-SF09',
  },
  {
    id: 'item-107',
    sku: 'BAK-CHO-07',
    name: 'Valrhona Guanaja 70% Dark Chocolate Féves',
    category: 'Bakery & Dry Goods',
    currentStock: 14.5,
    unit: 'kg',
    reorderThreshold: 8.0,
    optimalLevel: 30.0,
    costPerUnit: 38.0,
    storageZoneId: 'zone-4',
    storageZoneName: 'Pastry & Chocolate Cellar',
    supplierId: 'ven-6',
    supplierName: 'Valrhona & Grand Épicerie Distributeurs',
    status: 'Safe',
    lastRestocked: '2026-10-10',
    origin: 'Tain-l’Hermitage, France',
    grade: 'Grand Cru Couverture',
    batchNumber: 'LOT-2026-VJ70',
  },
  {
    id: 'item-108',
    sku: 'LUX-CAV-08',
    name: 'Imperial Ossetra Caviar (Acipenser gueldenstaedtii)',
    category: 'Luxury & Deli',
    currentStock: 0.15,
    unit: 'kg',
    reorderThreshold: 0.5,
    optimalLevel: 1.5,
    costPerUnit: 2800.0,
    storageZoneId: 'zone-3',
    storageZoneName: 'Sub-Zero Poissonier Chest',
    supplierId: 'ven-4',
    supplierName: 'Finest Brittany Artisanal Seafood',
    status: 'Low Stock',
    lastRestocked: '2026-10-08',
    origin: 'Caspian Heritage Estuary',
    grade: 'Malossol Royal Gold',
    batchNumber: 'LOT-2026-CV03',
  },
  {
    id: 'item-109',
    sku: 'VEG-CHA-09',
    name: 'Wild Golden Chanterelle & Morels Mix',
    category: 'Vegetables',
    currentStock: 1.8,
    unit: 'kg',
    reorderThreshold: 4.0,
    optimalLevel: 10.0,
    costPerUnit: 48.0,
    storageZoneId: 'zone-6',
    storageZoneName: 'Dry Larder & Spices Reserve',
    supplierId: 'ven-3',
    supplierName: 'Verdant Organic Orchards & Greens',
    status: 'Low Stock',
    lastRestocked: '2026-10-13',
    origin: 'Auvergne Foraged',
    grade: 'Hand-Picked Daily',
    batchNumber: 'LOT-2026-CH88',
  },
  {
    id: 'item-110',
    sku: 'FOI-GRA-10',
    name: 'Artisanal Duck Foie Gras Entier Cru',
    category: 'Luxury & Deli',
    currentStock: 0.0,
    unit: 'kg',
    reorderThreshold: 2.5,
    optimalLevel: 8.0,
    costPerUnit: 110.0,
    storageZoneId: 'zone-1',
    storageZoneName: 'Walk-In Deep Freezer Alpha',
    supplierId: 'ven-2',
    supplierName: 'Maison de la Truffe Périgord',
    status: 'Out of Stock',
    lastRestocked: '2026-10-02',
    origin: 'Landes, France',
    grade: 'Extra Label Rouge',
    batchNumber: 'LOT-2026-FG10',
  },
  {
    id: 'item-111',
    sku: 'DAI-CRM-11',
    name: 'Double Crème Cru de Normandie (48% Fat)',
    category: 'Dairy',
    currentStock: 22.0,
    unit: 'liters',
    reorderThreshold: 10.0,
    optimalLevel: 35.0,
    costPerUnit: 14.0,
    storageZoneId: 'zone-4',
    storageZoneName: 'Pastry & Chocolate Cellar',
    supplierId: 'ven-5',
    supplierName: 'Fromagerie Beillevaire & Laiterie',
    status: 'Safe',
    lastRestocked: '2026-10-15',
    origin: 'Normandy Bocage',
    grade: 'Raw Farm Fresh',
    batchNumber: 'LOT-2026-CR48',
  },
  {
    id: 'item-112',
    sku: 'SEA-SAL-12',
    name: 'Wild Skuna Bay Salmon Fillet',
    category: 'Seafood',
    currentStock: 16.5,
    unit: 'kg',
    reorderThreshold: 6.0,
    optimalLevel: 22.0,
    costPerUnit: 44.0,
    storageZoneId: 'zone-3',
    storageZoneName: 'Sub-Zero Poissonier Chest',
    supplierId: 'ven-4',
    supplierName: 'Finest Brittany Artisanal Seafood',
    status: 'Safe',
    lastRestocked: '2026-10-14',
    origin: 'Vancouver Island Pacific',
    grade: 'Sashimi Grade AAA',
    batchNumber: 'LOT-2026-SK01',
  },
  {
    id: 'item-113',
    sku: 'MEA-BRP-13',
    name: 'Poulet de Bresse AOP Gallus',
    category: 'Meat',
    currentStock: 5.5,
    unit: 'kg',
    reorderThreshold: 9.0,
    optimalLevel: 25.0,
    costPerUnit: 36.0,
    storageZoneId: 'zone-2',
    storageZoneName: 'Meat & Charcuterie Ageing Vault',
    supplierId: 'ven-1',
    supplierName: 'Miyazaki Wagyu Purveyors Japan',
    status: 'Low Stock',
    lastRestocked: '2026-10-13',
    origin: 'Bresse, France',
    grade: 'AOP Authentique',
    batchNumber: 'LOT-2026-PB91',
  },
  {
    id: 'item-114',
    sku: 'SPC-VAN-14',
    name: 'Madagascar Bourbon Vanilla Pods (Black Gourmet)',
    category: 'Spices',
    currentStock: 0.45,
    unit: 'kg',
    reorderThreshold: 0.3,
    optimalLevel: 1.2,
    costPerUnit: 520.0,
    storageZoneId: 'zone-6',
    storageZoneName: 'Dry Larder & Spices Reserve',
    supplierId: 'ven-6',
    supplierName: 'Valrhona & Grand Épicerie Distributeurs',
    status: 'Safe',
    lastRestocked: '2026-10-11',
    origin: 'Sava Region, Madagascar',
    grade: 'Grade A Gourmet 18-20cm',
    batchNumber: 'LOT-2026-VN12',
  },
  {
    id: 'item-115',
    sku: 'VEG-MIC-15',
    name: 'Organic Micro Shiso, Amaranth & Borage Flowers',
    category: 'Vegetables',
    currentStock: 1.1,
    unit: 'kg',
    reorderThreshold: 0.8,
    optimalLevel: 2.5,
    costPerUnit: 65.0,
    storageZoneId: 'zone-4',
    storageZoneName: 'Pastry & Chocolate Cellar',
    supplierId: 'ven-3',
    supplierName: 'Verdant Organic Orchards & Greens',
    status: 'Safe',
    lastRestocked: '2026-10-15',
    origin: 'Cotswolds Hydroponic Vault',
    grade: 'Living Harvest Daily',
    batchNumber: 'LOT-2026-MS04',
  },
];

const STORAGE_KEY_ITEMS = 'etoile_inventory_items_v1';
const STORAGE_KEY_ORDERS = 'etoile_purchase_orders_v1';

class SupabaseServiceMock {
  private items: InventoryItem[] = [];
  private orders: PurchaseOrder[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
        if (stored) {
          this.items = JSON.parse(stored);
        } else {
          this.items = [...INITIAL_ITEMS];
          this.persist();
        }

        const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
        if (storedOrders) {
          this.orders = JSON.parse(storedOrders);
        } else {
          this.orders = this.seedOrders();
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(this.orders));
        }
      } catch {
        this.items = [...INITIAL_ITEMS];
        this.orders = this.seedOrders();
      }
    } else {
      this.items = [...INITIAL_ITEMS];
      this.orders = this.seedOrders();
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(this.items));
      } catch (err) {
        console.error('Failed to persist items', err);
      }
    }
    this.notify();
  }

  private seedOrders(): PurchaseOrder[] {
    return [
      {
        id: 'po-8801',
        poNumber: 'PO-2026-10-091',
        vendorId: 'ven-1',
        vendorName: 'Miyazaki Wagyu Purveyors Japan',
        vendorEmail: 'orders@miyazaki-beef-export.jp',
        items: [
          {
            itemId: 'item-101',
            itemName: 'Miyazaki A5 Wagyu Tenderloin (BMS 11)',
            quantity: 12.0,
            unit: 'kg',
            unitCost: 240.0,
            lineTotal: 2880.0,
          },
        ],
        totalAmount: 2880.0,
        status: 'Sent via SMTP',
        createdAt: '2026-10-15 08:30',
        expectedDelivery: '2026-10-17',
        deliveryNotes: 'Cryo-vacuum sealed, refrigerated air cargo flight JL-401.',
      },
      {
        id: 'po-8802',
        poNumber: 'PO-2026-10-092',
        vendorId: 'ven-2',
        vendorName: 'Maison de la Truffe Périgord',
        vendorEmail: 'appro@truffes-perigord.fr',
        items: [
          {
            itemId: 'item-102',
            itemName: 'Fresh Black Winter Truffles',
            quantity: 2.0,
            unit: 'kg',
            unitCost: 1450.0,
            lineTotal: 2900.0,
          },
          {
            itemId: 'item-110',
            itemName: 'Artisanal Duck Foie Gras Entier Cru',
            quantity: 6.0,
            unit: 'kg',
            unitCost: 110.0,
            lineTotal: 660.0,
          },
        ],
        totalAmount: 3560.0,
        status: 'Sent via SMTP',
        createdAt: '2026-10-16 09:15',
        expectedDelivery: '2026-10-17',
        deliveryNotes: 'Temperature logger #TL-903 attached.',
      },
    ];
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- CRUD API Methods ---

  public getItems(): InventoryItem[] {
    return [...this.items];
  }

  public getVendors(): Vendor[] {
    return [...INITIAL_VENDORS];
  }

  public getStorageZones(): StorageZone[] {
    return [...INITIAL_STORAGE_ZONES];
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    return [...this.orders];
  }

  private computeStatus(currentStock: number, threshold: number): StockStatus {
    if (currentStock <= 0) return 'Out of Stock';
    if (currentStock <= threshold) return 'Low Stock';
    return 'Safe';
  }

  public addItem(itemData: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>): InventoryItem {
    const status = this.computeStatus(itemData.currentStock, itemData.reorderThreshold);
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    this.items.unshift(newItem);
    this.persist();

    // Check if auto-alert needed
    if (status !== 'Safe') {
      smtpService.recordLowStockAlert(newItem);
    }

    return newItem;
  }

  public updateItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const index = this.items.findIndex((it) => it.id === id);
    if (index === -1) return null;

    const current = this.items[index];
    const newStock = updates.currentStock !== undefined ? updates.currentStock : current.currentStock;
    const newThreshold = updates.reorderThreshold !== undefined ? updates.reorderThreshold : current.reorderThreshold;
    const newStatus = this.computeStatus(newStock, newThreshold);

    const oldStatus = current.status;
    const updated: InventoryItem = {
      ...current,
      ...updates,
      status: newStatus,
    };

    this.items[index] = updated;
    this.persist();

    // Trigger SMTP if transitioned into Low Stock or Out of Stock
    if (newStatus !== 'Safe' && (oldStatus === 'Safe' || newStock < current.currentStock)) {
      smtpService.recordLowStockAlert(updated);
    }

    return updated;
  }

  public deleteItem(id: string): boolean {
    const prevLen = this.items.length;
    this.items = this.items.filter((it) => it.id !== id);
    if (this.items.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public quickReorder(itemId: string, quantity: number, notes?: string): PurchaseOrder | null {
    const item = this.items.find((it) => it.id === itemId);
    if (!item) return null;

    const vendor = INITIAL_VENDORS.find((v) => v.id === item.supplierId) || INITIAL_VENDORS[0];
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      items: [
        {
          itemId: item.id,
          itemName: item.name,
          quantity,
          unit: item.unit,
          unitCost: item.costPerUnit,
          lineTotal: quantity * item.costPerUnit,
        },
      ],
      totalAmount: quantity * item.costPerUnit,
      status: 'Sent via SMTP',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      expectedDelivery: new Date(Date.now() + vendor.leadTimeDays * 86400000).toISOString().split('T')[0],
      deliveryNotes: notes || `Direct kitchen replenishment dispatched via automated SMTP trigger.`,
    };

    this.orders.unshift(newOrder);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(this.orders));
      } catch (e) {
        console.error(e);
      }
    }

    // Trigger SMTP notification for purchase order dispatch
    smtpService.recordPurchaseOrderAlert(newOrder, item.name);
    this.notify();

    return newOrder;
  }

  public batchReorderLowStock(): PurchaseOrder[] {
    const lowStockItems = this.items.filter((it) => it.status !== 'Safe');
    const createdOrders: PurchaseOrder[] = [];

    lowStockItems.forEach((item) => {
      const orderQty = Math.max(1, Math.ceil(item.optimalLevel - item.currentStock));
      const order = this.quickReorder(item.id, orderQty, 'Automated Michelin Service Emergency Batch Reorder');
      if (order) createdOrders.push(order);
    });

    return createdOrders;
  }

  public simulateKitchenServiceConsumption(): { consumedSummary: string; alertedItems: string[] } {
    const alerted: string[] = [];
    const itemsToConsume = [
      { id: 'item-101', deduct: 1.5 }, // Wagyu
      { id: 'item-102', deduct: 0.2 }, // Truffles
      { id: 'item-103', deduct: 6.0 }, // Tomatoes
      { id: 'item-104', deduct: 1.0 }, // Lobster
      { id: 'item-105', deduct: 2.5 }, // Butter
      { id: 'item-111', deduct: 4.0 }, // Cream
      { id: 'item-113', deduct: 2.0 }, // Bresse Chicken
    ];

    itemsToConsume.forEach(({ id, deduct }) => {
      const item = this.items.find((it) => it.id === id);
      if (item && item.currentStock > 0) {
        const nextStock = Math.max(0, Number((item.currentStock - deduct).toFixed(2)));
        this.updateItem(id, { currentStock: nextStock });
        if (nextStock <= item.reorderThreshold) {
          alerted.push(item.name);
        }
      }
    });

    return {
      consumedSummary: 'Dinner rush prep deduction applied across 7 key culinary stations (-17.2 kg total ingredients).',
      alertedItems: alerted,
    };
  }

  public resetToDefaults() {
    this.items = [...INITIAL_ITEMS];
    this.orders = this.seedOrders();
    this.persist();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(this.orders));
    }
  }
}

export const supabaseService = new SupabaseServiceMock();
