
"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck, Zap, Info, FileText, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // To check if user is now logged in

export default function ConfirmationSuccessPage() {
  const { session, isLoading, isPremium } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <section className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            ¡Correo Electrónico Confirmado Exitosamente!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Gracias por verificar tu dirección de correo. Tu cuenta ya está activa y lista para usarse.
          </p>
          {!isLoading && !session && (
            <Button asChild size="lg" className="mb-8">
                <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Proceder a Iniciar Sesión
                </Link>
            </Button>
          )}
           {!isLoading && session && (
            <Button asChild size="lg" className="mb-8">
                <Link href="/dashboard">
                    Ir a tu Dashboard
                </Link>
            </Button>
          )}
        </section>

        <Card className="mb-10 shadow-xl border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center">
              <ShieldCheck className="mr-3 h-7 w-7" /> Bienvenido al Centro de Análisis de Seguridad Integral
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-base">
            <p>
              Nuestra plataforma utiliza Inteligencia Artificial avanzada para ayudarte a identificar, analizar y remediar vulnerabilidades de seguridad en una amplia gama de activos digitales. Estamos comprometidos a proporcionarte las herramientas necesarias para fortalecer tu postura de seguridad.
            </p>
            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2 text-lg flex items-center"><Zap className="mr-2 h-5 w-5 text-accent"/>Características Avanzadas</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Análisis multi-objetivo (Web, Servidores, BD, Código, Cloud, etc.).</li>
                  <li>Informes detallados generados por IA.</li>
                  <li>Sugerencias de remediación contextuales.</li>
                  <li>(Premium) Escenarios de ataque ilustrativos.</li>
                  <li>(Premium) Playbooks de remediación paso a paso.</li>
                  <li>(Premium) Descarga completa de resultados en ZIP.</li>
                </ul>
                 {!isLoading && (!session || (session && !isPremium)) && (
                  <Button size="sm" asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/#premium-section">Descubre Premium</Link>
                  </Button>
                )}
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                 <h3 className="font-semibold text-foreground mb-2 text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Primeros Pasos</h3>
                 <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Explora tu <Link href="/dashboard" className="text-primary hover:underline font-medium">Dashboard</Link> para ver tu historial (si ya has hecho análisis).</li>
                    <li>Realiza tu <Link href="/" className="text-primary hover:underline font-medium">primer análisis</Link> de seguridad.</li>
                    <li>Visita nuestra sección de <Link href="/resources" className="text-primary hover:underline font-medium">Recursos</Link> para aprender más.</li>
                    <li>Consulta nuestra <Link href="/#servicios" className="text-primary hover:underline font-medium">lista de servicios</Link> de análisis.</li>
                 </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl border-l-4 border-destructive bg-destructive/5">
            <CardHeader>
                <CardTitle className="text-xl text-destructive flex items-center">
                    <Info className="mr-3 h-6 w-6"/> Mensaje Importante de Seguridad
                </CardTitle>
            </CardHeader>
            <CardContent className="text-destructive/80 dark:text-destructive/90 space-y-3 text-sm">
                <p>
                    Recuerda que la seguridad es un proceso continuo, no un destino. Los análisis proporcionados por esta plataforma son una herramienta valiosa, pero deben complementarse con buenas prácticas de seguridad, revisiones manuales por expertos y un estado de alerta constante.
                </p>
                <p>
                    <strong>Descargo de Responsabilidad:</strong> Los resultados de los análisis de IA son para fines informativos y educativos y no constituyen una garantía de seguridad absoluta. La responsabilidad final de la seguridad de tus sistemas recae en ti.
                </p>
                 <p>
                    Mantén tus sistemas actualizados, utiliza contraseñas fuertes y únicas, habilita la autenticación de múltiples factores siempre que sea posible y educa a tus usuarios sobre las amenazas de ciberseguridad.
                </p>
            </CardContent>
        </Card>

      </main>
      <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border bg-card">
        <p>© {new Date().getFullYear()} Centro de Análisis de Seguridad Integral. Todos los derechos reservados.</p>
        <p className="mb-2">Idea y Visión: Ronald Gonzalez Niche</p>
        <div className="space-x-3">
          <Link href="/terms" className="text-xs text-primary hover:underline"> Términos y Condiciones </Link>
          <span className="text-xs text-muted-foreground">|</span>
          <Link href="/privacy" className="text-xs text-primary hover:underline"> Política de Privacidad </Link>
        </div>
      </footer>
    </div>
  );
}
