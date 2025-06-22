
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Code, DatabaseZap, ShieldEllipsis, TrendingDown, UserCog, ServerCog, Network, Database, Gamepad2, Bug, ServerOff, DollarSign, Users, ShieldOff, ShieldAlert, Bot, Globe } from "lucide-react";

export function HackingInfoSection() {
  return (
    <section className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg border-l-4 border-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-amber-600">
            <AlertTriangle className="h-6 w-6" />
            Vulnerabilidades Comunes y Modus Operandi
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Esta sección describe conceptos generales de vulnerabilidades y posibles vectores de ataque. Los análisis específicos de esta herramienta se basan en la información que usted proporciona sobre sus sistemas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          
          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Globe className="inline-block h-5 w-5 text-blue-500"/> Vulnerabilidades de Aplicaciones Web</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong className="text-foreground">Cross-Site Scripting (XSS):</strong> Inyección de scripts maliciosos en páginas web vistas por otros usuarios. Puede robar sesiones o redirigir a sitios falsos.</li>
                <li><strong className="text-foreground">Inyección SQL (SQLi):</strong> Manipulación de consultas a la base de datos para extraer, modificar o eliminar datos sensibles.</li>
                <li><strong className="text-foreground">Autenticación y Gestión de Sesiones Rotas:</strong> Fallos en cómo se manejan las cuentas y sesiones, permitiendo secuestro de cuentas o acceso no autorizado.</li>
                <li><strong className="text-foreground">Control de Acceso Roto:</strong> Permitir a usuarios acceder a funcionalidades o datos a los que no deberían tener permiso.</li>
                <li><strong className="text-foreground">Configuraciones de Seguridad Incorrectas:</strong> Ajustes por defecto inseguros, listado de directorios, mensajes de error detallados.</li>
                <li><strong className="text-foreground">Falsificación de Solicitudes del Lado del Servidor (SSRF):</strong> Forzar al servidor a realizar peticiones a recursos internos o externos no deseados.</li>
            </ul>
          </div>
          <hr className="border-border"/>

          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><ServerCog className="inline-block h-5 w-5 text-green-500"/> Vulnerabilidades de Servidores (General)</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong className="text-foreground">Software Desactualizado y Sin Parches:</strong> Explotación de vulnerabilidades conocidas en el SO, servidor web (Apache, Nginx), o aplicaciones.</li>
                <li><strong className="text-foreground">Servicios Inseguros Expuestos:</strong> Puertos abiertos innecesarios (ej. Telnet, FTP sin cifrar, RDP a internet sin protección).</li>
                <li><strong className="text-foreground">Credenciales Débiles o por Defecto:</strong> Contraseñas fáciles de adivinar, cuentas por defecto no cambiadas (ej. 'admin'/'admin').</li>
                <li><strong className="text-foreground">Escalada de Privilegios:</strong> Un atacante con acceso limitado explota una falla para obtener mayores permisos en el servidor.</li>
                <li><strong className="text-foreground">Mala Configuración de Firewalls y Redes:</strong> Reglas de firewall demasiado permisivas o mal configuradas.</li>
            </ul>
          </div>
          <hr className="border-border"/>
          
          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Gamepad2 className="inline-block h-5 w-5 text-purple-500"/> Vulnerabilidades Específicas de Servidores de Juegos</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong className="text-foreground">Explotación de Fallos del Motor del Juego:</strong> Vulnerabilidades en el software del servidor (ej. Unreal Engine, Unity, motores propietarios como los de Lineage 2, Tibia).</li>
                <li><strong className="text-foreground">Manipulación de Paquetes de Red:</strong> Interceptar y modificar datos de juego (ej. para speed hacks, teleports, duplicación de ítems en juegos como Roblox o servidores privados).</li>
                <li><strong className="text-foreground">Ataques de Denegación de Servicio (DDoS):</strong> Inundar el servidor con tráfico para hacerlo inaccesible a jugadores legítimos.</li>
                <li><strong className="text-foreground">Explotación de Lógica del Juego:</strong> Abusar de mecánicas del juego para obtener ventajas injustas (ej. bugs de duplicación, exploits de economía).</li>
                <li><strong className="text-foreground">Bypass de Anti-Cheat:</strong> Deshabilitar o eludir sistemas anti-trampas.</li>
                <li><strong className="text-foreground">Comandos de Administración Expuestos:</strong> Acceso no autorizado a comandos de consola (RCON) o APIs de administración del servidor.</li>
                <li><strong className="text-foreground">Credenciales de Jugador Inseguras:</strong> Almacenamiento o transmisión insegura de contraseñas o tokens de sesión de jugadores.</li>
            </ul>
          </div>
          <hr className="border-border"/>

          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Database className="inline-block h-5 w-5 text-teal-500"/> Vulnerabilidades de Bases de Datos (Incluyendo Juegos)</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong className="text-foreground">Autenticación Débil o por Defecto:</strong> Contraseñas fáciles, sin MFA, cuentas de servicio con privilegios excesivos.</li>
                <li><strong className="text-foreground">Inyección de Comandos (No solo SQLi):</strong> Para NoSQL (ej. MongoDB injection), OS command injection si la BD interactúa con el sistema. En juegos: manipulación de datos de personajes, inventarios, monedas virtuales.</li>
                <li><strong className="text-foreground">Falta de Cifrado de Datos Sensibles:</strong> Datos de jugadores (PII, credenciales), detalles de pago, inventarios de ítems valiosos no cifrados en reposo o en tránsito.</li>
                <li><strong className="text-foreground">Backups Inseguros:</strong> Copias de seguridad no cifradas, almacenadas incorrectamente o accesibles sin autorización.</li>
                <li><strong className="text-foreground">Auditoría y Logging Insuficientes:</strong> Dificultad para detectar o investigar trampas, robo de cuentas o manipulación de la economía del juego.</li>
                 <li><strong className="text-foreground">Exposición Innecesaria a la Red:</strong> Puertos de base de datos abiertos a internet sin justificación.</li>
            </ul>
          </div>
          <hr className="border-border"/>
           <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Bot className="inline-block h-5 w-5 text-sky-500"/> Ataques Asistidos por IA y Automatización</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong className="text-foreground">Fuerza Bruta Mejorada por IA:</strong> Modelos de IA que generan contraseñas más probables o aprenden de intentos fallidos.</li>
                <li><strong className="text-foreground">Generación de Payloads de Explotación Adaptativos:</strong> IA que crea o modifica payloads para evadir filtros o WAFs.</li>
                <li><strong className="text-foreground">Ingeniería Social Avanzada:</strong> Chatbots o perfiles falsos generados por IA para engañar a empleados o jugadores.</li>
                <li><strong className="text-foreground">Automatización de Reconocimiento y Explotación:</strong> Scripts y bots que escanean y explotan vulnerabilidades a gran escala.</li>
            </ul>
          </div>

        </CardContent>
      </Card>

      <Card className="shadow-lg border-l-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-destructive">
            <TrendingDown className="h-6 w-6" />
            Repercusiones Potenciales de un Hackeo Exitoso
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Las consecuencias de una brecha de seguridad pueden ser severas y variadas, afectando la operación, finanzas y reputación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <DatabaseZap className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Pérdida o Robo de Datos:</strong> Exposición de PII, credenciales, datos financieros, propiedad intelectual, datos de jugadores, cuentas de juego con ítems valiosos.</div>
            </div>
             <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <Users className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Toma de Control de Cuentas (ATO):</strong> Acceso no autorizado a cuentas de usuarios, administradores o jugadores, resultando en robo de activos virtuales o fraude.</div>
            </div>
             <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <ServerOff className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Interrupción del Servicio (DoS/DDoS):</strong> Sistemas o servidores de juego inaccesibles, causando pérdida de ingresos y frustración de usuarios.</div>
            </div>
             <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <DollarSign className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Impacto Financiero Directo:</strong> Costos de respuesta a incidentes, recuperación, multas regulatorias, pérdida de negocio, litigios, fraudes, robo de moneda virtual.</div>
            </div>
            <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <ShieldOff className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Daño Reputacional:</strong> Pérdida de confianza de clientes y jugadores, afectando la lealtad y adquisición de nuevos usuarios.</div>
            </div>
             <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <Bug className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Trampas y Desbalance en Juegos:</strong> En servidores de juegos, el hackeo puede llevar a trampas masivas, arruinando la experiencia y la economía del juego.</div>
            </div>
             <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <ShieldAlert className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Distribución de Malware:</strong> Uso de sistemas comprometidos para propagar malware o realizar phishing a otros usuarios o sistemas.</div>
            </div>
             <div className="flex items-start gap-2 p-2 border rounded-md bg-card">
              <Network className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div><strong className="text-foreground">Pivoting y Movimiento Lateral:</strong> Un servidor comprometido puede usarse como punto de entrada para atacar otros sistemas internos de la red.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
