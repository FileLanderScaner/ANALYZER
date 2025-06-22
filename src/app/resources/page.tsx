
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, FileText, ShieldAlert, Zap, Rss } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const resources = [
  {
    type: "Artículo de Blog",
    title: "Las 5 Amenazas de Ciberseguridad Más Comunes para Empresas en 2024",
    description: "Descubra cuáles son los vectores de ataque más prevalentes este año y cómo puede proteger su organización.",
    icon: BookOpen,
    link: "#", 
    category: "Amenazas Actuales"
  },
  {
    type: "Whitepaper",
    title: "Guía Completa para la Seguridad en la Nube (AWS, Azure, GCP)",
    description: "Un análisis profundo de las mejores prácticas y configuraciones esenciales para mantener segura su infraestructura cloud.",
    icon: FileText,
    link: "#", 
    category: "Seguridad Cloud"
  },
  {
    type: "Caso de Éxito",
    title: "Cómo TechSolutions XYZ Fortaleció su Seguridad Web con Nuestra Plataforma",
    description: "Vea cómo una empresa líder utilizó nuestros servicios para identificar y remediar vulnerabilidades críticas.",
    icon: ShieldAlert,
    link: "#", 
    category: "Casos de Éxito"
  },
  {
    type: "Artículo de Blog",
    title: "Entendiendo el Análisis SAST y DAST: Claves para un Código Seguro",
    description: "Una explicación clara de estas dos metodologías de prueba de seguridad de aplicaciones y cómo se complementan.",
    icon: BookOpen,
    link: "#", 
    category: "Desarrollo Seguro"
  },
  {
    type: "Guía Rápida",
    title: "Principios Básicos para la Seguridad de Servidores de Juegos",
    description: "Consejos esenciales para administradores de servidores de juegos que buscan proteger sus comunidades online.",
    icon: Zap,
    link: "#", 
    category: "Seguridad en Juegos"
  }
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <TooltipProvider>
        <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
          <section className="text-center mb-12 md:mb-16">
            <Rss className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Recursos de Ciberseguridad</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Manténgase informado con nuestros últimos artículos, guías, whitepapers y casos de éxito sobre el panorama de la ciberseguridad y cómo proteger sus activos digitales.
            </p>
          </section>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{resource.type}</span>
                    <span className="text-xs text-muted-foreground">{resource.category}</span>
                  </div>
                  <CardTitle className="text-xl leading-tight text-foreground">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  {resource.link === "#" ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10" disabled>
                          Leer Más / Descargar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recurso Próximamente</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button asChild variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
                      <Link href={resource.link}>
                        Leer Más / Descargar
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <section className="text-center mt-16 py-10 bg-secondary/30 rounded-xl shadow-inner border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">¿Busca Asesoramiento Personalizado?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Nuestro equipo de expertos está listo para ayudarle a abordar sus desafíos de seguridad específicos.
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Contáctenos
            </Link>
          </section>
        </main>
      </TooltipProvider>
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
