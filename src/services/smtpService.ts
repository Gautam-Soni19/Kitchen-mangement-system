import { SystemAlert, SmtpConfig, InventoryItem, PurchaseOrder } from '@/types';

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: 'smtp.grandhotel-etoile.internal',
  port: 587,
  secure: true,
  username: 'kitchen.procurement@etoile-hospitality.com',
  authPasswordMasked: '••••••••••••••••',
  senderEmail: 'automated-kitchen@etoile-hospitality.com',
  senderName: "L'Étoile Kitchen Auto-Dispatcher",
  executiveChefEmail: 'chef.jeanluc@etoile-hospitality.com',
  purchasingManagerEmail: 'purchasing.director@etoile-hospitality.com',
  sousChefEmail: 'souschef.brigade@etoile-hospitality.com',
  dailyReportCron: '0 06 * * *',
  dailyReportTime: '06:00 AM',
  reportFormat: 'PDF',
  autoAlertOnThreshold: true,
};

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alt-101',
    timestamp: '2026-10-16 19:42:10',
    type: 'Low Stock',
    severity: 'critical',
    title: 'Critical Threshold Breach: Miyazaki A5 Wagyu',
    message: 'Stock fell to 4.2 kg (Threshold: 8.0 kg). Automated SMTP notification dispatched to Purchasing Manager and Executive Chef.',
    recipientEmail: 'purchasing.director@etoile-hospitality.com',
    smtpStatus: 'Delivered',
    smtpResponseCode: '250 2.0.0 OK: queued as 4X88F19-P0',
    metadata: {
      itemName: 'Miyazaki A5 Wagyu Tenderloin (BMS 11)',
      currentStock: 4.2,
      threshold: 8.0,
    },
  },
  {
    id: 'alt-102',
    timestamp: '2026-10-16 18:15:32',
    type: 'PO Auto-Trigger',
    severity: 'info',
    title: 'Automated Purchase Order PO-2026-10-092 Sent',
    message: 'PO for 2.0 kg Black Winter Truffles & 6.0 kg Foie Gras dispatched via SMTP to Maison de la Truffe Périgord (appro@truffes-perigord.fr).',
    recipientEmail: 'appro@truffes-perigord.fr',
    smtpStatus: 'Delivered',
    smtpResponseCode: '250 2.1.5 Recipient OK. Message accepted for delivery',
    metadata: {
      poNumber: 'PO-2026-10-092',
    },
  },
  {
    id: 'alt-103',
    timestamp: '2026-10-16 16:30:00',
    type: 'Cold Storage Temp',
    severity: 'warning',
    title: 'Walk-In Deep Freezer Defrost Cycle Telemetry',
    message: 'Sensor #IoT-FREEZER-01 reported brief spike to -17.8°C during scheduled hot-gas defrost. Returned to -20.4°C within 14 minutes.',
    recipientEmail: 'chef.jeanluc@etoile-hospitality.com',
    smtpStatus: 'Delivered',
    smtpResponseCode: '250 2.0.0 OK: telemetry alert logged',
    metadata: {
      zoneName: 'Walk-In Deep Freezer Alpha',
      tempRecorded: -17.8,
    },
  },
  {
    id: 'alt-104',
    timestamp: '2026-10-16 14:05:18',
    type: 'Low Stock',
    severity: 'critical',
    title: 'Zero Stock Depletion: Duck Foie Gras Entier Cru',
    message: 'Stock depleted to 0.0 kg. Automated emergency procurement trigger active. Vendor Maison de la Truffe notified.',
    recipientEmail: 'purchasing.director@etoile-hospitality.com',
    smtpStatus: 'Delivered',
    smtpResponseCode: '250 2.0.0 OK: queued as 9K117A-URGENT',
    metadata: {
      itemName: 'Artisanal Duck Foie Gras Entier Cru',
      currentStock: 0.0,
      threshold: 2.5,
    },
  },
  {
    id: 'alt-105',
    timestamp: '2026-10-16 06:00:01',
    type: 'System Test',
    severity: 'info',
    title: 'Daily Master Inventory Audit Report Dispatched',
    message: 'Automated 06:00 AM Culinary Inventory Digest generated (PDF, 4.2 MB) and delivered to culinary directorship via SMTP relay.',
    recipientEmail: 'chef.jeanluc@etoile-hospitality.com, purchasing.director@etoile-hospitality.com',
    smtpStatus: 'Delivered',
    smtpResponseCode: '250 2.0.0 Report digest mail successfully handed off to MX relay',
  },
];

