'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Select, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import { CustomerOrder, listCustomerOrders, updateCustomerOrder } from '@/services/supabaseAuth';

const { Title, Text } = Typography;
const statuses: CustomerOrder['status'][] = ['New', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export default function CustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await listCustomerOrders()); }
    catch (error) { message.error(error instanceof Error ? error.message : 'Could not load customer orders.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    listCustomerOrders().then((data) => { if (active) setOrders(data); })
      .catch((error: unknown) => { if (active) message.error(error instanceof Error ? error.message : 'Could not load customer orders.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const columns: ColumnsType<CustomerOrder> = [
    { title: 'ORDER', dataIndex: 'id', key: 'id', render: (id: string) => <Text strong>#{id.slice(0, 8).toUpperCase()}</Text> },
    { title: 'PLACED', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleString() },
    { title: 'PHONE', dataIndex: 'customer_phone', key: 'phone' },
    { title: 'ITEMS', dataIndex: 'items', key: 'items', render: (items: CustomerOrder['items']) => <div>{items.map((item) => <div key={item.id}>{item.quantity} × {item.name}</div>)}</div> },
    { title: 'TOTAL', dataIndex: 'total', key: 'total', render: (total: number) => `₹${Number(total).toLocaleString('en-IN')}` },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: (status: CustomerOrder['status'], order) => <Select value={status} style={{ minWidth: 140 }} options={statuses.map((value) => ({ value, label: value }))} onChange={async (value: CustomerOrder['status']) => { try { await updateCustomerOrder(order.id, value); setOrders((all) => all.map((item) => item.id === order.id ? { ...item, status: value } : item)); } catch (error) { message.error(error instanceof Error ? error.message : 'Could not update status.'); } }} /> },
  ];
  return <div style={{ padding: '30px 32px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><div><Title level={3} style={{ margin: 0 }}><ShoppingOutlined /> Customer orders</Title><Text type="secondary">New orders from the public menu, verified by phone</Text></div><Button icon={<ReloadOutlined />} onClick={() => void load()}>Refresh</Button></div><Card className="etoile-luxury-card"><Table rowKey="id" columns={columns} dataSource={orders} loading={loading} locale={{ emptyText: 'No customer orders yet.' }} pagination={{ pageSize: 10 }} scroll={{ x: 850 }} /></Card></div>;
}
