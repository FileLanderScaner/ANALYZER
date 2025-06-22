"use client";

import Link from 'next/link';
import { ShieldCheck, UserCircle, LogIn, LogOut, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/dashboard", label: "Dashboard" }, // New Dashboard Link
  { href: "/resources", label: "Recursos" },
  { href: "/about", label: "Sobre Nosotros" },
  { href: "/contact", label: "Contacto" },
];

export function AppHeader() {
  const { session, user, isLoading, signOut } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false); // Close menu on sign out
  };

  const renderNavLinks = (isMobile = false) => (
    navItems.map(item => (
      <Link
        key={item.label}
        href={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={isMobile 
          ? "block py-2 px-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md" 
          : "text-sm font-medium text-muted-foreground hover:text-primary transition-colors"}
      >
        {item.label}
      </Link>
    ))
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
            Seguridad Integral
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 md:hidden" /> {/* Skeleton for mobile trigger */}
            </div>
          ) : session ? (
            <>
              {/* Conceptual User Profile Button - could link to /dashboard or a dedicated /profile page */}
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-foreground" asChild>
                <Link href="/dashboard"> 
                  <UserCircle className="mr-2 h-4 w-4" />
                  {user?.email?.split('@')[0] || "Mi Cuenta"}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut} 
                className="border-destructive text-destructive hover:bg-destructive/10 hidden md:inline-flex"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Link href="/login" passHref className="hidden md:inline-flex">
              <Button 
                variant="default" 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión / Registrarse
              </Button>
            </Link>
          )}

          {/* Theme Selector */}
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="rounded px-2 py-1 border bg-background text-foreground"
            aria-label="Seleccionar tema"
          >
            {themes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
              <SheetHeader className="p-6 pb-0">
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold text-foreground">Seguridad Integral</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="p-6 space-y-3">
                {renderNavLinks(true)}
                <hr className="my-4 border-border" />
                {session ? (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-foreground" asChild>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}> 
                        <UserCircle className="mr-2 h-4 w-4" />
                        {user?.email?.split('@')[0] || "Mi Cuenta"}
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSignOut} 
                      className="w-full justify-start border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Link href="/login" passHref className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar Sesión / Registrarse
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
