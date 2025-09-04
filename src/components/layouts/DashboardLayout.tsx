import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  BarChart3, 
  FileText, 
  User, 
  HelpCircle, 
  LogOut,
  Target,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../shared/Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBreadcrumb = true 
}: DashboardLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/client/campaigns', icon: Target },
    { name: 'Analytics', href: '/client/analytics', icon: BarChart3 },
    { name: 'New Campaign', href: '/client/new-campaign', icon: Plus },
    { name: 'Billing', href: '/client/billing', icon: FileText },
    { name: 'Profile', href: '/client/profile', icon: User },
    { name: 'Help Center', href: '/client/help', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/client') {
      // Dashboard should only be active when exactly on /client
      return location.pathname === '/client';
    }
    // Other items should be active when pathname starts with their href
    return location.pathname.startsWith(href);
  };

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--surface))] dark:bg-gray-900 flex">
      {/* Left Sidebar - Fixed */}
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      
      {/* Sidebar - Always fixed on left */}
      <div className={`fixed left-0 top-0 h-full w-72 bg-white/90 dark:bg-gray-900/80 backdrop-blur border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Logo 
            size="xl" 
            showText={true} 
            textClassName="text-3xl font-bold" 
            variant="dark"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-200/5 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content - With left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Header */}
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-3 flex items-center justify-between">
          <button className="lg:hidden btn-secondary" onClick={() => setMobileOpen(v => !v)}>
            Menu
          </button>
          {showBreadcrumb && (
            <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">Dashboard</div>
          )}
          <div className="flex-1" />
          <button onClick={toggleTheme} aria-label="Toggle theme" className="btn-secondary">
            <span className="hidden md:inline">Theme</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 ml-2">
              <path d="M12 3v1" />
              <path d="M12 20v1" />
              <path d="M3 12h1" />
              <path d="M20 12h1" />
              <path d="M18.364 5.636l-.707.707" />
              <path d="M6.343 17.657l-.707.707" />
              <path d="M5.636 5.636l.707.707" />
              <path d="M17.657 17.657l.707.707" />
              <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 px-4 md:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            {subtitle && <p className="text-lg">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
