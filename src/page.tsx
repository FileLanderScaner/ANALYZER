'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  useEffect(() => {
    if (!supabase) {
      console.warn(
        "Home page (/app/page.tsx): Supabase client not initialized. Facebook login will not function."
      );
    }
  }, []);

  const handleLogin = async () => {
    if (!supabase) {
      alert("El servicio de autenticación no está disponible en este momento. Por favor, intente más tarde.");
      console.error("Facebook login attempt: Supabase client is not initialized.");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error during Facebook signInWithOAuth:", error);
        alert(`Error al intentar iniciar sesión con Facebook: ${error.message}`);
      }
    } catch (e) {
      console.error("Exception during Facebook signInWithOAuth:", e);
      alert("Ocurrió un error inesperado al intentar iniciar sesión con Facebook.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground px-4">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">
        Esta es la página principal de la app. Aquí puedes probar el inicio de sesión con Facebook mediante Supabase.
      </p>

      <Button
        onClick={handleLogin}
        disabled={!supabase}
        className="bg-blue-600 text-white hover:bg-blue-700 w-fit"
      >
        {supabase ? "Iniciar sesión con Facebook" : "Facebook Login (No Disponible)"}
      </Button>

      {!supabase && (
        <p className="text-xs text-destructive mt-2 text-center">
          El inicio de sesión con Facebook está deshabilitado porque el cliente Supabase no pudo inicializarse.
        </p>
      )}
    </main>
  );
}