const STORAGE_KEY_ALERTS = 'etoile_smtp_alerts_v1';
const STORAGE_KEY_CONFIG = 'etoile_smtp_config_v1';

class SmtpService {
  private alerts: SystemAlert[] = [];
  private config: SmtpConfig = DEFAULT_SMTP_CONFIG;
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      try {
        const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
        this.alerts = storedAlerts ? JSON.parse(storedAlerts) : [...INITIAL_ALERTS];

        const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
        this.config = storedConfig ? JSON.parse(storedConfig) : { ...DEFAULT_SMTP_CONFIG };
      } catch {
        this.alerts = [...INITIAL_ALERTS];
        this.config = { ...DEFAULT_SMTP_CONFIG };
      }
    } else {
      this.alerts = [...INITIAL_ALERTS];
      this.config = { ...DEFAULT_SMTP_CONFIG };
    }
  }

  private persistAlerts() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(this.alerts));
      } catch (e) {
        console.error(e);
      }
    }
    this.notify();
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

  public getAlerts(): SystemAlert[] {
    return [...this.alerts];
  }

  public getConfig(): SmtpConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: SmtpConfig) {
    this.config = { ...newConfig };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
      } catch (e) {
        console.error(e);
      }
    }
    this.notify();
  }

  public recordLowStockAlert(item: InventoryItem): SystemAlert {
    const isOutOfStock = item.currentStock <= 0;
    const alert: SystemAlert = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'Low Stock',
      severity: isOutOfStock ? 'critical' : 'warning',
      title: isOutOfStock
        ? `OUT OF STOCK ALERT: ${item.name}`
        : `Low Stock Automated Alert: ${item.name}`,
      message: `${item.name} stock level reached ${item.currentStock} ${item.unit} (Below reorder threshold: ${item.reorderThreshold} ${item.unit}). Automated replenishment advisory dispatched via SMTP to ${this.config.purchasingManagerEmail}.`,
      recipientEmail: this.config.purchasingManagerEmail,
      smtpStatus: 'Delivered',
      smtpResponseCode: `250 2.0.0 OK: queued as ${Math.random().toString(36).substring(2, 8).toUpperCase()}-SMTP`,
      metadata: {
        itemName: item.name,
        currentStock: item.currentStock,
        threshold: item.reorderThreshold,
      },
    };

    this.alerts.unshift(alert);
    this.persistAlerts();
    return alert;
  }

  public recordPurchaseOrderAlert(po: PurchaseOrder, itemName?: string): SystemAlert {
    const alert: SystemAlert = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'PO Auto-Trigger',
      severity: 'info',
      title: `Purchase Order ${po.poNumber} Dispatched`,
      message: `Purchase Order for ${po.items.length} item(s) ${itemName ? `(${itemName})` : ''} totaling $${po.totalAmount.toFixed(2)} automatically transmitted to ${po.vendorName} via SMTP (${po.vendorEmail}).`,
      recipientEmail: po.vendorEmail,
      smtpStatus: 'Delivered',
      smtpResponseCode: `250 2.1.5 Recipient verified. PO Document attached via MIME multipart/pdf`,
      metadata: {
        poNumber: po.poNumber,
      },
    };

    this.alerts.unshift(alert);
    this.persistAlerts();
    return alert;
  }

  public recordTemperatureAlert(zoneName: string, tempRecorded: number, targetTemp: number): SystemAlert {
    const alert: SystemAlert = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'Cold Storage Temp',
      severity: 'critical',
      title: `Cold Storage Anomaly: ${zoneName}`,
      message: `IoT Telemetry registered temperature deviation: ${tempRecorded}°C (Target: ${targetTemp}°C). Automated escalation email dispatched to Executive Chef & Facilities Director.`,
      recipientEmail: `${this.config.executiveChefEmail}, facilities@grandhotel-etoile.internal`,
      smtpStatus: 'Delivered',
      smtpResponseCode: `250 2.0.0 Escalation SMS & SMTP Relay Broadcast Succeeded`,
      metadata: {
        zoneName,
        tempRecorded,
      },
    };

    this.alerts.unshift(alert);
    this.persistAlerts();
    return alert;
  }

  public clearAlerts() {
    this.alerts = [];
    this.persistAlerts();
  }

  public resetAlerts() {
    this.alerts = [...INITIAL_ALERTS];
    this.persistAlerts();
  }

  public async simulateSmtpHandshake(targetEmail: string, subject: string): Promise<{
    success: boolean;
    logs: string[];
    responseCode: string;
  }> {
    const logs: string[] = [
      `[CLIENT] Resolving MX records for ${targetEmail.split('@')[1] || 'domain.com'}...`,
      `[CLIENT] Connecting to SMTP server ${this.config.host}:${this.config.port}...`,
      `[SERVER] 220 ${this.config.host} ESMTP Etoile-Relay/4.96 ready at ${new Date().toUTCString()}`,
      `[CLIENT] EHLO kitchen-gateway.etoile-hospitality.internal`,
      `[SERVER] 250-${this.config.host} Hello kitchen-gateway, pleased to meet you`,
      `[SERVER] 250-SIZE 35882570`,
      `[SERVER] 250-8BITMIME`,
      `[SERVER] 250-STARTTLS`,
      `[SERVER] 250-AUTH PLAIN LOGIN`,
      `[SERVER] 250 ENHANCEDSTATUSCODES`,
      `[CLIENT] STARTTLS`,
      `[SERVER] 220 2.0.0 Ready to start TLS (TLSv1.3 / ECDHE-RSA-AES256-GCM-SHA384)`,
      `[CLIENT] AUTH LOGIN [${this.config.username}]`,
      `[SERVER] 235 2.7.0 Authentication successful`,
      `[CLIENT] MAIL FROM:<${this.config.senderEmail}>`,
      `[SERVER] 250 2.1.0 Sender <${this.config.senderEmail}> OK`,
      `[CLIENT] RCPT TO:<${targetEmail}>`,
      `[SERVER] 250 2.1.5 Recipient <${targetEmail}> OK`,
      `[CLIENT] DATA`,
      `[SERVER] 354 End data with <CR><LF>.<CR><LF>`,
      `[CLIENT] Subject: ${subject}`,
      `[CLIENT] From: "${this.config.senderName}" <${this.config.senderEmail}>`,
      `[CLIENT] To: <${targetEmail}>`,
      `[CLIENT] Content-Type: multipart/alternative; boundary="boundary-etoile"`,
      `[CLIENT] .`,
      `[SERVER] 250 2.0.0 OK: message 6289A4 queued for immediate delivery`,
      `[CLIENT] QUIT`,
      `[SERVER] 221 2.0.0 ${this.config.host} closing connection`,
    ];

    const testAlert: SystemAlert = {
      id: `alt-test-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'System Test',
      severity: 'info',
      title: `Manual SMTP Test Ping to ${targetEmail}`,
      message: `Diagnostic SMTP handshake executed successfully against ${this.config.host}:${this.config.port}. Subject: "${subject}".`,
      recipientEmail: targetEmail,
      smtpStatus: 'Delivered',
      smtpResponseCode: '250 2.0.0 OK: message accepted',
    };

    this.alerts.unshift(testAlert);
    this.persistAlerts();

    return {
      success: true,
      logs,
      responseCode: '250 2.0.0 OK',
    };
  }
}

export const smtpService = new SmtpService();
