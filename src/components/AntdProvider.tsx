'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp, theme } from 'antd';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#c59b27', // Refined 5-star Michelin Gold
            colorLink: '#b48c20',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#0284c7',
            borderRadius: 8,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
          components: {
            Card: {
              headerFontSize: 16,
              headerHeight: 48,
            },
            Table: {
              headerBg: '#f8fafc',
              headerColor: '#334155',
              rowHoverBg: '#f1f5f9',
            },
            Button: {
              fontWeight: 500,
            },
            Menu: {
              darkItemBg: '#0b1120',
              darkSubMenuItemBg: '#070b14',
              darkItemSelectedBg: 'rgba(197, 155, 39, 0.2)',
              darkItemSelectedColor: '#ffffff',
            },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
