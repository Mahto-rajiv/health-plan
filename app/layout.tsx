import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Health Plan — Personal Fitness System',
  description: 'Evidence-based personal fitness, training, nutrition, and progress-tracking dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <Sidebar />
        {/* Main content — offset for sidebar on desktop, header on mobile */}
        <main className="lg:ml-60 min-h-screen pt-[56px] lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
