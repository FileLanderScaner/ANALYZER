"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseClient = createBrowserClient(supabaseUrl, supabaseKey);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { session, isLoading: authIsLoading, refreshUserProfile } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      setRedirectUrl(redirect || "/");
    }
  }, []);

  useEffect(() => {
    if (!authIsLoading && session) {
      router.replace(redirectUrl);
    }
  }, [session, authIsLoading, router, redirectUrl]);

  useEffect(() => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId || facebookAppId === "TU_FACEBOOK_APP_ID_AQUI") {
      console.warn("LoginPage: Facebook App ID no está configurado.");
      setIsFbSdkReady(false);
      return;
    }

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
        setIsFbSdkReady(true);
      }
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/es_LA/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    } else if (window.FB && typeof window.FB.init === "function" && !isFbSdkReady) {
      window.fbAsyncInit();
    }
  }, [isFbSdkReady]);

  const getPremiumStatusForToast = async (userId: string): Promise<boolean> => {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("id", userId)
      .single();

    if (profile && !profileError) {
      const premiumStatuses = ["active_premium", "premium_monthly", "premium_yearly", "active"];
      return premiumStatuses.some(status =>
        profile.subscription_status?.toLowerCase().includes(status)
      );
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: error.message,
        duration: 12000,
      });
    } else if (signInData.user) {
      await refreshUserProfile();
      const currentIsPremium = await getPremiumStatusForToast(signInData.user.id);

      toast({
        title: "Inicio de Sesión Exitoso",
        description: `Bienvenido de nuevo. (Cuenta: ${currentIsPremium ? "Premium ✨" : "Gratuita"})`,
        variant: "default",
        duration: 4000,
      });

      router.push(redirectUrl);
    } else {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: "Respuesta inesperada del servidor.",
      });
    }
    setIsLoading(false);
  };

  const handleFacebookLogin = async () => {
    setIsLoadingFacebook(true);

    if (!isFbSdkReady || !window.FB || typeof window.FB.login !== "function") {
      toast({
        variant: "destructive",
        title: "Error de Facebook Login",
        description: "El SDK de Facebook no está listo.",
      });
      setIsLoadingFacebook(false);
      return;
    }

    window.FB.login(async (response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;

        window.FB.api("/me", { fields: "id,name,email" }, async (profile: any) => {
          if (profile && !profile.error) {
            try {
              const res = await fetch("/api/auth/facebook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Error del servidor al autenticar con Facebook.");

              await refreshUserProfile();
              const { data: { user: supaUser } } = await supabase.auth.getUser();
              let currentIsPremium = false;
              if (supaUser) {
                currentIsPremium = await getPremiumStatusForToast(supaUser.id);
              }

              toast({
                title: "Autenticación Exitosa",
                description: `Bienvenido con Facebook. (Cuenta: ${currentIsPremium ? "Premium ✨" : "Gratuita"})`,
                duration: 5000,
              });

              router.push(redirectUrl);
            } catch (err: any) {
              toast({
                variant: "destructive",
                title: "Error de Autenticación",
                description: err.message,
              });
            }
          } else {
            toast({
              variant: "destructive",
              title: "Error al obtener datos de Facebook",
              description: profile.error?.message || "Error desconocido.",
            });
          }
        });
      } else {
        toast({
          variant: "destructive",
          title: "Inicio de sesión cancelado",
          description: "No se completó el inicio con Facebook.",
        });
      }
      setIsLoadingFacebook(false);
    }, { scope: "email,public_profile" });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  if (authIsLoading && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            Iniciar Sesión
          </CardTitle>
          <CardDescription>
            Accede a tu cuenta para gestionar tus análisis de seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isLoadingFacebook}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isLoadingFacebook}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingFacebook}>
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              Iniciar Sesión
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={isLoading || isLoadingFacebook}>
              {isLoadingFacebook ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              Iniciar con Facebook
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle size={24} />
              {loading ? "Cargando..." : "Iniciar sesión con Google"}
            </Button>
            {error && <div className="text-red-500 mt-4">{error}</div>}
            <p className="text-center text-sm text-muted-foreground mt-2">
              ¿No tienes cuenta?{" "}
              <Link href="/signup" className="underline">
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
