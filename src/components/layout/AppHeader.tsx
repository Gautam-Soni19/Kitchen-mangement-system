'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout,
  Button,
  Badge,
  Dropdown,
  Avatar,
  Space,
  Tag,
  Tooltip,
  notification,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BellOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { supabaseService } from '@/services/supabaseMock';
import { smtpService } from '@/services/smtpService';
import { SystemAlert } from '@/types';
import { signOut } from '@/services/supabaseAuth';

const { Header } = Layout;

interface AppHeaderProps {
  onNavigateToAlerts?: () => void;
  onOpenSimulator?: () => void;
}

export default function AppHeader({ onNavigateToAlerts }: AppHeaderProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<'Executive Chef' | 'Purchasing Director' | 'F&B Auditor'>(
    'Executive Chef'
  );

  useEffect(() => {
    const updateStats = () => {
      const items = supabaseService.getItems();
      const low = items.filter((it) => it.status !== 'Safe').length;
      setLowStockCount(low);
      setAlerts(smtpService.getAlerts().slice(0, 5));
    };

    updateStats();
    const unsubSupabase = supabaseService.subscribe(updateStats);
    const unsubSmtp = smtpService.subscribe(updateStats);

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);

    return () => {
      unsubSupabase();
      unsubSmtp();
      clearInterval(timer);
    };
  }, []);

  const handleSimulateQuickRush = () => {
    const result = supabaseService.simulateKitchenServiceConsumption();
    notification.warning({
      message: 'Dinner Rush Ticket Simulated',
      description: `${result.consumedSummary} Stock updated. ${
        result.alertedItems.length > 0
          ? `Automated SMTP alert triggered for: ${result.alertedItems.join(', ')}.`
          : 'All items within safe thresholds.'
      }`,
      placement: 'topRight',
      icon: <FireOutlined style={{ color: '#ef4444' }} />,
    });
  };

  const notificationMenu: MenuProps['items'] = [
    {
      key: 'header',
      type: 'group',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>Automated SMTP Alerts</span>
          <Tag color="gold">{lowStockCount} Action Needed</Tag>
        </div>
      ),
    },
    ...alerts.map((al) => ({
      key: al.id,
      label: (
        <div style={{ maxWidth: 320, padding: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: al.severity === 'critical' ? '#ef4444' : '#d97706' }}>
              {al.title}
            </span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{al.timestamp.slice(11, 16)}</span>
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 2, whiteSpace: 'normal', lineHeight: 1.4 }}>
            {al.message.length > 90 ? `${al.message.slice(0, 90)}...` : al.message}
          </div>
          <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
              SMTP {al.smtpStatus}
            </Tag>
            <span style={{ fontSize: 11, color: '#64748b' }}>{al.recipientEmail}</span>
          </div>
        </div>
      ),
    })),
    {
      type: 'divider',
    },
    {
      key: 'view-all',
      label: (
        <Button
          type="link"
          block
          onClick={onNavigateToAlerts}
          style={{ fontWeight: 600, color: '#c59b27', padding: 0 }}
        >
          View All System Alerts & SMTP Logs →
        </Button>
      ),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>Chef Jean-Luc Laurent</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Executive Chef & Culinary Director</div>
          <div style={{ fontSize: 11, color: '#c59b27', marginTop: 2 }}>★★★ Michelin Guide Inspector Verified</div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'role-switch',
      type: 'group',
      label: 'Switch Active Role Context',
      children: [
        {
          key: 'role-chef',
          label: (
            <span onClick={() => setCurrentUserRole('Executive Chef')}>
              {currentUserRole === 'Executive Chef' ? '✓ ' : ''}Executive Chef (Kitchen Command)
            </span>
          ),
        },
        {
          key: 'role-buyer',
          label: (
            <span onClick={() => setCurrentUserRole('Purchasing Director')}>
              {currentUserRole === 'Purchasing Director' ? '✓ ' : ''}Purchasing Director (Procurement)
            </span>
          ),
        },
        {
          key: 'role-auditor',
          label: (
            <span onClick={() => setCurrentUserRole('F&B Auditor')}>
              {currentUserRole === 'F&B Auditor' ? '✓ ' : ''}F&B Controller / HACCP Auditor
            </span>
          ),
        },
      ],
    },
    { type: 'divider' },
    {
      key: 'supabase-status',
      icon: <DatabaseOutlined style={{ color: '#10b981' }} />,
      label: 'Supabase Master DB: Connected (24ms)',
    },
    {
      key: 'influx-status',
      icon: <ThunderboltOutlined style={{ color: '#0284c7' }} />,
      label: 'InfluxDB Time-Series: Live 100Hz',
    },
    { type: 'divider' },
    { key: 'sign-out', label: 'Sign out', onClick: async () => { await signOut(); router.replace('/admin/login'); } },
  ];

  return (
    <Header
      style={{
        background: '#ffffff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Left: Restaurant Identity & Active Shift */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 17,
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '1px',
              }}
            >
              L&apos;ÉTOILE RESTAURANT & GRAND HOTEL
            </span>
            <Tag color="#c59b27" style={{ fontWeight: 600, border: 'none', color: '#fff' }}>
              3-MICHELIN ★★★
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Fine Dining Operations</span>
            <span>•</span>
            <span className="pulse-green" />
            <span style={{ color: '#047857', fontWeight: 600 }}>Active Dinner Service (18:00 - 23:00)</span>
            <span>•</span>
            <ClockCircleOutlined style={{ fontSize: 10 }} />
            <span>Kitchen Time: {currentTime || '21:15:25'}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Simulation & User Profile */}
      <Space orientation="horizontal" size={14} style={{ display: 'flex', alignItems: 'center' }}>
        {/* Live Simulation Button */}
        <Tooltip title="Simulate immediate ticket rush consumption across 7 culinary stations">
          <Button
            type="primary"
            icon={<FireOutlined />}
            onClick={handleSimulateQuickRush}
            style={{
              background: 'linear-gradient(135deg, #c59b27 0%, #b48c20 100%)',
              borderColor: '#b48c20',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(197, 155, 39, 0.3)',
            }}
          >
            Simulate Dinner Rush Ticket
          </Button>
        </Tooltip>

        {/* Database Status Pills */}
        <div style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <Tag color="cyan" icon={<DatabaseOutlined />} style={{ borderRadius: 12 }}>
            Supabase Master: Live
          </Tag>
          <Tag color="geekblue" icon={<ThunderboltOutlined />} style={{ borderRadius: 12 }}>
            InfluxDB: 24h
          </Tag>
        </div>

        {/* Notifications Popover */}
        <Dropdown menu={{ items: notificationMenu }} trigger={['click']} placement="bottomRight">
          <Badge count={lowStockCount} offset={[-2, 6]} overflowCount={99}>
            <Button
              shape="circle"
              icon={<BellOutlined style={{ fontSize: 17, color: '#334155' }} />}
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}
            />
          </Badge>
        </Dropdown>

        {/* User Profile */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Avatar
              style={{
                backgroundColor: '#c59b27',
                verticalAlign: 'middle',
                fontWeight: 700,
              }}
              size={32}
            >
              JL
            </Avatar>
            <div style={{ lineHeight: 1.2, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Chef Jean-Luc</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{currentUserRole}</div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
