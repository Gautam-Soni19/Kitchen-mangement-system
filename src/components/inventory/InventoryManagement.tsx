'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Card,
  Popconfirm,
  Progress,
  Typography,
  Tooltip,
  Row,
  Col,
  Statistic,
  message,
  notification,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  MailOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { supabaseService } from '@/services/supabaseMock';
import { smtpService } from '@/services/smtpService';
import { InventoryItem, ItemCategory, UnitOfMeasurement, StockStatus } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [reorderForm] = Form.useForm();

  useEffect(() => {
    loadData();
    const unsub = supabaseService.subscribe(loadData);
    return () => unsub();
  }, []);

  const loadData = () => {
    setLoading(true);
    setItems(supabaseService.getItems());
    setLoading(false);
  };

  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.origin && item.origin.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handler: Add New Item
  const handleAddItem = (values: any) => {
    const vendors = supabaseService.getVendors();
    const zones = supabaseService.getStorageZones();
    const vendor = vendors.find((v) => v.id === values.supplierId) || vendors[0];
    const zone = zones.find((z) => z.id === values.storageZoneId) || zones[0];

    const newItem = supabaseService.addItem({
      sku: values.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: values.name,
      category: values.category,
      currentStock: Number(values.currentStock),
      unit: values.unit,
      reorderThreshold: Number(values.reorderThreshold),
      optimalLevel: Number(values.optimalLevel || values.reorderThreshold * 2.5),
      costPerUnit: Number(values.costPerUnit || 25),
      storageZoneId: zone.id,
      storageZoneName: zone.name,
      supplierId: vendor.id,
      supplierName: vendor.name,
      origin: values.origin || 'Certified Supplier Origin',
      grade: values.grade || 'Standard Chef Grade',
    });

    setIsAddModalOpen(false);
    addForm.resetFields();
    message.success(`Inventory Item "${newItem.name}" added to Supabase master catalogue.`);
  };

  // Handler: Edit Item
  const handleOpenEdit = (item: InventoryItem) => {
    setActiveItem(item);
    editForm.setFieldsValue({
      name: item.name,
      sku: item.sku,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      reorderThreshold: item.reorderThreshold,
      optimalLevel: item.optimalLevel,
      costPerUnit: item.costPerUnit,
      storageZoneId: item.storageZoneId,
      supplierId: item.supplierId,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (values: any) => {
    if (!activeItem) return;
    const zones = supabaseService.getStorageZones();
    const vendors = supabaseService.getVendors();
    const zone = zones.find((z) => z.id === values.storageZoneId);
    const vendor = vendors.find((v) => v.id === values.supplierId);

    supabaseService.updateItem(activeItem.id, {
      name: values.name,
      sku: values.sku,
      category: values.category,
      currentStock: Number(values.currentStock),
      unit: values.unit,
      reorderThreshold: Number(values.reorderThreshold),
      optimalLevel: Number(values.optimalLevel),
      costPerUnit: Number(values.costPerUnit),
      storageZoneId: zone ? zone.id : activeItem.storageZoneId,
      storageZoneName: zone ? zone.name : activeItem.storageZoneName,
      supplierId: vendor ? vendor.id : activeItem.supplierId,
      supplierName: vendor ? vendor.name : activeItem.supplierName,
    });

    setIsEditModalOpen(false);
    setActiveItem(null);
    message.success(`Updated "${values.name}" in master database.`);
  };

  // Handler: Delete Item
  const handleDeleteItem = (id: string, name: string) => {
    supabaseService.deleteItem(id);
    message.info(`Item "${name}" removed from Supabase inventory.`);
  };

  // Handler: Quick Reorder
  const handleOpenReorder = (item: InventoryItem) => {
    setActiveItem(item);
    const suggestedQty = Math.max(1, Math.ceil(item.optimalLevel - item.currentStock));
    reorderForm.setFieldsValue({
      quantity: suggestedQty,
      notes: `Urgent culinary replenishment for active dinner service brigade.`,
    });
    setIsReorderModalOpen(true);
  };

  const handleConfirmReorder = (values: any) => {
    if (!activeItem) return;
    const po = supabaseService.quickReorder(
      activeItem.id,
      Number(values.quantity),
      values.notes
    );

    setIsReorderModalOpen(false);
    if (po) {
      notification.success({
        message: `Purchase Order ${po.poNumber} Transmitted`,
        description: `Dispatched order for ${values.quantity} ${activeItem.unit} of ${activeItem.name} to ${po.vendorName}. Automated SMTP confirmation dispatched.`,
        placement: 'topRight',
        icon: <MailOutlined style={{ color: '#10b981' }} />,
      });
    }
    setActiveItem(null);
  };

  // Handler: Batch Reorder All Low Stock
  const handleBatchReorder = () => {
    const orders = supabaseService.batchReorderLowStock();
    if (orders.length === 0) {
      message.info('All inventory items are currently at or above safe stock levels.');
      return;
    }
    notification.success({
      message: `${orders.length} Emergency Purchase Orders Dispatched`,
      description: `Automated replenishment POs generated and transmitted via SMTP relay to suppliers.`,
      placement: 'topRight',
    });
  };

  // Handler: CSV Export
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Item Name',
      'Category',
      'Current Stock',
      'Unit',
      'Reorder Threshold',
      'Optimal Level',
      'Cost per Unit',
      'Storage Location',
      'Supplier',
      'Status',
    ];

    const rows = filteredItems.map((it) => [
      it.sku,
      `"${it.name}"`,
      it.category,
      it.currentStock,
      it.unit,
      it.reorderThreshold,
      it.optimalLevel,
      it.costPerUnit,
      `"${it.storageZoneName}"`,
      `"${it.supplierName}"`,
      it.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `etoile_kitchen_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Master Inventory CSV exported successfully.');
  };

  // Tag color mapping
  const getCategoryColor = (cat: ItemCategory) => {
    switch (cat) {
      case 'Vegetables':
        return 'green';
      case 'Meat':
        return 'red';
      case 'Dairy':
        return 'blue';
      case 'Spices':
        return 'gold';
      case 'Seafood':
        return 'cyan';
      case 'Bakery & Dry Goods':
        return 'orange';
      case 'Luxury & Deli':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusTag = (status: StockStatus) => {
    switch (status) {
      case 'Safe':
        return (
          <Tag color="success" style={{ fontWeight: 600 }}>
            Safe
          </Tag>
        );
      case 'Low Stock':
        return (
          <Tag color="warning" style={{ fontWeight: 600 }}>
            Low Stock
          </Tag>
        );
      case 'Out of Stock':
        return (
          <Tag color="error" style={{ fontWeight: 600 }}>
            Out of Stock
          </Tag>
        );
    }
  };

  // Table Columns
  const columns: ColumnsType<InventoryItem> = [
    {
      title: 'Item Name & SKU',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: InventoryItem) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{name}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
              {record.sku}
            </span>
            {record.origin && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>• {record.origin}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Vegetables', value: 'Vegetables' },
        { text: 'Meat', value: 'Meat' },
        { text: 'Dairy', value: 'Dairy' },
        { text: 'Spices', value: 'Spices' },
        { text: 'Seafood', value: 'Seafood' },
        { text: 'Bakery & Dry Goods', value: 'Bakery & Dry Goods' },
        { text: 'Luxury & Deli', value: 'Luxury & Deli' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (cat: ItemCategory) => (
        <Tag color={getCategoryColor(cat)} style={{ borderRadius: 4, fontWeight: 500 }}>
          {cat}
        </Tag>
      ),
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (stock: number, record: InventoryItem) => {
        const percent = Math.min(100, Math.round((stock / (record.optimalLevel || 1)) * 100));
        const isLow = stock <= record.reorderThreshold;
        const isOut = stock <= 0;

        return (
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: isOut ? '#ef4444' : isLow ? '#d97706' : '#0f172a',
                }}
              >
                {stock} <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>{record.unit}</span>
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                Opt: {record.optimalLevel} {record.unit}
              </span>
            </div>
            <Progress
              percent={percent}
              size="small"
              status={isOut ? 'exception' : isLow ? 'active' : 'normal'}
              strokeColor={isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981'}
              showInfo={false}
              style={{ margin: '4px 0 0 0' }}
            />
          </div>
        );
      },
    },
    {
      title: 'Unit of Measurement',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit: string) => <Tag style={{ textTransform: 'uppercase', fontSize: 11 }}>{unit}</Tag>,
    },
    {
      title: 'Reorder Threshold',
      dataIndex: 'reorderThreshold',
      key: 'reorderThreshold',
      sorter: (a, b) => a.reorderThreshold - b.reorderThreshold,
      render: (threshold: number, record: InventoryItem) => (
        <div>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {threshold} {record.unit}
          </span>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>SMTP Trigger Point</div>
        </div>
      ),
    },
    {
      title: 'Storage Zone',
      dataIndex: 'storageZoneName',
      key: 'storageZoneName',
      render: (zone: string) => (
        <span style={{ fontSize: 12, color: '#475569' }}>
          {zone}
        </span>
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'costPerUnit',
      key: 'costPerUnit',
      sorter: (a, b) => a.costPerUnit - b.costPerUnit,
      render: (cost: number) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          ${cost.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Safe', value: 'Safe' },
        { text: 'Low Stock', value: 'Low Stock' },
        { text: 'Out of Stock', value: 'Out of Stock' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: StockStatus) => getStatusTag(status),
    },
    {
      title: 'Row Actions',
      key: 'actions',
      render: (_: any, record: InventoryItem) => (
        <Space size={6}>
          <Tooltip title="Instant Purchase Order dispatch via automated SMTP">
            <Button
              type="primary"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleOpenReorder(record)}
              style={{
                background: record.status !== 'Safe' ? '#c59b27' : '#e2e8f0',
                color: record.status !== 'Safe' ? '#ffffff' : '#334155',
                borderColor: record.status !== 'Safe' ? '#c59b27' : '#cbd5e1',
                fontSize: 12,
              }}
            >
              Reorder
            </Button>
          </Tooltip>

          <Tooltip title="Edit item attributes">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Inventory Item"
            description={`Are you sure you want to remove "${record.name}" from the master catalogue?`}
            onConfirm={() => handleDeleteItem(record.id, record.name)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete SKU">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Page Title & Breadcrumb Header */}
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
              Master Inventory & Supplies Catalogue
            </Title>
            <Tag color="#c59b27" style={{ border: 'none', color: '#fff', fontWeight: 600 }}>
              Supabase Relational
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Direct relational mapping of high-grade culinary ingredients, storage vaults, vendors, and automated reorder triggers.
          </Text>
        </div>

        <Space size={10}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #c59b27 0%, #b48c20 100%)',
              borderColor: '#b48c20',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(197, 155, 39, 0.3)',
            }}
          >
            Add New Item
          </Button>

          <Button
            icon={<ShoppingCartOutlined />}
            onClick={handleBatchReorder}
            style={{ fontWeight: 500 }}
          >
            Batch Reorder Low Stock
          </Button>

          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </Space>
      </div>

      {/* Filter and Search Bar Card */}
      <Card
        className="etoile-luxury-card"
        bordered={false}
        style={{ marginBottom: 18 }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search by ingredient name, SKU, or origin..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Option value="all">All Categories</Option>
              <Option value="Vegetables">Vegetables</Option>
              <Option value="Meat">Meat</Option>
              <Option value="Dairy">Dairy</Option>
              <Option value="Spices">Spices</Option>
              <Option value="Seafood">Seafood</Option>
              <Option value="Bakery & Dry Goods">Bakery & Dry Goods</Option>
              <Option value="Luxury & Deli">Luxury & Deli</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">All Stock Statuses</Option>
              <Option value="Safe">Safe</Option>
              <Option value="Low Stock">Low Stock</Option>
              <Option value="Out of Stock">Out of Stock</Option>
            </Select>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing <strong>{filteredItems.length}</strong> of {items.length} items
            </span>
          </Col>
        </Row>
      </Card>

      {/* Main Inventory Ant Design Table */}
      <Card className="etoile-luxury-card" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '15', '30'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} culinary items`,
          }}
          rowClassName={(record) =>
            record.status === 'Out of Stock'
              ? 'table-row-out-of-stock'
              : record.status === 'Low Stock'
              ? 'table-row-low-stock'
              : ''
          }
        />
      </Card>

      {/* ================= MODAL: ADD NEW ITEM ================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusOutlined style={{ color: '#c59b27' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Add New Master Inventory Item</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={680}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddItem}
          initialValues={{
            category: 'Vegetables',
            unit: 'kg',
            currentStock: 10,
            reorderThreshold: 5,
            optimalLevel: 25,
            costPerUnit: 25.0,
            storageZoneId: 'zone-1',
            supplierId: 'ven-1',
          }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Ingredient / Item Name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="e.g. Brittany Blue Lobster (Homarus)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sku" label="SKU / Item Code">
                <Input placeholder="e.g. SEA-LOB-04" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Vegetables">Vegetables</Option>
                  <Option value="Meat">Meat</Option>
                  <Option value="Dairy">Dairy</Option>
                  <Option value="Spices">Spices</Option>
                  <Option value="Seafood">Seafood</Option>
                  <Option value="Bakery & Dry Goods">Bakery & Dry Goods</Option>
                  <Option value="Luxury & Deli">Luxury & Deli</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Unit of Measurement"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="kg">kg (Kilograms)</Option>
                  <Option value="liters">liters (Liters)</Option>
                  <Option value="grams">grams (Grams)</Option>
                  <Option value="bottles">bottles</Option>
                  <Option value="tins">tins</Option>
                  <Option value="bunches">bunches</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentStock"
                label="Initial Stock"
                rules={[{ required: true, message: 'Specify current stock' }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reorderThreshold"
                label="Reorder Threshold"
                tooltip="Stock falling at or below this limit automatically triggers an SMTP low-stock alert."
                rules={[{ required: true, message: 'Specify threshold' }]}
              >
                <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="optimalLevel" label="Optimal Stock Level">
                <InputNumber min={1} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="costPerUnit" label="Unit Cost ($)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} prefix="$" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="storageZoneId" label="Cold Storage Vault / Location">
                <Select>
                  {supabaseService.getStorageZones().map((z) => (
                    <Option key={z.id} value={z.id}>
                      {z.name} ({z.targetTemp}°C)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplierId" label="Certified Purveyor / Vendor">
                <Select>
                  {supabaseService.getVendors().map((v) => (
                    <Option key={v.id} value={v.id}>
                      {v.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="origin" label="Origin / Terroir / AOP">
                <Input placeholder="e.g. Normandy AOP, Brittany, Japan" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: '#c59b27',
                  borderColor: '#c59b27',
                  fontWeight: 600,
                }}
              >
                Save to Master Inventory
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL: EDIT ITEM ================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#c59b27' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Edit Inventory Item</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setActiveItem(null);
        }}
        footer={null}
        width={680}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateItem}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sku" label="SKU">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentStock"
                label="Current Stock"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reorderThreshold"
                label="Reorder Threshold"
                rules={[{ required: true }]}
              >
                <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="optimalLevel" label="Optimal Stock Level">
                <InputNumber min={1} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="costPerUnit" label="Unit Cost ($)">
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} prefix="$" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="storageZoneId" label="Storage Zone">
                <Select>
                  {supabaseService.getStorageZones().map((z) => (
                    <Option key={z.id} value={z.id}>
                      {z.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: '#c59b27',
                  borderColor: '#c59b27',
                  fontWeight: 600,
                }}
              >
                Update Item
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ================= MODAL: QUICK REORDER (SMTP DISPATCH) ================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCartOutlined style={{ color: '#c59b27' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Quick Purchase Order & Automated SMTP Dispatch
            </span>
          </div>
        }
        open={isReorderModalOpen}
        onCancel={() => {
          setIsReorderModalOpen(false);
          setActiveItem(null);
        }}
        footer={null}
        width={580}
      >
        {activeItem && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                {activeItem.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Current Stock: <strong>{activeItem.currentStock} {activeItem.unit}</strong> | Threshold: {activeItem.reorderThreshold} {activeItem.unit} | Optimal: {activeItem.optimalLevel} {activeItem.unit}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Supplier: <strong style={{ color: '#0f172a' }}>{activeItem.supplierName}</strong>
              </div>
            </div>

            <Form form={reorderForm} layout="vertical" onFinish={handleConfirmReorder}>
              <Form.Item
                name="quantity"
                label={`Replenishment Quantity (${activeItem.unit})`}
                rules={[{ required: true, message: 'Please specify quantity' }]}
              >
                <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="notes" label="Delivery Instructions / Chef Notes">
                <Input.TextArea rows={3} placeholder="Priority delivery notes for vendor..." />
              </Form.Item>

              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <MailOutlined style={{ fontSize: 16, color: '#d97706' }} />
                <span>
                  Confirming this order immediately generates a Purchase Order document and dispatches it via <strong>SMTP</strong> to the certified vendor with tracking confirmation.
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setIsReorderModalOpen(false)}>Cancel</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<MailOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #c59b27 0%, #b48c20 100%)',
                      borderColor: '#b48c20',
                      fontWeight: 600,
                    }}
                  >
                    Confirm & Send via SMTP
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
