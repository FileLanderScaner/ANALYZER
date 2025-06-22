
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, Target, Zap, Building } from "lucide-react"; // Changed Users2 to Users
import Link from "next/link";
import { AppHeader } from "@/components/layout/header";


export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <section className="text-center mb-12 md:mb-16">
          <Shield className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Sobre Nosotros</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            En el Centro de Análisis de Seguridad Integral, nuestra misión es empoderar a las empresas para que naveguen el complejo panorama digital con confianza y seguridad.
          </p>
        </section>

        <Card className="mb-12 shadow-xl border border-border">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
              <Target className="mr-3 h-7 w-7" /> Nuestra Visión
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-base">
            <p>
              Aspiramos a ser líderes en la provisión de soluciones de ciberseguridad inteligentes y accesibles. Creemos que toda organización, independientemente de su tamaño, merece acceso a herramientas de vanguardia para proteger sus activos digitales, su reputación y la confianza de sus clientes.
            </p>
            <p>
              Mediante la combinación de Inteligencia Artificial avanzada y la experiencia de nuestros profesionales, buscamos anticiparnos a las amenazas emergentes y ofrecer estrategias de defensa proactivas y efectivas.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg border border-border">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center">
                <Users className="mr-2 h-6 w-6" /> Nuestro Equipo (Conceptual) 
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-3">
              <p>
                Contamos con un equipo multidisciplinario de expertos en ciberseguridad, desarrolladores de IA y analistas de amenazas con años de experiencia en la protección de infraestructuras críticas y aplicaciones web.
              </p>
              <p>
                Nuestros profesionales poseen certificaciones reconocidas en la industria (CISSP, OSCP, CEH, CompTIA Security+) y están en constante capacitación para enfrentar los desafíos de seguridad más recientes.
              </p>
              <p className="font-semibold text-foreground">Idea y Visión Principal: Ronald Gonzalez Niche</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-border">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center">
                <Zap className="mr-2 h-6 w-6" /> Nuestra Tecnología
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-3">
              <p>
                Nuestra plataforma se basa en el poder de Genkit de Google AI para realizar análisis de seguridad profundos y contextuales. Utilizamos modelos de lenguaje avanzados entrenados para identificar patrones de vulnerabilidades en una amplia gama de activos digitales.
              </p>
              <p>
                Combinamos esto con las mejores prácticas de la industria, heurísticas de seguridad y la capacidad de procesar grandes cantidades de información para ofrecer resultados precisos y accionables.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="text-center py-10 bg-secondary/30 rounded-xl shadow-inner border border-border">
          <Building className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-foreground mb-4">¿Listo para Mejorar su Seguridad?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Descubra cómo nuestra plataforma puede ayudar a su organización a identificar, analizar y remediar vulnerabilidades de manera eficiente.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Contáctenos
          </Link>
        </section>
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
