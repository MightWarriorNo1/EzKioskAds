import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Upload, Check, Star } from 'lucide-react';
import SiteHeader from '../components/layouts/SiteHeader';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-primary-300 mb-4">
              Ad Management Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Put your ads on high‑impact digital kiosks
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl">
              Reach local customers with our curated network of digital kiosks. Simple setup, transparent pricing, measurable results.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link to="/signin" className="btn-primary px-6 py-3">Get started</Link>
              <Link to="/kiosks" className="btn-secondary px-6 py-3">Learn more</Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary-600" /><span>Trusted by local brands</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-600" /><span>Launch in minutes</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-600" /><span>Prime locations</span></div>
            </div>
          </div>
          <div className="relative">
            <div className="relative mx-auto w-80 h-96 md:w-96 md:h-[28rem] rounded-2xl bg-gray-900 text-white shadow-elevated overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="text-2xl font-bold mb-2">Want your ad shown here?</div>
                <div className="text-sm text-gray-300">ezkioskads.com</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-[rgb(var(--surface))] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-xl mb-16 max-w-3xl mx-auto">
            Get your ads in front of customers in just a few simple steps.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-300 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Select locations</h3>
              <p>Choose from our network of kiosks in high‑traffic areas.</p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-300 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Set duration</h3>
              <p>Choose your ad slot duration and campaign length.</p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-300 flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Pay & upload</h3>
              <p>Upload your ad content and pay securely online.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-xl mb-16 max-w-3xl mx-auto">
            Pay only for what you need. No hidden fees.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="card p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">High‑traffic kiosk</h3>
              <div className="text-3xl font-extrabold mb-6">$90 per week</div>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Prime locations</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Maximum visibility</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>High foot traffic</span>
                </div>
              </div>
            </div>
            <div className="card p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Medium‑traffic kiosk</h3>
              <div className="text-3xl font-extrabold mb-6">$50 per week</div>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Good locations</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Steady visibility</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Moderate foot traffic</span>
                </div>
              </div>
            </div>
            <div className="card p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Low‑traffic kiosk</h3>
              <div className="text-3xl font-extrabold mb-6">$40 per week</div>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Budget‑friendly</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Targeted visibility</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5 text-success-500" />
                  <span>Lower foot traffic</span>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/signin"
            className="btn-primary px-8 py-3"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to reach more customers?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Sign up today and start advertising on our network of digital kiosks.
          </p>
          <Link to="/signin" className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-3">
            Get started now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 ezkioskads.com. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/#pricing" className="hover:underline">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}