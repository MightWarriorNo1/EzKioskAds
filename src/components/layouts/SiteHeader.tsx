import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../shared/Logo';

export default function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const handleDashboardClick = () => {
    if (user) {
      // User is authenticated, redirect to their appropriate dashboard
      const role = user.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'host') {
        navigate('/host');
      } else {
        navigate('/client');
      }
    } else {
      // User is not authenticated, redirect to sign in
      navigate('/signin');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/60 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo 
              size="xl" 
              showText={true} 
              textClassName="text-3xl tracking-tight" 
              variant="dark"
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Home</Link>
          <Link to="/kiosks" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Kiosks</Link>
          <Link to="/#pricing" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Pricing</Link>
          <Link to="/contact" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Contact</Link>
          <Link to="/hosting" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Host</Link>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle theme" 
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:hidden" />
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 hidden dark:block" />
          </button>
          <button onClick={handleDashboardClick} className="btn-primary">Dashboard</button>
        </div>
      </nav>
    </header>
  );
}


