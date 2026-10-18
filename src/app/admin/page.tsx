'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, FloatButton, Modal, Button, Typography, notification } from 'antd';
import {
  FireOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import AppHeader from '@/components/layout/AppHeader';
import AppSider from '@/components/layout/AppSider';
import OverviewDashboard from '@/components/dashboard/OverviewDashboard';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import ConsumptionAnalytics from '@/components/analytics/ConsumptionAnalytics';
import AlertsAndSettings from '@/components/settings/AlertsAndSettings';
import CustomerOrders from '@/components/orders/CustomerOrders';
import { supabaseService } from '@/services/supabaseMock';
import { smtpService } from '@/services/smtpService';
import { getCurrentUser } from '@/services/supabaseAuth';

const { Content, Footer } = Layout;
const { Paragraph } = Typography;

export default function Home() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser().then((user) => {
      if (!active) return;
      if (user?.app_metadata?.role === 'admin') setAuthorized(true);
      else router.replace('/admin/login');
      setCheckingAuth(false);
    });
    return () => { active = false; };
  }, [router]);

  if (checkingAuth || !authorized) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>Checking staff access…</div>;

  // Simulation actions
  const handleSimulateServiceRush = () => {
    const res = supabaseService.simulateKitchenServiceConsumption();
    setIsSimulatorOpen(false);
    notification.warning({
      message: 'Active Dinner Service Ticket Executed',
      description: `${res.consumedSummary} ${
        res.alertedItems.length > 0
          ? `Low stock threshold breached for: ${res.alertedItems.join(', ')}. Automated SMTP notification transmitted.`
          : 'All stock levels within safe limits.'
      }`,
      placement: 'topRight',
      icon: <FireOutlined style={{ color: '#ef4444' }} />,
    });
  };

  const handleSimulateTempAnomaly = () => {
    smtpService.recordTemperatureAlert('Walk-In Deep Freezer Alpha', -16.2, -20.0);
    setIsSimulatorOpen(false);
    notification.error({
      message: 'Cold Storage IoT Anomaly Detected',
      description: 'Walk-In Deep Freezer rose to -16.2°C (Limit: -18.0°C). Automated emergency escalation email sent to Executive Chef & Facilities Director via SMTP.',
      placement: 'topRight',
    });
  };

  const handleResetData = () => {
    supabaseService.resetToDefaults();
    smtpService.resetAlerts();
    setIsSimulatorOpen(false);
    notification.success({
      message: 'Baseline Master Data Restored',
      description: 'Default inventory stock levels and demonstration alert logs re-initialized.',
      placement: 'topRight',
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Ant Design Sider */}
      <AppSider
        activeKey={activeTab}
        onSelectKey={(key) => setActiveTab(key)}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />

      {/* Main Layout Area */}
      <Layout style={{ background: '#f8fafc' }}>
        {/* Ant Design Header */}
        <AppHeader
          onNavigateToAlerts={() => setActiveTab('alerts')}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* Ant Design Content Area */}
        <Content style={{ minHeight: 'calc(100vh - 128px)' }}>
          {activeTab === 'dashboard' && (
            <OverviewDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'inventory' && <InventoryManagement />}

          {activeTab === 'analytics' && <ConsumptionAnalytics />}

          {activeTab === 'alerts' && <AlertsAndSettings />}

          {activeTab === 'orders' && <CustomerOrders />}
        </Content>

        {/* Luxury Hospitality Footer */}
        <Footer
          style={{
            textAlign: 'center',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px',
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, maxWidth: 1600, margin: '0 auto' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>L&apos;ÉTOILE RESTAURANT & GRAND HOTEL</span> · Culinary operations & cold-chain management
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <span>
                Relational Master: <strong style={{ color: '#10b981' }}>Supabase</strong>
              </span>
              <span>•</span>
              <span>
                Time-Series Telemetry: <strong style={{ color: '#0284c7' }}>InfluxDB</strong>
              </span>
              <span>•</span>
              <span>
                Automated Triggers: <strong style={{ color: '#c59b27' }}>SMTP Gateway</strong>
              </span>
            </div>
          </div>
        </Footer>
      </Layout>

      {/* Floating Action Simulator Button */}
      <FloatButton
        icon={<ExperimentOutlined />}
        type="primary"
        tooltip="Simulate Live Kitchen Operations & Triggers"
        onClick={() => setIsSimulatorOpen(true)}
        style={{ right: 28, bottom: 28, width: 48, height: 48 }}
      />

      {/* Simulation Control Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExperimentOutlined style={{ color: '#c59b27' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Live Kitchen Operations Simulator</span>
          </div>
        }
        open={isSimulatorOpen}
        onCancel={() => setIsSimulatorOpen(false)}
        footer={null}
        width={560}
      >
        <div style={{ marginTop: 12 }}>
          <Paragraph style={{ color: '#64748b', fontSize: 13 }}>
            Test the full reactive pipeline in action. Trigger realistic dining room ticket surges, cold-storage temperature spikes, or baseline resets to observe how Supabase stock drops, InfluxDB telemetry plots, and SMTP dispatch alerts fire!
          </Paragraph>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
            <div
              style={{
                padding: '14px 16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                  Simulate 5-Course Dinner Service Rush
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Deducts produce across 7 culinary stations (-17.2 kg total). Triggers automated low-stock alerts.
                </div>
              </div>
              <Button
                type="primary"
                icon={<FireOutlined />}
                onClick={handleSimulateServiceRush}
                style={{
                  background: '#c59b27',
                  borderColor: '#c59b27',
                  fontWeight: 600,
                }}
              >
                Fire Rush Ticket
              </Button>
            </div>

            <div
              style={{
                padding: '14px 16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                  Simulate Cold Storage Temp Spike
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Forces a -16.2°C temperature excursion on Walk-In Freezer Alpha and dispatches SMTP emergency notification.
                </div>
              </div>
              <Button
                danger
                icon={<ThunderboltOutlined />}
                onClick={handleSimulateTempAnomaly}
              >
                Trigger Spike
              </Button>
            </div>

            <div
              style={{
                padding: '14px 16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                  Reset All Demo Data
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Restores original stock levels, baseline purchase orders, and pre-seeded SMTP alert logs.
                </div>
              </div>
              <Button onClick={handleResetData}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
