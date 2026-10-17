'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Tag, Tooltip, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  BellOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { supabaseService } from '@/services/supabaseMock';
import { smtpService } from '@/services/smtpService';

const { Sider } = Layout;

interface AppSiderProps {
  activeKey: string;
  onSelectKey: (key: string) => void;
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

export default function AppSider({
  activeKey,
  onSelectKey,
  collapsed,
  onCollapse,
}: AppSiderProps) {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = supabaseService.getItems();
      setLowStockCount(items.filter((i) => i.status !== 'Safe').length);
      setAlertCount(smtpService.getAlerts().length);
    };
    update();
    const unsub1 = supabaseService.subscribe(update);
    const unsub2 = smtpService.subscribe(update);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: 'Overview Dashboard',
    },
    {
      key: 'inventory',
      icon: (
        <Badge count={lowStockCount} size="small" offset={[10, 0]}>
          <AppstoreOutlined style={{ fontSize: 16, color: '#e2e8f0' }} />
        </Badge>
      ),
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Inventory Master</span>
          {lowStockCount > 0 && !collapsed && (
            <Tag color="#ef4444" style={{ fontSize: 10, padding: '0 6px', margin: 0, borderRadius: 10 }}>
              {lowStockCount} Low
            </Tag>
          )}
        </span>
      ),
    },
    {
      key: 'analytics',
      icon: <LineChartOutlined style={{ fontSize: 16 }} />,
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Consumption Trends</span>
          {!collapsed && (
            <Tag color="cyan" style={{ fontSize: 9, padding: '0 4px', margin: 0, borderRadius: 4 }}>
              InfluxDB
            </Tag>
          )}
        </span>
      ),
    },
    {
      key: 'alerts',
      icon: (
        <Badge count={alertCount > 0 ? alertCount : 0} size="small" offset={[10, 0]} color="#f59e0b">
          <BellOutlined style={{ fontSize: 16, color: '#e2e8f0' }} />
        </Badge>
      ),
      label: (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Alerts & SMTP</span>
          {!collapsed && (
            <Tag color="orange" style={{ fontSize: 9, padding: '0 4px', margin: 0, borderRadius: 4 }}>
              SMTP Relay
            </Tag>
          )}
        </span>
      ),
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={260}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        background: '#0b1120',
        borderRight: '1px solid #1e293b',
        zIndex: 101,
      }}
    >
      {/* Sider Branding */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 20px' : '0 20px',
          gap: 12,
          borderBottom: '1px solid #1e293b',
          background: 'linear-gradient(180deg, #111a2e 0%, #0b1120 100%)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #d4af37 0%, #997316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)',
            flexShrink: 0,
          }}
        >
          <CrownOutlined style={{ fontSize: 20 }} />
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.2, overflow: 'hidden' }}>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 15,
                color: '#f8fafc',
                letterSpacing: '1px',
              }}
            >
              ÉTOILE NOIR
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.5px' }}>
              GRAND HOTEL CULINARY
            </div>
          </div>
        )}
      </div>

      {/* Sider Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey]}
        onClick={({ key }) => onSelectKey(key)}
        items={menuItems}
        style={{
          marginTop: 16,
          background: 'transparent',
          borderRight: 0,
          fontSize: 14,
        }}
      />

      {/* Sider Bottom Storage Monitor Widget */}
      {!collapsed && (
        <div
          style={{
            margin: '24px 14px',
            padding: '12px 14px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>
              <SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 6 }} />
              COLD CHAIN HACCP
            </span>
            <Tag color="#10b981" style={{ fontSize: 9, padding: '0 4px', margin: 0, border: 'none' }}>
              6/6 PASS
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
            <div>Walk-in Freezer: <strong style={{ color: '#38bdf8' }}>-20.4°C</strong></div>
            <div>Dry Age Vault: <strong style={{ color: '#fcd34d' }}>+1.8°C</strong></div>
            <div>Poissonier Chest: <strong style={{ color: '#38bdf8' }}>-1.9°C</strong></div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Tooltip title="Restore original inventory and alerts baseline">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined style={{ fontSize: 11 }} />}
                onClick={() => {
                  supabaseService.resetToDefaults();
                  smtpService.resetAlerts();
                }}
                style={{ color: '#94a3b8', fontSize: 11, padding: 0 }}
              >
                Reset Demo Master Data
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </Sider>
  );
}
