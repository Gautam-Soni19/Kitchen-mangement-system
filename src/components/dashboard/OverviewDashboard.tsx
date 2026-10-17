'use client';

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Tag,
  Button,
  Space,
  Radio,
  Progress,
  List,
  Typography,
  Tooltip,
} from 'antd';
import {
  InboxOutlined,
  WarningOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
  RightOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceArea,
  Area,
} from 'recharts';
import { supabaseService } from '@/services/supabaseMock';
import { influxDbService } from '@/services/influxDbMock';
import { smtpService } from '@/services/smtpService';
import { InventoryItem, SystemAlert, ConsumptionDataPoint, StorageZone } from '@/types';

const { Text, Title } = Typography;

interface OverviewDashboardProps {
  onNavigate: (tabKey: string) => void;
}

export default function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [storageZones, setStorageZones] = useState<StorageZone[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionDataPoint[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'vegetables' | 'meat' | 'dairy' | 'seafood' | 'luxury'>('all');

  useEffect(() => {
    const load = () => {
      setItems(supabaseService.getItems());
      setAlerts(smtpService.getAlerts());
      setStorageZones(supabaseService.getStorageZones());
      setConsumptionData(influxDbService.get24HourConsumptionData());
    };

    load();
    const unsub1 = supabaseService.subscribe(load);
    const unsub2 = smtpService.subscribe(load);

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // Compute key statistics
  const totalItemsCount = items.length;
  const lowStockItems = items.filter((it) => it.status === 'Low Stock');
  const outOfStockItems = items.filter((it) => it.status === 'Out of Stock');
  const totalWarningCount = lowStockItems.length + outOfStockItems.length;

  const totalInventoryValue = items.reduce(
    (acc, it) => acc + it.currentStock * it.costPerUnit,
    0
  );

  const purchaseOrders = supabaseService.getPurchaseOrders();
  const pendingOrdersCount = purchaseOrders.filter((po) => po.status !== 'Delivered').length;
  const pendingOrdersValue = purchaseOrders
    .filter((po) => po.status !== 'Delivered')
    .reduce((acc, po) => acc + po.totalAmount, 0);

  // Daily Consumption Volume (sum of 24h total)
  const total24hConsumptionKg = consumptionData.reduce((acc, p) => acc + p.total, 0);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #c59b27',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            color: '#f8fafc',
            fontSize: 12,
            minWidth: 180,
          }}
        >
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>Time: {label}</span>
            <span style={{ color: '#c59b27' }}>InfluxDB Stream</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
              <span style={{ color: entry.color, textTransform: 'capitalize' }}>● {entry.name}:</span>
              <strong style={{ marginLeft: 12 }}>{Number(entry.value).toFixed(1)} kg</strong>
            </div>
          ))}
          <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed rgba(255,255,255,0.15)', fontSize: 11, color: '#94a3b8' }}>
            Shift: {payload[0]?.payload?.serviceShift || 'Dinner Service'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Top Banner: Service Status & Architecture Pipeline */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #172554 100%)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 24,
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 8px 24px rgba(11, 17, 32, 0.15)',
          border: '1px solid rgba(197, 155, 39, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#fef3c7',
                letterSpacing: '0.5px',
              }}
            >
              Executive Kitchen Intelligence
            </span>
            <Tag color="#d4af37" style={{ fontWeight: 600, color: '#0b1120', border: 'none' }}>
              Michelin Haute Cuisine
            </Tag>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#93c5fd', fontSize: 13, maxWidth: 680 }}>
            Real-time telemetry pipeline integrating <strong>Supabase</strong> relational inventory,{' '}
            <strong>InfluxDB</strong> sub-second ingredient consumption & cold storage time-series, and automated{' '}
            <strong>SMTP</strong> procurement dispatch.
          </p>
        </div>

        <Space size={12}>
          <Button
            type="primary"
            icon={<InboxOutlined />}
            onClick={() => onNavigate('inventory')}
            style={{
              background: '#c59b27',
              borderColor: '#c59b27',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(197, 155, 39, 0.4)',
            }}
          >
            Manage Inventory Master
          </Button>
          <Button
            ghost
            icon={<LineChartOutlined />}
            onClick={() => onNavigate('analytics')}
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 500 }}
          >
            View InfluxDB Telemetry
          </Button>
        </Space>
      </div>

      {/* Metric Cards Row with Ant Design Card & Statistic */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {/* Metric 1: Total Inventory Items */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            style={{ height: '100%', borderTop: '4px solid #c59b27' }}
          >
            <Statistic
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>TOTAL INVENTORY ITEMS</span>
                  <InboxOutlined style={{ fontSize: 18, color: '#c59b27' }} />
                </div>
              }
              value={totalItemsCount}
              suffix={<span style={{ fontSize: 13, color: '#94a3b8' }}>SKUs</span>}
              valueStyle={{ fontWeight: 700, color: '#0f172a', fontSize: 30 }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>
                Stock Valuation: <strong style={{ color: '#0f172a' }}>${totalInventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </span>
              <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                {items.filter((i) => i.status === 'Safe').length} Safe
              </Tag>
            </div>
            <Progress
              percent={Math.round((items.filter((i) => i.status === 'Safe').length / (totalItemsCount || 1)) * 100)}
              size="small"
              strokeColor="#10b981"
              showInfo={false}
              style={{ marginTop: 10, marginBottom: 0 }}
            />
          </Card>
        </Col>

        {/* Metric 2: Low Stock Warnings */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            style={{ height: '100%', borderTop: `4px solid ${totalWarningCount > 0 ? '#ef4444' : '#10b981'}` }}
          >
            <Statistic
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>LOW STOCK WARNINGS</span>
                  <WarningOutlined style={{ fontSize: 18, color: totalWarningCount > 0 ? '#ef4444' : '#10b981' }} />
                </div>
              }
              value={totalWarningCount}
              valueStyle={{
                fontWeight: 700,
                color: totalWarningCount > 0 ? '#ef4444' : '#10b981',
                fontSize: 30,
              }}
              suffix={
                totalWarningCount > 0 ? (
                  <Tag color="error" style={{ fontSize: 11, marginLeft: 8 }}>
                    Action Required
                  </Tag>
                ) : (
                  <Tag color="success" style={{ fontSize: 11, marginLeft: 8 }}>
                    Optimal
                  </Tag>
                )
              }
            />
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Tag color="warning" style={{ fontSize: 11 }}>
                {lowStockItems.length} Below Reorder
              </Tag>
              <Tag color="error" style={{ fontSize: 11 }}>
                {outOfStockItems.length} Out of Stock
              </Tag>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MailOutlined style={{ color: '#c59b27' }} />
              <span>Automated SMTP alerts dispatched</span>
            </div>
          </Card>
        </Col>

        {/* Metric 3: Daily Consumption Volume (kg) */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            style={{ height: '100%', borderTop: '4px solid #0284c7' }}
          >
            <Statistic
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>DAILY CONSUMPTION (24H)</span>
                  <RiseOutlined style={{ fontSize: 18, color: '#0284c7' }} />
                </div>
              }
              value={total24hConsumptionKg}
              precision={1}
              suffix={<span style={{ fontSize: 13, color: '#94a3b8' }}>kg</span>}
              valueStyle={{ fontWeight: 700, color: '#0f172a', fontSize: 30 }}
            />
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <ArrowUpOutlined /> +14.2%
              </span>
              <span style={{ color: '#64748b' }}>vs yesterday dinner rush</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
              Peak Station:{' '}
              <Tag color="geekblue" style={{ fontSize: 10, margin: 0 }}>
                Sauté & Rotisserie (58 kg)
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Metric 4: Pending Purchase Orders */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            style={{ height: '100%', borderTop: '4px solid #8b5cf6' }}
          >
            <Statistic
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>PENDING PURCHASE ORDERS</span>
                  <ShoppingCartOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />
                </div>
              }
              value={pendingOrdersCount}
              suffix={<span style={{ fontSize: 13, color: '#94a3b8' }}>Active POs</span>}
              valueStyle={{ fontWeight: 700, color: '#0f172a', fontSize: 30 }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>
                Committed Cost: <strong style={{ color: '#0f172a' }}>${pendingOrdersValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </span>
              <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                SMTP Dispatched
              </Tag>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Lead time avg: 1.5 days</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Section: Real-Time InfluxDB Line Chart (Real-Time Ingredient Consumption 24H) */}
      <Card
        className="etoile-luxury-card"
        bordered={false}
        style={{ marginBottom: 24 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '4px 0' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#c59b27', fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Real-Time Ingredient Consumption (InfluxDB 24-Hour Stream)
                </span>
                <span className="pulse-green" />
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                High-frequency chronological telemetry tracking hourly kitchen station draw (kg/liters)
              </div>
            </div>

            {/* Category Filter Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio.Group
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                size="small"
                buttonStyle="solid"
              >
                <Radio.Button value="all">Total Combined</Radio.Button>
                <Radio.Button value="vegetables">Vegetables</Radio.Button>
                <Radio.Button value="meat">Meat & Poultry</Radio.Button>
                <Radio.Button value="seafood">Seafood</Radio.Button>
                <Radio.Button value="dairy">Dairy</Radio.Button>
                <Radio.Button value="luxury">Luxury & Deli</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        }
      >
        <div style={{ height: 340, width: '100%', marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={consumptionData}
              margin={{ top: 15, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                unit="kg"
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
              />

              {/* Highlight Dinner Rush Area */}
              <ReferenceArea
                x1="18:00"
                x2="22:00"
                strokeOpacity={0.3}
                fill="#fef3c7"
                fillOpacity={0.4}
                label={{
                  value: '★★★ Dinner Service Peak Rush (18:00 - 22:30)',
                  position: 'insideTopLeft',
                  fill: '#92400e',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              {/* Render lines based on filter */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'vegetables') && (
                <Line
                  type="monotone"
                  dataKey="vegetables"
                  name="Vegetables"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'meat') && (
                <Line
                  type="monotone"
                  dataKey="meat"
                  name="Meat & Poultry"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'dairy') && (
                <Line
                  type="monotone"
                  dataKey="dairy"
                  name="Dairy"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
              )}

              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'seafood') && (
                <Line
                  type="monotone"
                  dataKey="seafood"
                  name="Seafood"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
              )}

              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'luxury') && (
                <Line
                  type="monotone"
                  dataKey="luxury"
                  name="Luxury / Caviar / Truffles"
                  stroke="#c59b27"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {selectedCategoryFilter === 'all' && (
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Consumption"
                  stroke="#0f172a"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Shift Legend Bar */}
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: '#f8fafc',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span>
              <span style={{ color: '#0284c7', fontWeight: 600 }}>Breakfast Prep:</span> 06:00 - 11:00
            </span>
            <span>•</span>
            <span>
              <span style={{ color: '#059669', fontWeight: 600 }}>Lunch Service:</span> 11:00 - 15:00
            </span>
            <span>•</span>
            <span>
              <span style={{ color: '#d97706', fontWeight: 600 }}>Mise en Place:</span> 15:00 - 18:00
            </span>
            <span>•</span>
            <span>
              <span style={{ color: '#dc2626', fontWeight: 700 }}>Dinner Service Peak:</span> 18:00 - 22:30
            </span>
          </div>
          <Button
            type="link"
            size="small"
            onClick={() => onNavigate('analytics')}
            style={{ color: '#c59b27', fontWeight: 600, padding: 0 }}
          >
            Open Full InfluxDB Query Explorer →
          </Button>
        </div>
      </Card>

      {/* Secondary Row: Cold Storage IoT Live Telemetry + Recent SMTP Alerts */}
      <Row gutter={[20, 20]}>
        {/* Left: Cold Storage IoT Sensor Health */}
        <Col xs={24} lg={12}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  <SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 8 }} />
                  Cold Storage IoT Walk-In Telemetry (InfluxDB)
                </span>
                <Tag color="#10b981" style={{ border: 'none' }}>
                  HACCP Pass
                </Tag>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {storageZones.slice(0, 4).map((zone) => {
                const isOptimal = Math.abs(zone.currentTemp - zone.targetTemp) <= zone.tempTolerance;
                return (
                  <div
                    key={zone.id}
                    style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{zone.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Target: {zone.targetTemp}°C (±{zone.tempTolerance}°C) | Humidity: {zone.humidity}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={isOptimal ? 'pulse-green' : 'pulse-amber'} />
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: isOptimal ? '#0f172a' : '#d97706',
                          }}
                        >
                          {zone.currentTemp > 0 ? `+${zone.currentTemp.toFixed(1)}` : zone.currentTemp.toFixed(1)}°C
                        </span>
                        <Tag color={isOptimal ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
                          {isOptimal ? 'Optimal' : 'Checking'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <Button
                type="link"
                size="small"
                onClick={() => onNavigate('analytics')}
                style={{ color: '#c59b27', fontWeight: 600 }}
              >
                Inspect Sensor Time-Series Graphs & Calibration →
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right: Automated SMTP Alerts Feed */}
        <Col xs={24} lg={12}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  <MailOutlined style={{ color: '#c59b27', marginRight: 8 }} />
                  Recent Automated SMTP Dispatches
                </span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => onNavigate('alerts')}
                  style={{ color: '#c59b27', fontWeight: 600, padding: 0 }}
                >
                  Manage SMTP →
                </Button>
              </div>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={alerts.slice(0, 4)}
              renderItem={(alert) => (
                <List.Item
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size={6}>
                          <Tag
                            color={
                              alert.severity === 'critical'
                                ? 'error'
                                : alert.severity === 'warning'
                                ? 'warning'
                                : 'blue'
                            }
                            style={{ margin: 0, fontSize: 10, borderRadius: 4 }}
                          >
                            {alert.type}
                          </Tag>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                            {alert.title}
                          </span>
                        </Space>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {alert.timestamp.slice(11, 19)}
                        </span>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 4 }}>
                        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                          {alert.message}
                        </div>
                        <div style={{ marginTop: 4, display: 'flex', gap: 10, fontSize: 11, color: '#64748b' }}>
                          <span>
                            Recipient: <strong style={{ color: '#1e293b' }}>{alert.recipientEmail}</strong>
                          </span>
                          <span>•</span>
                          <span style={{ color: '#10b981' }}>{alert.smtpResponseCode}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
