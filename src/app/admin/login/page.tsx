
'use client';

import { useState } from 'react';
import { Alert, Button, Form, Input, notification } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  isSupabaseConfigured,
  signInAdmin,
} from '@/services/supabaseAuth';

export default function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function submit(values: {
    email: string;
    password: string;
  }) {
    setBusy(true);

    try {
      await signInAdmin(values.email, values.password);
      router.replace('/admin');
    } catch (error) {
      notification.error({
        message: 'Sign in failed',
        description:
          error instanceof Error
            ? error.message
            : 'Check your details and try again.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">É</span>
          <span>
            <strong>ÉTOILE</strong>
            <small>STAFF PORTAL</small>
          </span>
        </Link>

        <span className="eyebrow">WELCOME BACK</span>

        <h1>Kitchen, meet dashboard.</h1>

        <p>
          Sign in with your staff account to manage orders
          and kitchen operations.
        </p>

        {!isSupabaseConfigured && (
          <Alert
            showIcon
            type="warning"
            message="Supabase is not configured"
            description="Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local file."
          />
        )}

        <Form
          layout="vertical"
          size="large"
          onFinish={submit}
          requiredMark={false}
        >
          <Form.Item
            label="Staff email"
            name="email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Enter a valid email address.',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="you@restaurant.com"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Enter your password.' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={busy}
            disabled={!isSupabaseConfigured}
            className="admin-login-submit"
          >
            Sign in to the portal
          </Button>
        </Form>

        <div className="admin-login-note">
          Admin access is assigned by a trusted Supabase
          project administrator.
        </div>

        <Link href="/" className="back-menu">
          ← Back to the menu
        </Link>
      </section>
    </main>
  );
}

