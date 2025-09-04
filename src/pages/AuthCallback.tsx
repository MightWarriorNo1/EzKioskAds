import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const handle = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!isMounted) return;
      if (user) {
        const role = (user.user_metadata?.role as 'client' | 'host' | 'admin') || 'client';
        switch (role) {
          case 'host':
            navigate('/host', { replace: true });
            break;
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          default:
            navigate('/client', { replace: true });
        }
      } else {
        navigate('/signin', { replace: true });
      }
    };
    handle();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Signing you in...</div>
    </div>
  );
}


