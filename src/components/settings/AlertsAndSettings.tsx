'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  List,
  Tag,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Select,
  Typography,
  Space,
  Row,
  Col,
  TimePicker,
  Modal,
  Alert,
  Tooltip,
  Badge,
  message,
  Divider,
} from 'antd';
import {
  MailOutlined,
  SettingOutlined,
  BellOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { smtpService } from '@/services/smtpService';
import { SystemAlert, SmtpConfig } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AlertsAndSettings() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [config, setConfig] = useState<SmtpConfig>(smtpService.getConfig());
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Diagnostic Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTraceLogs, setSmtpTraceLogs] = useState<string[]>([]);
  const [testResultSuccess, setTestResultSuccess] = useState<boolean | null>(null);

  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();

  useEffect(() => {
    loadData();
    const unsub = smtpService.subscribe(loadData);
    return () => unsub();
  }, []);

  const loadData = () => {
    const currentAlerts = smtpService.getAlerts();
    const currentConfig = smtpService.getConfig();
    setAlerts(currentAlerts);
    setConfig(currentConfig);
    setTestEmail(currentConfig.purchasingManagerEmail);

    form.setFieldsValue({
      host: currentConfig.host,
      port: currentConfig.port,
      secure: currentConfig.secure,
      username: currentConfig.username,
      senderEmail: currentConfig.senderEmail,
      senderName: currentConfig.senderName,
      executiveChefEmail: currentConfig.executiveChefEmail,
      purchasingManagerEmail: currentConfig.purchasingManagerEmail,
      sousChefEmail: currentConfig.sousChefEmail,
    });

    reportForm.setFieldsValue({
      dailyReportTime: dayjs('06:00', 'HH:mm'),
      dailyReportCron: currentConfig.dailyReportCron,
      reportFormat: currentConfig.reportFormat,
      autoAlertOnThreshold: currentConfig.autoAlertOnThreshold,
    });
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((al) => {
    const matchSev = severityFilter === 'all' || al.severity === severityFilter;
    const matchType = typeFilter === 'all' || al.type === typeFilter;
    return matchSev && matchType;
  });

  // Save SMTP settings
  const handleSaveSmtpConfig = (values: any) => {
    const updated: SmtpConfig = {
      ...config,
      host: values.host,
      port: values.port,
      secure: values.secure,
      username: values.username,
      senderEmail: values.senderEmail,
      senderName: values.senderName,
      executiveChefEmail: values.executiveChefEmail,
      purchasingManagerEmail: values.purchasingManagerEmail,
      sousChefEmail: values.sousChefEmail,
    };
    smtpService.saveConfig(updated);
    message.success('SMTP Relay server settings updated successfully.');
  };

  // Save Report preferences
  const handleSaveReportPrefs = (values: any) => {
    const timeStr = values.dailyReportTime ? values.dailyReportTime.format('hh:mm A') : config.dailyReportTime;
    const updated: SmtpConfig = {
      ...config,
      dailyReportTime: timeStr,
      dailyReportCron: values.dailyReportCron,
      reportFormat: values.reportFormat,
      autoAlertOnThreshold: values.autoAlertOnThreshold,
    };
    smtpService.saveConfig(updated);
    message.success('Daily culinary report and procurement trigger preferences saved.');
  };

  // Run Test SMTP Handshake
  const handleRunSmtpTest = async () => {
    setIsTestingSmtp(true);
    setSmtpTraceLogs(['Initiating socket handshake...']);
    setTestResultSuccess(null);

    const result = await smtpService.simulateSmtpHandshake(
      testEmail || config.purchasingManagerEmail,
      `[DIAGNOSTIC] L'Étoile Kitchen SMTP Gateway Verification - ${new Date().toLocaleTimeString()}`
    );

    // Stream logs nicely
    setSmtpTraceLogs(result.logs);
    setTestResultSuccess(result.success);
    setIsTestingSmtp(false);

    if (result.success) {
      message.success('SMTP diagnostic handshake succeeded with code 250 OK.');
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Page Title */}
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
              Alerts & System Settings (SMTP Management)
            </Title>
            <Tag color="#c59b27" style={{ border: 'none', color: '#fff', fontWeight: 600 }}>
              Automated SMTP Triggers
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Automated low-stock threshold triggers, cron-scheduled culinary digests, and enterprise SMTP relay configuration.
          </Text>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              setSmtpTraceLogs([]);
              setTestResultSuccess(null);
              setIsTestModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #c59b27 0%, #b48c20 100%)',
              borderColor: '#b48c20',
              fontWeight: 600,
            }}
          >
            Test SMTP Handshake
          </Button>
        </Space>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultActiveKey="logs"
        type="card"
        items={[
          {
            key: 'logs',
            label: (
              <span style={{ fontWeight: 600 }}>
                <BellOutlined /> Automated System Alerts Log ({filteredAlerts.length})
              </span>
            ),
            children: (
              <div>
                {/* Filter Controls */}
                <Card
                  className="etoile-luxury-card"
                  bordered={false}
                  style={{ marginBottom: 18 }}
                  bodyStyle={{ padding: '14px 20px' }}
                >
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} md={14}>
                      <Space wrap size={10}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>
                          Filter By:
                        </span>
                        <Select
                          value={severityFilter}
                          onChange={setSeverityFilter}
                          style={{ width: 140 }}
                        >
                          <Option value="all">All Severities</Option>
                          <Option value="critical">Critical Only</Option>
                          <Option value="warning">Warning Only</Option>
                          <Option value="info">Info / POs</Option>
                        </Select>

                        <Select
                          value={typeFilter}
                          onChange={setTypeFilter}
                          style={{ width: 180 }}
                        >
                          <Option value="all">All Alert Types</Option>
                          <Option value="Low Stock">Low Stock Breaches</Option>
                          <Option value="PO Auto-Trigger">PO Auto-Dispatches</Option>
                          <Option value="Cold Storage Temp">Cold Storage Telemetry</Option>
                          <Option value="System Test">Diagnostic Tests</Option>
                        </Select>
                      </Space>
                    </Col>

                    <Col xs={24} md={10} style={{ textAlign: 'right' }}>
                      <Space>
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            smtpService.clearAlerts();
                            message.info('Alert logs cleared.');
                          }}
                        >
                          Clear Logs
                        </Button>
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            smtpService.resetAlerts();
                            message.success('Default demonstration alert logs restored.');
                          }}
                        >
                          Restore Baseline Logs
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Ant Design List Component for Automated System Alerts */}
                <Card className="etoile-luxury-card" bordered={false} bodyStyle={{ padding: '12px 24px' }}>
                  <List
                    itemLayout="vertical"
                    size="large"
                    pagination={{
                      pageSize: 6,
                      showTotal: (total) => `Total ${total} automated dispatch logs`,
                    }}
                    dataSource={filteredAlerts}
                    renderItem={(alert) => {
                      const isCritical = alert.severity === 'critical';
                      const isWarning = alert.severity === 'warning';
                      const isPO = alert.type === 'PO Auto-Trigger';

                      return (
                        <List.Item
                          key={alert.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            padding: '16px 0',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <Space size={8} align="center">
                              <Tag
                                color={
                                  isCritical
                                    ? 'error'
                                    : isWarning
                                    ? 'warning'
                                    : isPO
                                    ? 'purple'
                                    : 'blue'
                                }
                                style={{
                                  borderRadius: 4,
                                  fontWeight: 600,
                                  fontSize: 11,
                                  padding: '1px 8px',
                                }}
                              >
                                {alert.type.toUpperCase()}
                              </Tag>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: 15,
                                  color: '#0f172a',
                                }}
                              >
                                {alert.title}
                              </span>
                            </Space>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color="cyan" style={{ fontSize: 11 }}>
                                SMTP {alert.smtpStatus}
                              </Tag>
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {alert.timestamp}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              color: '#334155',
                              fontSize: 13,
                              lineHeight: 1.5,
                              maxWidth: 1000,
                            }}
                          >
                            {alert.message}
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              padding: '8px 12px',
                              background: '#f8fafc',
                              borderRadius: 6,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 10,
                              fontSize: 12,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div>
                              <span style={{ color: '#64748b' }}>Dispatched To: </span>
                              <strong style={{ color: '#0f172a' }}>{alert.recipientEmail}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>SMTP Server Handshake: </span>
                              <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 600 }}>
                                {alert.smtpResponseCode}
                              </span>
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'smtp_config',
            label: (
              <span style={{ fontWeight: 600 }}>
                <MailOutlined /> SMTP Gateway Configuration
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={15}>
                  <Card
                    className="etoile-luxury-card"
                    bordered={false}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SettingOutlined style={{ color: '#c59b27' }} />
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                          Outbound SMTP Server Parameters
                        </span>
                      </div>
                    }
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSaveSmtpConfig}
                      style={{ marginTop: 8 }}
                    >
                      <Row gutter={16}>
                        <Col span={16}>
                          <Form.Item
                            name="host"
                            label="SMTP Hostname"
                            rules={[{ required: true, message: 'Please enter SMTP host' }]}
                            tooltip="Internal enterprise SMTP mail server or external relay (e.g. SendGrid / Postmark)."
                          >
                            <Input placeholder="smtp.grandhotel-etoile.internal" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="port"
                            label="Port"
                            rules={[{ required: true, message: 'Port required' }]}
                          >
                            <InputNumber style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="secure"
                            label="Transport Security"
                            valuePropName="checked"
                          >
                            <Switch checkedChildren="TLS / SSL (587/465)" unCheckedChildren="Plaintext" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="username"
                            label="SMTP Auth Username"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="senderEmail"
                            label="Sender From Email"
                            rules={[{ required: true, type: 'email' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="senderName" label="Sender Display Name">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider titlePlacement="start" style={{ fontSize: 13, color: '#64748b' }}>
                        Automated Alert Recipients Matrix
                      </Divider>

                      <Form.Item
                        name="purchasingManagerEmail"
                        label="Purchasing Manager (Emergency Low-Stock POs)"
                        rules={[{ required: true, type: 'email' }]}
                        tooltip="Direct destination for all automated reorder triggers when stock drops below threshold."
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="executiveChefEmail"
                        label="Executive Chef (Critical Out-of-Stock & Cold Chain Anomalies)"
                        rules={[{ required: true, type: 'email' }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="sousChefEmail"
                        label="Sous Chef Brigade (Prep Shift Receiving Alerts)"
                        rules={[{ required: true, type: 'email' }]}
                      >
                        <Input />
                      </Form.Item>

                      <div style={{ textAlign: 'right', marginTop: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{
                            background: '#c59b27',
                            borderColor: '#c59b27',
                            fontWeight: 600,
                          }}
                        >
                          Save SMTP Server Settings
                        </Button>
                      </div>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} lg={9}>
                  <Card
                    className="etoile-luxury-card"
                    bordered={false}
                    title={
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        SMTP Automated Trigger Architecture
                      </span>
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <Alert
                        type="info"
                        showIcon
                        message="Database Trigger Architecture"
                        description="Supabase triggers execute a serverless webhook whenever an item's currentStock <= reorderThreshold. The backend dispatches an RFC 5321 compliant SMTP payload to the designated purchasing officer."
                      />

                      <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                          Active Relay Server
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {config.host}:{config.port} ({config.secure ? 'TLS 1.3' : 'Standard'})
                        </div>
                      </div>

                      <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                          Automated Retry Policy
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          Exponential backoff (3 attempts at 30s, 2m, 10m) with fallback SMS escalation for cold storage anomalies.
                        </div>
                      </div>

                      <Button
                        type="dashed"
                        block
                        icon={<SendOutlined />}
                        onClick={() => setIsTestModalOpen(true)}
                        style={{ marginTop: 8 }}
                      >
                        Launch Interactive Test Handshake
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'report_prefs',
            label: (
              <span style={{ fontWeight: 600 }}>
                <AuditOutlined /> Daily Culinary Inventory Report Preferences
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={15}>
                  <Card
                    className="etoile-luxury-card"
                    bordered={false}
                    title={
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        Daily Culinary Inventory Report Preferences
                      </span>
                    }
                  >
                    <Form
                      form={reportForm}
                      layout="vertical"
                      onFinish={handleSaveReportPrefs}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="dailyReportTime"
                            label="Daily Scheduled Audit Dispatch Time"
                            tooltip="Time of day when the automated cron job compiles the master inventory report and transmits via SMTP."
                          >
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="dailyReportCron"
                            label="Backend Cron Expression"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="0 06 * * *" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="reportFormat"
                            label="Report File Format"
                            rules={[{ required: true }]}
                          >
                            <Select>
                              <Option value="PDF">Formatted PDF Executive Audit</Option>
                              <Option value="Excel">Excel Spreadsheet (.xlsx)</Option>
                              <Option value="JSON">Raw JSON (ERP API Integration)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="autoAlertOnThreshold"
                            label="Instant Real-Time Threshold Triggers"
                            valuePropName="checked"
                          >
                            <Switch checkedChildren="Enabled (Active)" unCheckedChildren="Disabled" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div style={{ textAlign: 'right', marginTop: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{
                            background: '#c59b27',
                            borderColor: '#c59b27',
                            fontWeight: 600,
                          }}
                        >
                          Save Report Preferences
                        </Button>
                      </div>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} lg={9}>
                  <Card
                    className="etoile-luxury-card"
                    bordered={false}
                    title={
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        Report Distribution Checklist
                      </span>
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />
                        <span style={{ fontSize: 13, color: '#334155' }}>
                          06:00 AM: Pre-Service Morning Receiving Check
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />
                        <span style={{ fontSize: 13, color: '#334155' }}>
                          15:00 PM: Afternoon Mise en Place Inventory Delta
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />
                        <span style={{ fontSize: 13, color: '#334155' }}>
                          23:30 PM: Post-Dinner Service Variance & Waste Log
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      {/* ================= MODAL: TEST SMTP HANDSHAKE ================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SendOutlined style={{ color: '#c59b27' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Diagnostic SMTP Handshake Verification</span>
          </div>
        }
        open={isTestModalOpen}
        onCancel={() => setIsTestModalOpen(false)}
        footer={null}
        width={680}
      >
        <div style={{ marginTop: 12 }}>
          <Paragraph style={{ color: '#64748b', fontSize: 13 }}>
            Simulate a live socket connection and RFC 5321 SMTP handshake to verify mail routing, authentication, and recipient verification.
          </Paragraph>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
              Recipient Test Address:
            </label>
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@hospitality.com"
              style={{ width: '100%' }}
            />
          </div>

          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isTestingSmtp}
            onClick={handleRunSmtpTest}
            style={{
              background: '#c59b27',
              borderColor: '#c59b27',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Execute Diagnostic Handshake
          </Button>

          {smtpTraceLogs.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  SMTP Socket Protocol Trace:
                </span>
                {testResultSuccess === true && (
                  <Tag color="success">Handshake 250 OK</Tag>
                )}
              </div>
              <div
                className="terminal-window"
                style={{
                  maxHeight: 260,
                  overflowY: 'auto',
                  padding: 14,
                  lineHeight: 1.6,
                }}
              >
                {smtpTraceLogs.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: line.startsWith('[SERVER]')
                        ? '#38bdf8'
                        : line.startsWith('[CLIENT]')
                        ? '#a7f3d0'
                        : '#cbd5e1',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
