import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';
import { supabase } from '../lib/supabaseClient';
import { useNotification } from '../contexts/NotificationContext';
import GoogleIcon from '../components/icons/GoogleIcon';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [showCapsWarning, setShowCapsWarning] = useState(false);
  
  const { signIn } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await signIn(email, password);

      // Determine redirect based on Supabase user metadata role
      const { data } = await supabase.auth.getUser();
      const role = (data.user?.user_metadata?.role as string) || 'client';
      if (role === 'admin') navigate('/admin');
      else if (role === 'host') navigate('/host');
      else navigate('/client');
      
      addNotification('success', 'Welcome!', 'Successfully signed in to your account.');
    } catch (error) {
      addNotification('error', 'Sign In Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed demo users and role chips from sign-in

  return (
    <AuthLayout>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Account Login</h3>
      <p className="text-xs text-gray-500 mb-4">Manage your advertising campaigns and monitor performance</p>
      <form onSubmit={handleSubmit} className={`space-y-6 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all`}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  required
                  style={{ color: '#111827' }}
                />
                {errors.email && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  required
                  onKeyUp={(e) => setShowCapsWarning((e.getModifierState && e.getModifierState('CapsLock')) || false)}
                  style={{ color: '#111827' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </div>
                )}
                {showCapsWarning && (
                  <div className="mt-1 text-xs text-amber-600">Caps Lock is on</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          <div className="relative">
            <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
              <div className="flex-1 h-px bg-gray-200" />
              <span>OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
              }}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-black dark:border-gray-600 dark:hover:bg-gray-600 hover:bg-gray-50"
            >
              <GoogleIcon className="h-4 w-4" /> Sign in with Google
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Don’t have an account yet? <Link to="/signup" className="text-gray-900 font-medium">Create Account</Link>
          </div>
      </form>
    </AuthLayout>
  );
}