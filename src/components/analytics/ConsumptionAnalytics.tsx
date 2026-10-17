'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Radio,
  Select,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Statistic,
  Divider,
} from 'antd';
import {
  LineChartOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import dayjs from 'dayjs';
import { influxDbService } from '@/services/influxDbMock';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ConsumptionAnalytics() {
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [granularity, setGranularity] = useState<'hourly' | 'shift' | 'daily'>('hourly');
  const [isFluxModalOpen, setIsFluxModalOpen] = useState(false);
  const [activeFluxMetric, setActiveFluxMetric] = useState<'consumption' | 'cold_storage' | 'waste'>('consumption');

  // Time-series mock data
  const hourly24hData = influxDbService.get24HourConsumptionData();
  const specificTrends = influxDbService.getSpecificItemTrends(7);
  const coldStorageTelemetry = influxDbService.getColdStorageTelemetry24H();
  const stationWasteData = influxDbService.getStationWasteTelemetry();

  // Custom tooltips
  const CustomAnalyticsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #c59b27',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            color: '#f8fafc',
            fontSize: 12,
            minWidth: 200,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              paddingBottom: 4,
              marginBottom: 6,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Time Window: {label}</span>
            <span style={{ color: '#c59b27', fontSize: 11 }}>InfluxDB Flux</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`entry-${index}`} style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
              <span style={{ color: entry.color }}>● {entry.name}:</span>
              <strong style={{ marginLeft: 12 }}>
                {Number(entry.value).toFixed(entry.name.includes('Truffle') ? 2 : 1)} {entry.unit || 'kg'}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomTempTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #38bdf8',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            color: '#f8fafc',
            fontSize: 12,
            minWidth: 210,
          }}
        >
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4, marginBottom: 6 }}>
            Sensor Log: {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`temp-${index}`} style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
              <span style={{ color: entry.color }}>● {entry.name}:</span>
              <strong>{Number(entry.value).toFixed(1)} °C</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, fontFamily: "'Cinzel', serif", color: '#0f172a' }}>
              Consumption Analytics & InfluxDB Telemetry
            </Title>
            <Tag color="cyan" style={{ fontWeight: 600 }}>
              InfluxDB Time-Series v3
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Continuous IoT sensor readings, peak service volume surges, vegetable consumption trends, and cold-chain compliance logs.
          </Text>
        </div>

        {/* Global Time Filter Controls */}
        <Space size={10} wrap>
          {/* Ant Design DatePicker.RangePicker */}
          <RangePicker
            value={timeRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setTimeRange([dates[0], dates[1]]);
              }
            }}
            style={{ borderRadius: 6 }}
          />

          <Radio.Group
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="hourly">Hourly (1h)</Radio.Button>
            <Radio.Button value="shift">By Service Shift</Radio.Button>
            <Radio.Button value="daily">Daily (7d)</Radio.Button>
          </Radio.Group>

          <Button
            icon={<CodeOutlined />}
            onClick={() => setIsFluxModalOpen(true)}
            style={{ fontWeight: 500 }}
          >
            Inspect InfluxDB Flux Query
          </Button>
        </Space>
      </div>

      {/* Summary KPI Highlights */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card className="etoile-luxury-card" bordered={false} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>PEAK DINNER SURGE (20:00)</span>}
              value={31.4}
              suffix="kg/hr"
              valueStyle={{ fontWeight: 700, color: '#0f172a' }}
            />
            <div style={{ fontSize: 11, color: '#d97706', marginTop: 4 }}>
              ★★★ 12 Tasting Menus in pass
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="etoile-luxury-card" bordered={false} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>HEIRLOOM VEGETABLE DRAW</span>}
              value={19.5}
              suffix="kg today"
              valueStyle={{ fontWeight: 700, color: '#10b981' }}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              San Marzano & Wild Chanterelles
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="etoile-luxury-card" bordered={false} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>KITCHEN YIELD RATE</span>}
              value={93.8}
              suffix="%"
              valueStyle={{ fontWeight: 700, color: '#0284c7' }}
            />
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
              +1.2% waste reduction vs target
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="etoile-luxury-card" bordered={false} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#64748b' }}>IoT SENSOR UPTIME</span>}
              value={99.98}
              suffix="%"
              valueStyle={{ fontWeight: 700, color: '#8b5cf6' }}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              6/6 Cold Storage Probes Active
            </div>
          </Card>
        </Col>
      </Row>

      {/* Chart 1: Historical Vegetable & Critical Ingredient Peak Usage Trends */}
      <Card
        className="etoile-luxury-card"
        bordered={false}
        style={{ marginBottom: 20 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: '#10b981', fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Vegetable & Prime Ingredient Consumption Trends (Dinner Service Peak Analysis)
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Time-series tracking high-velocity produce (Heirloom San Marzano, Wild Chanterelles) vs luxury proteins
              </div>
            </div>

            <Tag color="#10b981" style={{ border: 'none', fontWeight: 600 }}>
              Dinner Rush Highlighted
            </Tag>
          </div>
        }
      >
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={specificTrends} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTomato" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorWagyu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorButter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="kg" />
              <RechartsTooltip content={<CustomAnalyticsTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 12 }} />

              <Area
                type="monotone"
                dataKey="heirloomTomatoes"
                name="Heirloom Tomatoes (San Marzano)"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorTomato)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="wagyuTenderloin"
                name="Miyazaki A5 Wagyu Tenderloin"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorWagyu)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="normandyButter"
                name="Isigny Ste-Mère Butter AOP"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorButter)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="chanterelles"
                name="Wild Golden Chanterelles"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="blackTruffles"
                name="Black Winter Truffles (kg)"
                stroke="#c59b27"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: Cold-Storage Continuous Temperature Telemetry (InfluxDB IoT Logs) */}
      <Card
        className="etoile-luxury-card"
        bordered={false}
        style={{ marginBottom: 20 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#0284c7', fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Cold-Storage IoT Continuous Temperature Telemetry (InfluxDB)
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Sub-minute probe readings for Walk-In Deep Freezer (-20°C target), Meat Ageing Vault (1.5°C), and Poissonier Chest (-2.0°C)
              </div>
            </div>

            <Space>
              <Tag color="cyan">HACCP Automated Log</Tag>
              <Tag color="purple">Hot-Gas Defrost Cycle at 16:00</Tag>
            </Space>
          </div>
        }
      >
        <div style={{ height: 320, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={coldStorageTelemetry} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="°C" />
              <RechartsTooltip content={<CustomTempTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 12 }} />

              {/* Reference threshold lines */}
              <ReferenceLine y={-20} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Freezer Target (-20°C)', fill: '#0284c7', fontSize: 11 }} />
              <ReferenceLine y={1.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Meat Ageing (1.5°C)', fill: '#d97706', fontSize: 11 }} />

              <Line
                type="monotone"
                dataKey="walkInFreezer"
                name="Walk-In Freezer Alpha"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="meatChiller"
                name="Meat & Charcuterie Vault"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="seafoodCryo"
                name="Sub-Zero Poissonier Chest"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="pastryVault"
                name="Pastry & Chocolate Cellar"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 3: Kitchen Station Yield vs Trimming Waste */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            title={
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Culinary Brigade Station Yield vs Organic Trimming Waste (kg)
              </span>
            }
          >
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationWasteData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="station" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="kg" />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10 }} />
                  <Bar dataKey="preparedKg" name="Active Food Prepared (kg)" fill="#c59b27" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="trimWasteKg" name="Compostable Trimmings (kg)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            className="etoile-luxury-card"
            bordered={false}
            title={
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                HACCP Compliance & Time-Series Audit
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    Walk-In Deep Freezer Defrost Integrity
                  </span>
                  <Tag color="success">Verified Pass</Tag>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Maximum excursion duration: 14 mins (-17.8°C). Well within HACCP critical control threshold of -15.0°C.
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    Dry Ageing Meat Room Humidity Stability
                  </span>
                  <Tag color="success">78% Optimal</Tag>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Ultrasonic misting cycle engaged at 75%. Air velocity constant at 0.5 m/s.
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    Daily InfluxDB Telemetry Data Points
                  </span>
                  <strong style={{ color: '#0f172a' }}>86,400 points</strong>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Sub-second sampling rate pushed directly from kitchen IoT gateway micro-controllers.
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= MODAL: INFLUXDB FLUX QUERY EXPLORER ================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CodeOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>InfluxDB Flux Script Explorer</span>
          </div>
        }
        open={isFluxModalOpen}
        onCancel={() => setIsFluxModalOpen(false)}
        footer={null}
        width={720}
      >
        <div style={{ marginTop: 12 }}>
          <Paragraph style={{ color: '#64748b', fontSize: 13 }}>
            Inspect the underlying Flux query executed against the InfluxDB bucket to aggregate this time-series visualization in real-time.
          </Paragraph>

          <Radio.Group
            value={activeFluxMetric}
            onChange={(e) => setActiveFluxMetric(e.target.value)}
            style={{ marginBottom: 14 }}
          >
            <Radio.Button value="consumption">Ingredient Consumption Flux</Radio.Button>
            <Radio.Button value="cold_storage">Cold Storage IoT Telemetry Flux</Radio.Button>
            <Radio.Button value="waste">Culinary Yield & Waste Flux</Radio.Button>
          </Radio.Group>

          <div
            className="terminal-window"
            style={{ padding: 16, overflowX: 'auto', whiteSpace: 'pre-wrap' }}
          >
            {influxDbService.generateFluxQuery(activeFluxMetric, '24h')}
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Connected Endpoint: <code>https://influxdb.etoile-internal.net:8086</code>
            </span>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={() => {
                setIsFluxModalOpen(false);
              }}
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
            >
              Close Explorer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
