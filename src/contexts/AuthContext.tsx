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
    // Add timeout to prevent hanging
    const profilePromise = supabase
      .from('profiles')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile lookup timeout')), 5000)
    );
    
    const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
    
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
    let initializationComplete = false;

    const initialize = async () => {
      try {
        console.log('Auth: Initializing authentication...');
        
        // Add overall timeout to prevent infinite loading
        const initPromise = (async () => {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth: Error getting session:', error);
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
            return;
          }
          
          const session = data.session as Session | null;
          console.log('Auth: Session found:', !!session);
          
          if (isMounted && session?.user) {
            try {
              console.log('Auth: Mapping user data...');
              const u = await mapSupabaseUserToUser(session.user);
              if (isMounted) {
                setUser(u);
                console.log('Auth: User set successfully:', u.email);
              }
            } catch (profileError) {
              console.error('Auth: Profile mapping error during initialization:', profileError);
              // Preserve existing role if available to avoid accidental downgrades
              const preservedRole: UserRole | undefined = user?.role;
              const fallbackRole: UserRole = preservedRole || (session.user.user_metadata?.role as UserRole) || 'client';
              const safeUser: User = {
                id: session.user.id,
                email: session.user.email ?? '',
                name: session.user.user_metadata?.name,
                role: fallbackRole,
                avatar: session.user.user_metadata?.avatar,
              };
              if (isMounted) {
                setUser(safeUser);
                console.log('Auth: Fallback user set with preserved role:', safeUser.email, safeUser.role);
              }
            }
          } else if (isMounted) {
            console.log('Auth: No session found, setting user to null');
            setUser(null);
          }
        })();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        
      } catch (error) {
        console.error('Auth: Initialization error:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          initializationComplete = true;
          setIsLoading(false);
          console.log('Auth: Initialization complete, loading set to false');
        }
      }
    };

    initialize();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth: Auth state change:', event, !!session);
      
      if (!isMounted) return;
      
      // Only process auth state changes after initial load
      if (!initializationComplete) {
        console.log('Auth: Skipping auth state change during initialization');
        return;
      }
      
      if (session?.user) {
        try {
          console.log('Auth: Processing auth state change for user:', session.user.email);
          const u = await mapSupabaseUserToUser(session.user);
          if (isMounted) setUser(u);
        } catch (profileError) {
          console.error('Auth: Profile mapping error during auth state change:', profileError);
          // Preserve existing role if available to avoid accidental downgrades
          const preservedRole: UserRole | undefined = user?.role;
          const fallbackRole: UserRole = preservedRole || (session.user.user_metadata?.role as UserRole) || 'client';
          const safeUser: User = {
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name,
            role: fallbackRole,
            avatar: session.user.user_metadata?.avatar,
          };
          if (isMounted) setUser(safeUser);
        }
      } else {
        console.log('Auth: No session in auth state change, setting user to null');
        if (isMounted) setUser(null);
      }
      
      // Set loading to false after auth state change
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }
    // The onAuthStateChange listener will handle setting the user state
    // No need to manually set user here as it will be handled by the listener
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