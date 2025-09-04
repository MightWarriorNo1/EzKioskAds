import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../shared/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title = 'Welcome to Kiosk Ad Platform', subtitle = 'Access your dashboard to manage your advertising campaigns across our network of digital kiosks.' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen relative isolate overflow-hidden">
        <div className="absolute inset-0 top-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700" />

        <header className="relative z-10 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link to="/" className="inline-flex items-center space-x-2 text-gray-900">
              <Logo 
                size="xl" 
                showText={true} 
                textClassName="text-xl font-semibold" 
                variant="dark"
              />
            </Link>
          </div>
        </header>

        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="max-w-2xl">
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{title}</h1>
              <p className="mt-4 text-base text-gray-200">{subtitle}</p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                <Feature icon="🏙" title="Prime Locations" text="Access high-traffic areas with maximum visibility" />
                <Feature icon="🖥" title="HD Displays" text="Beautiful, high-resolution screens to showcase your content" />
                <Feature icon="📈" title="Real-time Analytics" text="Track campaign performance and audience engagement" />
                <Feature icon="⚙️" title="Easy Management" text="Simple tools to update and control your advertising" />
              </div>
            </div>

            <div className="w-full max-w-md md:ml-auto">
              <div className="bg-white rounded-xl shadow-xl ring-1 ring-gray-200 p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-start space-x-3 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="text-xl">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white">{text}</div>
      </div>
    </div>
  );
}


