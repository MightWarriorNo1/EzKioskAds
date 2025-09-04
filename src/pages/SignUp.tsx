import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCircle2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNotification } from '../contexts/NotificationContext';
import AuthLayout from '../components/layouts/AuthLayout';
import PasswordStrength from '../components/shared/PasswordStrength';
import GoogleIcon from '../components/icons/GoogleIcon';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'host'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [showCapsWarning, setShowCapsWarning] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form fields
    if (!name.trim()) {
      setIsLoading(false);
      addNotification('error', 'Name Required', 'Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setIsLoading(false);
      addNotification('error', 'Email Required', 'Please enter your email address.');
      return;
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      addNotification('error', 'Passwords do not match', 'Please confirm your password and try again.');
      return;
    }

    if (password.length < 6) {
      setIsLoading(false);
      addNotification('error', 'Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      // Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { 
            name: name.trim(), 
            role: role 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        addNotification('success', 'Account Created!', 'Please check your email to confirm your account before signing in.');
        navigate('/signin');
      } else {
        throw new Error('No user data returned from signup');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Database error')) {
        addNotification('error', 'Sign Up Failed', 'There was an issue creating your account. Please try again or contact support.');
      } else if (error.message?.includes('already registered')) {
        addNotification('error', 'Email Already Exists', 'An account with this email already exists. Please sign in instead.');
      } else if (error.message?.includes('password')) {
        addNotification('error', 'Invalid Password', 'Please ensure your password meets the requirements.');
      } else {
        addNotification('error', 'Sign Up Failed', error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Create Account</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="relative">
              <UserCircle2 className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input 
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 bg-white" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ color: '#111827' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input 
                type="email" 
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 bg-white" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ color: '#111827' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setShowCapsWarning((e.getModifierState && e.getModifierState('CapsLock')) || false)}
                required
                aria-describedby="password-help"
                style={{ color: '#111827' }}
              />
            </div>
            {showCapsWarning && <div className="mt-1 text-xs text-amber-600">Caps Lock is on</div>}
            <PasswordStrength password={password} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input 
                type="password" 
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 bg-white ${confirmPassword && confirmPassword !== password ? 'border-red-400' : ''}`} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{ color: '#111827' }}
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <div className="mt-1 text-xs text-red-600">Passwords do not match</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <div className="relative">
              <Shield className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select 
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 bg-white" 
                value={role} 
                onChange={(e) => setRole(e.target.value as 'client' | 'host')}
                style={{ color: '#111827' }}
              >
                <option value="client">Client</option>
                <option value="host">Host</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-2 rounded-lg">
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        <div className="relative mt-4">
          <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
            <div className="flex-1 h-px bg-gray-200" />
            <span>OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button type="button" onClick={async () => {
            await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
          }} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 text-black dark:border-gray-600 dark:hover:bg-gray-600">
            <GoogleIcon className="h-4 w-4" /> Sign up with Google
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Already have an account? <Link to="/signin" className="text-gray-900 font-medium">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}


