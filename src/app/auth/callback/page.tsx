
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client'; // Use the potentially null client

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        console.error("AuthCallbackPage: Supabase client not initialized. Cannot process callback. Redirecting to home.");
        // Potentially show a message to the user or redirect to an error page
        router.replace('/');
        return;
      }
      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is logged in, redirect to dashboard or intended page
        // You might want to fetch user profile here if needed immediately after login
        // or rely on AuthContext to handle it.
        router.replace('/dashboard'); 
      } else {
        // No session, redirect to login or home
        console.warn("AuthCallbackPage: No session found after OAuth callback. Redirecting to home.");
        router.replace('/');
      }
    };

    checkSession();
  }, [router]); // supabase is considered stable as it's module-level

  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <svg className="animate-spin h-8 w-8 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg">Procesando inicio de sesión...</p>
      {!supabase && (
        <p className="text-sm text-destructive mt-2">Servicio de autenticación no disponible. Serás redirigido.</p>
      )}
    </div>
  );
}
