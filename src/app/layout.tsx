import type { Metadata } from 'next';
import './globals.css';
import AntdProvider from '@/components/AntdProvider';

export const metadata: Metadata = {
  title: "L'Étoile | 5-Star Kitchen Inventory & Cold Chain Management",
  description:
    'Enterprise kitchen logistics, InfluxDB real-time ingredient consumption telemetry, Supabase inventory master data, and automated SMTP procurement alerts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
