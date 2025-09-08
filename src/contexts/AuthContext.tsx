import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'client' | 'host' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
  const metadata = (supabaseUser.user_metadata ?? {}) as Record<string, unknown> & { role?: UserRole; name?: string; avatar?: string };
  let role: UserRole = (metadata.role as UserRole) ?? 'client';

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();
    
    if (!error && profile && (profile as any).role) {
      role = (profile as any).role as UserRole;
    } else if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('Profile not found, creating new profile for user:', supabaseUser.id);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: metadata.name || 'Unknown',
          role: role,
        });
      
      if (insertError) {
        console.error('Failed to create profile:', insertError);
      }
    }
  } catch (e) {
    console.error('Profile lookup error:', e);
    // Fallback to metadata role if profile lookup fails
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: metadata.name,
    role,
    avatar: metadata.avatar,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session as Session | null;
      if (isMounted && session?.user) {
        const u = await mapSupabaseUserToUser(session.user);
        if (isMounted) setUser(u);
      }
      if (isMounted) setIsLoading(false);
    };

    initialize();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const u = await mapSupabaseUserToUser(session.user);
        if (isMounted) setUser(u);
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }
    if (data.user) {
      try {
        const u = await mapSupabaseUserToUser(data.user);
        setUser(u);
      } catch (profileError) {
        console.error('Profile mapping error:', profileError);
        // Still set user even if profile mapping fails
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          role: 'client',
        });
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}