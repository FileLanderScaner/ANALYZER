
# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos como Lineage 2, Roblox, Tibia), bases de datos, código (SAST simulado), aplicaciones en ejecución (DAST simulado), descripciones de configuraciones de nube (AWS, Azure, GCP - conceptual), información de contenedores (Docker, K8s - conceptual), contenido de archivos de dependencias (npm, pip, maven, gem - conceptual) y descripciones de configuraciones de red/resultados de escaneos (conceptual) para identificar vulnerabilidades de seguridad utilizando IA.

**Enlace al Repositorio de GitHub:** [https://github.com/FIREmica/centro_de_analisis](https://github.com/FIREmica/centro_de_analisis)

**Idea y Visión:** Ronald Gonzalez Niche

## ¿Qué Problema Resuelve?

En el panorama digital actual, las empresas y los desarrolladores enfrentan una creciente amenaza de ciberataques. Asegurar cada componente de una aplicación o infraestructura puede ser complejo y llevar mucho tiempo. Este proyecto tiene como objetivo simplificar y automatizar gran parte de este proceso, proporcionando una visión unificada de la postura de seguridad de diversos activos digitales y ayudando a priorizar los esfuerzos de remediación.

## Funcionalidades Principales

*   **Análisis Multi-Objetivo:** Capacidad para analizar simultáneamente:
    *   URLs de aplicaciones web (riesgos comunes como XSS, SQLi).
    *   Descripciones de Servidores (generales y de juegos como Lineage 2, Roblox, Tibia) en busca de vulnerabilidades de configuración.
    *   Descripciones de Bases de Datos para identificar riesgos de configuración y acceso.
    *   Fragmentos de Código para Análisis Estático (SAST simulado) con sugerencias contextuales, línea de código y lenguaje específico.
    *   URLs para Análisis Dinámico (DAST simulado) con ejemplos conceptuales de petición/respuesta.
    *   Descripciones de Configuración Cloud (AWS, Azure, GCP - conceptual) para malas configuraciones.
    *   Información de Contenedores (nombre de imagen, Dockerfile, manifiestos K8s - conceptual).
    *   Contenido de Archivos de Dependencias (npm, pip, maven, gem - conceptual).
    *   Descripciones de Configuración de Red, reglas de firewall y resultados de escaneos (ej. Nmap - conceptual).
*   **Generación de Informes Detallados:** Creación de informes de seguridad completos en Markdown, incluyendo:
    *   Resumen ejecutivo general.
    *   Detalles de hallazgos por cada tipo de análisis realizado (con CVSS y detalles técnicos si se ha iniciado sesión y se tiene suscripción activa - simula Premium).
    *   Severidad, descripción, impacto potencial y remediación sugerida para cada hallazgo.
    *   **Priorización Inteligente de Remediaciones:** La IA no solo identifica vulnerabilidades, sino que también ayuda a priorizar cuáles abordar primero, considerando el impacto y la posible facilidad de explotación.
    *   Contexto específico para hallazgos SAST (ruta, línea, fragmento de código, sugerencia de arreglo) y DAST (parámetro, petición/respuesta).
    *   Consideraciones generales de cumplimiento normativo.
*   **Acceso a Funciones Avanzadas con Suscripción Premium (Gestionado con Supabase Auth y Simulación de Pago PayPal):**
    *   **Autenticación Real (en progreso):** Los usuarios pueden registrarse e iniciar sesión utilizando Supabase Auth. Un `AuthContext` gestiona la sesión globalmente.
    *   **Gestión de Perfil de Usuario:** Se ha definido un esquema para `user_profiles` en la base de datos Supabase (tabla `user_profiles`) que almacenará el estado de su suscripción. Se ha proporcionado el SQL para crear esta tabla y un trigger para crear perfiles básicos al registrarse.
    *   **Flujo de Pago con PayPal API REST (Simulación Avanzada):** La plataforma integra la API REST de PayPal (Sandbox por defecto, configurable para Live) para simular el proceso de "compra" de una suscripción **"Premium Esencial" por $10 USD/mes**:
        *   Un usuario autenticado puede iniciar un flujo de pago.
        *   El frontend llama a `/api/paypal/create-order` para crear una orden en PayPal.
        *   Tras la aprobación del usuario en la UI de PayPal, el frontend llama a `/api/paypal/capture-order`.
        *   El endpoint `/api/paypal/capture-order` ahora captura el pago con PayPal y luego actualiza el `subscription_status` del usuario en la tabla `user_profiles` de Supabase (utilizando la `SUPABASE_SERVICE_ROLE_KEY` para permisos).
    *   **Login Social con Facebook (Integración con Supabase OAuth):** Los usuarios pueden iniciar sesión/registrarse con Facebook a través del flujo OAuth gestionado por Supabase.
    *   **Funciones Premium Desbloqueadas:** Si `AuthContext` determina (leyendo de `user_profiles` después de una actualización) que el usuario tiene una suscripción activa (`subscription_status = 'active_premium'` o similar), se desbloquean:
        *   **Informe Técnico Detallado:** El informe de seguridad completo sin truncamiento.
        *   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
        *   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso en Markdown para corregir vulnerabilidades.
        *   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.
*   **Exportación de Hallazgos en JSON:** Permite descargar todos los hallazgos (vulnerables o no) en formato JSON para integración con otras herramientas (ej. SIEM), disponible para todos los usuarios.
*   **Asistente de Chat IA:** Un chatbot integrado para responder consultas sobre ciberseguridad y el uso de la plataforma.
*   **Interfaz de Usuario Moderna:** Desarrollada con Next.js, ShadCN UI y Tailwind CSS, con modo oscuro por defecto y en español.
*   **Historial de Análisis (En progreso):** Los análisis realizados por usuarios autenticados se guardan en la base de datos Supabase y se pueden visualizar en una página de Dashboard. (Próximamente: Vista de detalle de análisis individuales).

## Tecnologías Usadas

*   **Frontend:** Next.js, React, TypeScript
*   **UI:** ShadCN UI Components, Tailwind CSS
*   **Inteligencia Artificial:** Genkit (Google AI)
*   **Empaquetado (Descargas ZIP):** JSZip
*   **Pasarela de Pagos (Integración API REST):** PayPal (con SDK `@paypal/checkout-server-sdk` para backend y SDK de JS para frontend)
*   **Autenticación y Base de Datos:** Supabase (Cliente JS `@supabase/supabase-js` y `@supabase/ssr` para helpers del lado del servidor)
*   **Login Social:** Facebook (a través de Supabase Auth Providers)
*   **Gestión de Estado de Autenticación:** React Context (`AuthProvider`) para manejar la sesión de Supabase globalmente y el estado del perfil.
*   **Validación de Esquemas:** Zod
*   **Fuentes:** Geist Sans, Geist Mono
*   **Analíticas (Opcional):** Firebase Analytics
*   **CAPTCHA (Deshabilitado temporalmente):** hCaptcha (Integración pendiente de resolución de problemas de instalación del paquete `react-hcaptcha`)

## Instalación y Ejecución Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada)
*   npm o yarn
*   Una cuenta de Supabase ([supabase.com](https://supabase.com/))
*   Una cuenta de PayPal Developer ([developer.paypal.com](https://developer.paypal.com/)) para credenciales Sandbox y/o Live.
*   Una cuenta de Facebook Developer ([developers.facebook.com](https://developers.facebook.com/)) para obtener una App ID y App Secret.
*   Una cuenta de Firebase (opcional, si deseas usar Firebase Analytics u otros servicios de Firebase, o los emuladores).
*   CLI de Firebase (si vas a usar los emuladores): `npm install -g firebase-tools`

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/ciberanalitic/Centro-de-an-lisis.git
    cd Centro-de-an-lisis
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

### Configuración de Variables de Entorno

Este proyecto requiere claves API para funcionar correctamente.

1.  **Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:**

    **Para Desarrollo (usando PayPal Sandbox):**
    ```env
    # Clave API de Google AI (Requerida para los análisis de IA)
    # Consigue tu clave en https://aistudio.google.com/app/apikey
    NEXT_PUBLIC_GOOGLE_API_KEY=TU_CLAVE_API_GOOGLE_AI_VALIDA

    # --- Credenciales de PayPal API REST (Sandbox) ---
    # Estas son las credenciales que usarás para pruebas y desarrollo.
    # Asegúrate de que estas coincidan con las de tu aplicación REST API en el Dashboard de PayPal Developer para el entorno Sandbox.
    # ¡IMPORTANTE! El PAYPAL_CLIENT_SECRET debe corresponder al PAYPAL_CLIENT_ID. Si cambias uno, verifica el otro.
    PAYPAL_CLIENT_ID=AdLdNIavBkmAj9AyalbF_sDT0pF5l7PH0W6JHfHKl9gl5bIqrHa9cNAunX52IIoMFPtPPgum28S0ZnYr # Reemplaza con TU Client ID de PayPal Sandbox
    PAYPAL_CLIENT_SECRET=EKbftPC4jnqx1dgZq-2w6DnjL3Bfu7hmHIJzgl8kxQPzLMj8 # Reemplaza con TU Client Secret de PayPal Sandbox
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox

    # Client ID de PayPal para el SDK de JavaScript (Frontend - Sandbox)
    # IMPORTANTE: Este Client ID (NEXT_PUBLIC_PAYPAL_CLIENT_ID) debe ser el MISMO que el PAYPAL_CLIENT_ID
    # usado para la API REST de Sandbox.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=AdLdNIavBkmAj9AyalbF_sDT0pF5l7PH0W6JHfHKl9gl5bIqrHa9cNAunX52IIoMFPtPPgum28S0ZnYr # Reemplaza con TU Client ID de PayPal Sandbox (el mismo que PAYPAL_CLIENT_ID)

    # --- Credenciales de Supabase ---
    NEXT_PUBLIC_SUPABASE_URL="https://odrdziwcmlumpifxfhfc.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTgwMjgsImV4cCI6MjA2MzA5NDAyOH0.P7Wr7e070TRPkQR8LGLofg8xoXKxKov9WwZFb5xGcow"

    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxODAyOCwiZXhwIjoyMDYzMDk0MDI4fQ.FeSKcPEwG-W-F5Lxca14A7gJcXJZBL_ongrAieCIURM"

    # --- Credenciales de Facebook Login (App ID para el frontend) ---
    NEXT_PUBLIC_FACEBOOK_APP_ID=TU_FACEBOOK_APP_ID_AQUI

    # (Opcional) ID del Webhook de PayPal para pruebas con Sandbox (si usas webhooks en desarrollo)
    # PAYPAL_WEBHOOK_ID=TU_PAYPAL_SANDBOX_WEBHOOK_ID
    ```

    **Para Producción (usando PayPal LIVE):**
    ```env
    # Clave API de Google AI (Requerida)
    NEXT_PUBLIC_GOOGLE_API_KEY=TU_CLAVE_API_GOOGLE_AI_VALIDA

    # --- Credenciales de PayPal API REST (LIVE - PRODUCCIÓN) ---
    PAYPAL_CLIENT_ID=TU_PAYPAL_LIVE_CLIENT_ID_AQUI
    PAYPAL_CLIENT_SECRET=TU_PAYPAL_LIVE_CLIENT_SECRET_AQUI
    PAYPAL_API_BASE_URL=https://api-m.paypal.com # URL de Producción

    # Client ID de PayPal para el SDK de JavaScript (Frontend - LIVE)
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=TU_PAYPAL_LIVE_CLIENT_ID_AQUI # (el mismo que PAYPAL_CLIENT_ID de LIVE)

    # (CRUCIAL para Producción) ID del Webhook de PayPal para verificar notificaciones de PayPal (Live)
    # Configúralo en PayPal Developer (Dashboard > My Apps & Credentials > [Tu App LIVE] > Add Webhook)
    # ESTA ES UNA CONFIGURACIÓN DE SEGURIDAD CRÍTICA PARA ENTORNOS DE PRODUCCIÓN.
    PAYPAL_WEBHOOK_ID=TU_PAYPAL_LIVE_WEBHOOK_ID_CONFIGURADO_EN_PAYPAL

    # --- Credenciales de Supabase (Usa las mismas que para desarrollo o un proyecto de producción) ---
    NEXT_PUBLIC_SUPABASE_URL="https://odrdziwcmlumpifxfhfc.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTgwMjgsImV4cCI6MjA2MzA5NDAyOH0.P7Wr7e070TRPkQR8LGLofg8xoXKxKov9WwZFb5xGcow"
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxODAyOCwiZXhwIjoyMDYzMDk0MDI4fQ.FeSKcPEwG-W-F5Lxca14A7gJcXJZBL_ongrAieCIURM"

    # --- Credenciales de Facebook Login ---
    NEXT_PUBLIC_FACEBOOK_APP_ID=TU_FACEBOOK_APP_ID_AQUI

    # (Opcional) Clave API de Firebase para el cliente
    # NEXT_PUBLIC_FIREBASE_API_KEY=TU_FIREBASE_WEB_API_KEY
    ```

    **IMPORTANTE:**
    *   Reemplaza `TU_CLAVE_API_GOOGLE_AI_VALIDA` con tu propia clave real.
    *   Para desarrollo con Sandbox, los valores de PayPal de ejemplo (`AdLdNIavBkmA...` y `EKbftPC4...`) **NO FUNCIONARÁN** a menos que sean tuyos. Obtén tus propias credenciales Sandbox de PayPal.
    *   **Para Producción, DEBES usar tus credenciales LIVE de PayPal** y configurar la `PAYPAL_API_BASE_URL` a `https://api-m.paypal.com`.
    *   Asegúrate de que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` sea el mismo que `PAYPAL_CLIENT_ID` para el entorno correspondiente (Sandbox o Live).
    *   Para producción, el `PAYPAL_WEBHOOK_ID` es **ESENCIAL** para la seguridad.
    *   Reemplaza `TU_FACEBOOK_APP_ID_AQUI` con tu App ID de Facebook.
    *   Las credenciales de Supabase ya están pre-llenadas; usa las de tu propio proyecto Supabase.
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que `.env.local` esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API (Si necesitas cambiarlas o para Producción):**
    *   **Google AI:** [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **PayPal Sandbox/Live:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
        2.  Crea o selecciona tu aplicación REST API. Necesitarás una para Sandbox (desarrollo) y otra para Live (producción).
        3.  Obtén el `Client ID` y `Client Secret` para cada entorno. **Verifica que el Secret que uses en `.env.local` sea el correcto para el Client ID que estás usando.**
        4.  En la configuración de tu aplicación **LIVE** en PayPal Developer, crea un Webhook (Dashboard > My Apps & Credentials > [Tu App LIVE] > Add Webhook). Configura la URL de tu endpoint de webhook (ej. `https://TU_DOMINIO_DE_PRODUCCION/api/paypal/webhook`) y obtén el `Webhook ID`. Este ID se usará en la variable de entorno `PAYPAL_WEBHOOK_ID` y es necesario para la verificación de webhooks. **LA VERIFICACIÓN DE WEBHOOKS ES CRÍTICA PARA LA SEGURIDAD EN PRODUCCIÓN.**
    *   **Supabase:** "Project Settings" > "API" en tu [Supabase Dashboard](https://supabase.com/dashboard). Necesitarás `URL del Proyecto`, `Clave anónima pública (anon key)` y la `Clave de servicio (service_role key)`.
    *   **Facebook Login (para Supabase Auth Provider y Frontend SDK):**
        1.  Ve a [Facebook Developer Apps](https://developers.facebook.com/apps/).
        2.  Crea una nueva aplicación (o selecciona una existente).
        3.  Añade el producto "Inicio de sesión con Facebook".
        4.  Obtén tu **App ID** y tu **App Secret**. El **App ID** lo usarás en `NEXT_PUBLIC_FACEBOOK_APP_ID`. El **App ID** y **App Secret** los deberás **configurar en Supabase** (Authentication > Providers > Facebook).
        5.  En la configuración de "Inicio de sesión con Facebook" en Facebook Developers, asegúrate de que "Login con el SDK de JavaScript" esté activado y **añade la URL de Callback de OAuth de Supabase** a las "URIs de redirección OAuth válidas". Supabase te proporcionará esta URL de callback cuando configures Facebook como proveedor (será algo como `https://<TU_REF_DE_PROYECTO_SUPABASE>.supabase.co/auth/v1/callback`). También añade `http://localhost:9002` (o el puerto que uses) y la URL de tu sitio en producción.
    *   **Firebase (si usas Analytics):** Configuración de tu proyecto en la [Consola de Firebase](https://console.firebase.google.com/).
    *   **hCaptcha (si lo reactivas):** Obtén tu "Site Key" y "Secret Key" desde tu [hCaptcha Dashboard](https://dashboard.hcaptcha.com/).

### Configuración de Base de Datos Supabase (Fundamental)

Ejecuta el siguiente script SQL completo en el **SQL Editor** de tu proyecto Supabase. Este script crea las tablas `user_profiles` y `analysis_records` (si no existen) y configura los triggers y políticas RLS necesarios.

```sql
-- 1. Create the UserProfile table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' NOT NULL, -- e.g., 'free', 'active_premium', 'cancelled', 'past_due'
  subscription_plan_id TEXT, -- Can reference another table of plans if you have multiple
  current_period_end TIMESTAMP WITH TIME ZONE,
  paypal_customer_id TEXT, -- Optional: Store PayPal Payer ID if needed from payment details
  paypal_order_id TEXT, -- Store the last successful PayPal order ID for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.user_profiles IS 'Stores user profile information, including subscription status.';
COMMENT ON COLUMN public.user_profiles.id IS 'References the id in auth.users. Profiles are deleted when users are deleted.';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current status of the user''s subscription (e.g., free, active_premium)';
COMMENT ON COLUMN public.user_profiles.subscription_plan_id IS 'Identifier for the specific subscription plan, if applicable.';
COMMENT ON COLUMN public.user_profiles.current_period_end IS 'Date when the current subscription period ends or ended.';
COMMENT ON COLUMN public.user_profiles.paypal_customer_id IS 'Customer ID from PayPal (Payer ID), if applicable.';
COMMENT ON COLUMN public.user_profiles.paypal_order_id IS 'Last successful PayPal Order ID for reference. Updated by backend after payment capture.';

-- 2. Enable Row Level Security (RLS) on the user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for user_profiles
-- Users can view their own profile.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.user_profiles;
CREATE POLICY "Users can view their own profile."
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own non-sensitive profile details.
-- Sensitive fields like subscription_status, current_period_end, paypal_order_id
-- should ONLY be updated by a trusted server-side process (like your /api/paypal/capture-order
-- or /api/paypal/webhook endpoints using the SUPABASE_SERVICE_ROLE_KEY).
DROP POLICY IF EXISTS "Users can update their own non-sensitive details." ON public.user_profiles;
CREATE POLICY "Users can update their own non-sensitive details."
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    NOT (
      NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
      NEW.subscription_plan_id IS DISTINCT FROM OLD.subscription_plan_id OR
      NEW.current_period_end IS DISTINCT FROM OLD.current_period_end OR
      NEW.paypal_customer_id IS DISTINCT FROM OLD.paypal_customer_id OR
      NEW.paypal_order_id IS DISTINCT FROM OLD.paypal_order_id
      -- Add other sensitive fields here if needed to prevent user modification
    )
  );
-- Note: The SUPABASE_SERVICE_ROLE_KEY used in backend routes bypasses RLS.


-- 4. Create a trigger function to automatically create a user profile
--    when a new user signs up in auth.users.
--    This function now attempts to use full_name and avatar_url from raw_user_meta_data
--    which Supabase often populates with data from OAuth providers like Facebook.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- SECURITY DEFINER is important here to access auth.users table
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name', -- For OAuth (Facebook, Google, etc.)
    NEW.raw_user_meta_data->>'avatar_url', -- For OAuth
    'free' -- Default subscription status
  );
  RETURN NEW;
END;
$$;

-- 5. Create the trigger on the auth.users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 6. Create the AnalysisRecord table
CREATE TABLE IF NOT EXISTS public.analysis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    analysis_type TEXT NOT NULL, -- e.g., "URL", "Server", "Database", "SAST", "DAST", "Cloud", "Container", "Dependency", "Network"
    target_description TEXT NOT NULL,
    overall_risk_assessment TEXT, -- e.g., "Low", "Medium", "High", "Critical", "Informational"
    vulnerable_findings_count INTEGER DEFAULT 0,
    report_summary TEXT, -- Could store a short summary or key points
    full_report_data JSONB, -- Store the detailed JSON of all findings and report text
    CONSTRAINT check_analysis_type CHECK (analysis_type IN ('URL', 'Server', 'Database', 'SAST', 'DAST', 'Cloud', 'Container', 'Dependency', 'Network'))
);

COMMENT ON TABLE public.analysis_records IS 'Stores records of security analyses performed by users.';
COMMENT ON COLUMN public.analysis_records.analysis_type IS 'Type of security analysis performed.';
COMMENT ON COLUMN public.analysis_records.target_description IS 'User-provided description or identifier of the target analyzed.';
COMMENT ON COLUMN public.analysis_records.full_report_data IS 'Stores the complete analysis result object, including all findings and the generated report text.';

-- 7. Enable Row Level Security (RLS) for analysis_records
ALTER TABLE public.analysis_records ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for analysis_records
-- Users can view their own analysis records.
DROP POLICY IF EXISTS "Users can view their own analysis records." ON public.analysis_records;
CREATE POLICY "Users can view their own analysis records."
  ON public.analysis_records FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert new analysis records for themselves.
DROP POLICY IF EXISTS "Users can insert their own analysis records." ON public.analysis_records;
CREATE POLICY "Users can insert their own analysis records."
  ON public.analysis_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Users can delete their own analysis records.
-- DROP POLICY IF EXISTS "Users can delete their own analysis records." ON public.analysis_records;
-- CREATE POLICY "Users can delete their own analysis records."
--   ON public.analysis_records FOR DELETE
--   USING (auth.uid() = user_id);

-- Optional: Users cannot update analysis records (treat them as immutable once created).
-- If updates are needed, a more specific policy would be required.
DROP POLICY IF EXISTS "Analysis records are read-only after creation for users." ON public.analysis_records;
CREATE POLICY "Analysis records are read-only after creation for users."
  ON public.analysis_records FOR UPDATE
  USING (false); -- Effectively disallows updates by users via RLS
  
-- Note: The SUPABASE_SERVICE_ROLE_KEY used in backend routes bypasses RLS if needed for admin tasks.

-- 9. Create the 'notes' table (if you still want this example table for testing)
CREATE TABLE IF NOT EXISTS public.notes (
  id bigint primary key generated always as identity,
  title text not null
);

-- Insert some sample data into the 'notes' table (only if it's empty)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.notes) = 0 THEN
    INSERT INTO public.notes (title)
    VALUES
      ('Today I created a Supabase project.'),
      ('I added some data and queried it from Next.js.'),
      ('It was awesome!');
  END IF;
END $$;

-- Enable Row Level Security (RLS) for 'notes' table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access for 'notes' table
DROP POLICY IF EXISTS "public can read notes" ON public.notes;
CREATE POLICY "public can read notes"
  ON public.notes
  FOR SELECT TO anon
  USING (true);
```

### Configuración de Proveedores de Autenticación en Supabase
1.  **Facebook Login (Usando el flujo OAuth de Supabase):**
    *   En tu proyecto Supabase: Ve a "Authentication" -> "Providers".
    *   Habilita "Facebook".
    *   Ingresa tu **Facebook App ID** y **Facebook App Secret** (obtenidos de Facebook Developer Portal) directamente en los campos correspondientes de Supabase.
    *   Supabase te proporcionará una **URL de Callback/Redirección**. Cópiala.
    *   En la configuración de tu App de Facebook (developers.facebook.com):
        *   Asegúrate de que el producto "Inicio de sesión con Facebook" esté añadido.
        *   En "Configuración" (bajo "Inicio de sesión con Facebook"), pega la URL de Callback de Supabase en "URIs de redirección OAuth válidas".
        *   Añade `http://localhost:9002` (o tu puerto de desarrollo) y tu URL de producción a las URIs válidas también.
    *   **Importante:** Asegúrate de que la "URL del Sitio" en Supabase (Authentication -> Settings) esté configurada a `http://localhost:9002` para desarrollo y a tu URL de producción para el entorno live. También añade estas URLs a la lista de "Redirect URLs" adicionales en la misma página de configuración de Supabase Auth.

### Ejecutando la Aplicación

1.  **Iniciar el servidor de desarrollo de Next.js:**
    ```bash
    npm run dev
    ```
    La aplicación debería estar disponible en [http://localhost:9002](http://localhost:9002) (o el puerto que hayas configurado).
2.  **Iniciar el servidor de desarrollo de Genkit (opcional, si estás desarrollando flujos de IA):**
    ```bash
    npm run genkit:watch
    ```
    Genkit UI estará disponible en [http://localhost:4000](http://localhost:4000) por defecto.
3.  **Iniciar los Emuladores de Firebase (opcional, si estás desarrollando con Firebase Hosting o Functions localmente):**
    ```bash
    firebase emulators:start
    ```
    Esto iniciará los emuladores según la configuración en `firebase.json`. Por defecto:
    *   Hosting: [http://localhost:5001](http://localhost:5001)
    *   Functions: Puerto 5002
    *   Emulator UI: [http://localhost:4001](http://localhost:4001)
    *   Otros emuladores (Auth, Firestore, etc.) se iniciarán en sus puertos por defecto si están habilitados en `firebase.json`.

    **Nota:** Si sirves tu aplicación Next.js a través del emulador de Firebase Hosting, asegúrate de que cualquier URL de redirección configurada en Supabase y proveedores OAuth (como Facebook) también apunte a la URL del emulador (ej. `http://localhost:5001`) para las pruebas.

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma utiliza **Supabase Auth**. Un `AuthProvider` (`src/context/AuthContext.tsx`) gestiona la sesión globalmente y carga el perfil del usuario desde la tabla `user_profiles` para determinar el estado `isPremium` basado en el campo `subscription_status`.

**Estado Actual:**
*   Los formularios de Login/Signup (`src/app/login/page.tsx`, `src/app/signup/page.tsx`) interactúan con las funciones de autenticación de Supabase (`signInWithPassword`, `signUp`).
*   El inicio de sesión con Facebook ahora utiliza el flujo `supabase.auth.signInWithOAuth({ provider: 'facebook' })` o una combinación del SDK de JS de Facebook y una API route para el backend.
*   El `AuthContext` (`src/context/AuthContext.tsx`) escucha los cambios de estado de autenticación de Supabase y obtiene el perfil del usuario de la tabla `user_profiles`. El estado `isPremium` se deriva de `userProfile.subscription_status`.
*   Se ha proporcionado el SQL para crear la tabla `user_profiles` y un trigger de base de datos (`handle_new_user`) que automáticamente crea un perfil básico (con `subscription_status = 'free'` y datos de OAuth si están disponibles) cuando un nuevo usuario se registra en `auth.users`.
*   Se ha definido el SQL para crear la tabla `analysis_records` para almacenar el historial de análisis. La lógica para guardar los análisis en esta tabla (dentro de `src/app/actions.ts`) y para mostrar el historial en `/dashboard` ya está implementada.

## Login Social con Facebook (Usando Supabase OAuth Provider o SDK de JS + API Route)
*   Las páginas de Login y Signup utilizan el SDK de JS de Facebook para el frontend y llaman a una API Route (`/api/auth/facebook`) que necesita ser implementada para un intercambio seguro de tokens y autenticación con Supabase en el backend. Alternativamente, se podría simplificar usando `supabase.auth.signInWithOAuth({ provider: 'facebook' })` directamente si se prefiere el flujo gestionado por Supabase.
*   Esto requiere que hayas configurado Facebook como un proveedor de autenticación en tu panel de Supabase (Authentication > Providers) y que hayas proporcionado tu App ID y App Secret de Facebook allí.
*   También debes configurar la URL de Callback de Supabase en tu app de Facebook Developer.
*   Este método gestiona el flujo OAuth completo, incluyendo redirecciones y manejo de tokens.

## Implementación de Pagos con PayPal (API REST - Sandbox/Live)

La plataforma simula la compra de una suscripción "Premium Esencial" por $10 USD/mes.
*   **Creación de Órdenes:** El frontend (`src/app/page.tsx`) llama a `/api/paypal/create-order` (backend). El backend usa las credenciales API de PayPal (desde `.env.local`) para crear una orden en PayPal y devuelve el `orderID`.
*   **Procesamiento de Pago Frontend:** El SDK de JS de PayPal (cargado en `src/app/layout.tsx`) usa el `orderID` para mostrar los botones de pago de PayPal.
*   **Captura de Órdenes:** Tras la aprobación del usuario en la UI de PayPal, el frontend llama a `/api/paypal/capture-order` (backend) con el `orderID`.
*   **Actualización de Base de Datos:** El endpoint `/api/paypal/capture-order` (backend):
    1.  Verifica al usuario autenticado (Supabase).
    2.  Captura el pago con PayPal usando las credenciales API.
    3.  Si la captura es exitosa, usa un cliente Supabase con la `SUPABASE_SERVICE_ROLE_KEY` para actualizar la tabla `user_profiles` del usuario:
        *   `subscription_status` a `'active_premium'`.
        *   `current_period_end` (ej. 30 días desde ahora).
        *   `paypal_order_id`.
*   **Refresco de Estado en Frontend:** `AuthContext` llama a `refreshUserProfile()` después de una captura de pago exitosa para cargar el nuevo estado de suscripción desde la base de datos, lo que actualiza el acceso a las funciones premium en la UI.

## Implementación de Webhooks de PayPal (CRÍTICO para Producción)

*   **Necesidad:** Para manejar confirmaciones de pago asíncronas y eventos del ciclo de vida de la suscripción (renovaciones, cancelaciones, etc.) de forma fiable. Esto asegura que tu base de datos se mantenga sincronizada incluso si el flujo del cliente se interrumpe.
*   **Endpoint:** Se ha creado un endpoint en `/src/app/api/paypal/webhook/route.ts`. Debes configurar esta URL en tu aplicación de PayPal Developer y registrarla para los eventos relevantes (ej. `PAYMENT.CAPTURE.COMPLETED`).
*   **🔴🔴🔴 ADVERTENCIA DE SEGURIDAD CRÍTICA (WEBHOOKS PAYPAL) 🔴🔴🔴:**
    *   **LA VERIFICACIÓN DE LA FIRMA DEL WEBHOOK EN `/src/app/api/paypal/webhook/route.ts` ES ACTUALMENTE UN PLACEHOLDER Y ESTÁ BYPASSADA (SIEMPRE DEVUELVE `true`).**
    *   **PARA USO EN PRODUCCIÓN, ES ABSOLUTAMENTE ESENCIAL IMPLEMENTAR UNA VERIFICACIÓN DE FIRMA SEGURA Y ROBUSTA.**
    *   Sin una verificación adecuada, su endpoint de webhook es vulnerable a solicitudes falsificadas, lo que podría permitir a un atacante manipular el estado de las suscripciones de los usuarios en su base de datos.
    *   Consulte la documentación oficial de PayPal sobre "Verificación de firmas de webhook". Necesitará su `PAYPAL_WEBHOOK_ID` (configurado en PayPal Developer y en sus variables de entorno de producción).
    *   **NO PASE A PRODUCCIÓN SIN IMPLEMENTAR ESTA VERIFICACIÓN.**
*   **Procesamiento de Eventos:** El endpoint tiene una estructura para analizar el `event_type` (como `PAYMENT.CAPTURE.COMPLETED`) y conceptualmente actualizar la tabla `user_profiles` en Supabase. Debe ser **idempotente**.

## Solución de Problemas Comunes

*   **Error de Clave API de Google AI:** Si los análisis fallan con errores sobre la clave API, verifica `NEXT_PUBLIC_GOOGLE_API_KEY` en tu `.env.local`. Asegúrate de que sea una clave válida de Google AI Studio y que el servidor de desarrollo se haya reiniciado después de añadirla.
*   **Error de Pagos de PayPal (Error `invalid_client` o similar):** Si los botones de PayPal no aparecen, la creación de órdenes falla, o la captura de pagos falla con un error de autenticación:
    *   **VERIFICA TUS CREDENCIALES DE PAYPAL EN `.env.local`:** Asegúrate de que `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` sean **EXACTAMENTE** los correctos para tu aplicación REST API de PayPal (Sandbox para desarrollo, Live para producción). Un solo carácter erróneo causará el fallo. (Ejemplo Sandbox: `PAYPAL_CLIENT_ID=AdLdNIavBkmAj9AyalbF_sDT0pF5l7PH0W6JHfHKl9gl5bIqrHa9cNAunX52IIoMFPtPPgum28S0ZnYr` y el secreto `EKbftPC4jnqx1dgZq-2w6DnjL3Bfu7hmHIJzgl8kxQPzLMj8`).
    *   **REINICIA EL SERVIDOR DE DESARROLLO (`npm run dev`)**: Después de cualquier cambio en `.env.local`, DEBES reiniciar el servidor.
    *   **REVISA LOS LOGS DEL SERVIDOR NEXT.JS:** La terminal donde ejecutas `npm run dev` mostrará errores detallados del backend (ej. de `/api/paypal/create-order`) que son cruciales para diagnosticar. Busca mensajes como "PAYPAL_CLIENT_ID (desde process.env en API): NO DEFINIDO".
    *   Asegúrate de que `PAYPAL_API_BASE_URL` esté configurado a `https://api-m.sandbox.paypal.com` para pruebas Sandbox, o `https://api-m.paypal.com` para producción Live.
    *   Verifica que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (para el frontend) sea el mismo que `PAYPAL_CLIENT_ID` (para el backend), y que ambos correspondan al entorno correcto (Sandbox o Live).
    *   **Error "Está iniciando sesión en la cuenta del vendedor para esta compra...":** Este error de PayPal ocurre si intentas pagar con la misma cuenta de vendedor (negocio/desarrollador) que recibe el pago. **Solución:** Crea una cuenta de comprador (Personal) separada en tu PayPal Developer Sandbox y úsala para realizar los pagos de prueba. No uses las credenciales de tu cuenta de vendedor para simular una compra.
*   **Errores de Autenticación o Base de Datos con Supabase:**
    *   **Error "Invalid API key" o "Failed to fetch" al Iniciar Sesión/Registrarse:** Este error casi siempre significa que `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` en tu archivo `.env.local` son incorrectas, están vacías, o el servidor de desarrollo no se reinició después de modificarlas.
        1.  Verifica dos veces que los valores en `.env.local` coincidan exactamente con los de tu proyecto Supabase (Project Settings > API).
        2.  Asegúrate de que el archivo se llame `.env.local` y esté en la raíz de tu proyecto.
        3.  **Detén y reinicia tu servidor de desarrollo Next.js** (`npm run dev`).
    *   Para operaciones de backend (como actualizar el estado de suscripción en `/api/paypal/capture-order`), asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurada en `.env.local` y sea correcta.
    *   **Error en la Creación de Perfiles de Usuario ("Database error saving new user"):** Si los usuarios se pueden registrar en Supabase Auth (tabla `auth.users`) pero no se crea una entrada correspondiente en `public.user_profiles`, el trigger `handle_new_user` podría haber fallado o no estar configurado.
        1.  **Verifica la Ejecución del SQL:** Asegúrate de haber ejecutado **todo** el script SQL para `user_profiles` y `handle_new_user` (incluyendo `CREATE FUNCTION` y `CREATE TRIGGER`) en el Editor SQL de Supabase.
        2.  **Revisa los Logs de Base de Datos de Supabase:** En tu panel de Supabase, ve a "Database" -> "Logs" (o similar, la UI puede cambiar) y busca errores que puedan haber ocurrido alrededor del momento del registro de un nuevo usuario. Estos logs pueden dar pistas sobre por qué falló el trigger (ej. violación de restricción `UNIQUE` si el email ya existe en `user_profiles`).
        3.  **Verifica la Definición de la Función y el Trigger:** En Supabase, ve a "Database" -> "Functions" y asegúrate de que `handle_new_user` exista y su definición sea correcta (especialmente `SECURITY DEFINER` y el uso de `NEW.raw_user_meta_data->>'full_name'` y `NEW.raw_user_meta_data->>'avatar_url'`). Luego ve a "Database" -> "Triggers" y verifica que `on_auth_user_created` esté asociado a la tabla `auth.users` y llame a `handle_new_user`.
        4.  **Permisos:** La función `handle_new_user` debe tener `SECURITY DEFINER` para poder insertar en `public.user_profiles`. La `service_role` de Supabase tiene permisos para esto.
*   **Login con Facebook (usando Supabase OAuth Provider o SDK de JS + API Route):**
    *   Asegúrate de haber habilitado Facebook como proveedor de autenticación en tu panel de Supabase (Authentication > Providers) y haber configurado el **App ID** y **App Secret** de Facebook allí.
    *   Verifica que `NEXT_PUBLIC_FACEBOOK_APP_ID` esté correctamente configurado en tu `.env.local`.
    *   En la configuración de tu app de Facebook Developer, verifica que has añadido la **URL de Callback de Supabase** a las "URIs de redirección OAuth válidas".
    *   Asegúrate de que la "URL del Sitio" en la configuración de autenticación de Supabase esté correctamente establecida para tu entorno de desarrollo (ej. `http://localhost:9002`).
*   **Problemas con hCaptcha (Actualmente Deshabilitado):**
    *   El componente `react-hcaptcha` ha sido eliminado de las dependencias y su uso comentado en los formularios de login/signup debido a problemas persistentes con `npm install`.
    *   **Si deseas reactivarlo:** Sigue las instrucciones detalladas en la sección "Reactivación de hCaptcha" más abajo en este README.
    *   **Error "captcha verification process failed" de Supabase:** Si ves este error en los `toast` de login/signup incluso con el frontend de hCaptcha deshabilitado, significa que **tienes la protección CAPTCHA activada a nivel de proyecto en Supabase**. Ve a tu proyecto Supabase -> Authentication -> Settings y desactiva la protección CAPTCHA. Guarda los cambios.

## Despliegue

### Despliegue en Vercel

Vercel es una excelente plataforma para desplegar aplicaciones Next.js. Para desplegar este proyecto en Vercel:

1.  **Conecta tu repositorio de Git** a Vercel.
2.  **Configura las Variables de Entorno en Vercel:**
    *   Ve a la configuración de tu proyecto en Vercel (Project Settings -> Environment Variables).
    *   Añade las siguientes variables de entorno (obtenidas de tu archivo `.env.local` o de tus paneles de servicio):

        *   `NEXT_PUBLIC_GOOGLE_API_KEY`: Tu clave API de Google AI.
        *   `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto Supabase.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave anónima pública de tu proyecto Supabase.
        *   `SUPABASE_SERVICE_ROLE_KEY`: **(SECRETA)** La clave de servicio de tu proyecto Supabase. Asegúrate de que Vercel la trate como secreta.
        *   `PAYPAL_CLIENT_ID`: Tu Client ID de PayPal (Sandbox o Live, según el entorno que estés desplegando).
        *   `PAYPAL_CLIENT_SECRET`: **(SECRETA)** Tu Client Secret de PayPal.
        *   `PAYPAL_API_BASE_URL`: `https://api-m.sandbox.paypal.com` para Sandbox, o `https://api-m.paypal.com` para Live.
        *   `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: Tu Client ID de PayPal para el SDK de JS (frontend). Debe coincidir con `PAYPAL_CLIENT_ID`.
        *   `PAYPAL_WEBHOOK_ID`: **(SECRETA, MUY IMPORTANTE para producción Live)** El ID de tu Webhook configurado en PayPal Developer.
        *   `NEXT_PUBLIC_FACEBOOK_APP_ID`: El App ID de tu aplicación de Facebook para el login social.
        *   (Opcional) `NEXT_PUBLIC_FIREBASE_API_KEY` y otras variables de Firebase si usas Firebase Analytics.
        *   (Opcional) `HCAPTCHA_SECRET_KEY` y `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` si reactivas hCaptcha.

3.  **Configura la "URL del Sitio" en Supabase:**
    *   En tu proyecto Supabase (Authentication -> Settings), asegúrate de que la "Site URL" esté configurada a la URL de tu despliegue en Vercel (ej. `https://tu-proyecto.vercel.app`).
    *   Añade esta URL también a la lista de "Redirect URLs" adicionales.
    *   Si usas Facebook Login, añade también la URL de Vercel a las "URIs de redirección OAuth válidas" en tu configuración de la app de Facebook Developer.

4.  **Configura la URL del Webhook de PayPal:**
    *   En tu aplicación de PayPal Developer, asegúrate de que la URL del Webhook apunte a `https://TU_DOMINIO_VERCEL/api/paypal/webhook`.

5.  **Framework Preset:** Vercel debería detectar automáticamente que es un proyecto Next.js.

Con estas variables configuradas, tu aplicación desplegada en Vercel podrá conectarse a Supabase y a los otros servicios (PayPal, Google AI, Facebook).

## Pasos Críticos para Puesta en Marcha Online (Producción)

1.  **Autenticación y Gestión de Perfiles Completa (Supabase):**
    *   Asegurar que la creación de perfiles (`user_profiles`) funcione sin fallos con el trigger `handle_new_user` para todos los métodos de registro (email, Facebook, etc.).
    *   Implementar una UI para que los usuarios gestionen su perfil (cambiar nombre, avatar, etc. - *Roadmap*).
2.  **Integración Completa de Pasarela de Pagos (PayPal):**
    *   Pasar a credenciales LIVE de PayPal en variables de entorno de producción.
    *   **IMPLEMENTAR Y PROBAR EXHAUSTIVAMENTE LOS WEBHOOKS DE PAYPAL, INCLUYENDO LA VERIFICACIÓN DE FIRMA DE FORMA SEGURA CON TU `PAYPAL_WEBHOOK_ID`. (VER ADVERTENCIA DE SEGURIDAD ARRIBA).**
    *   Asegurar que la actualización de `user_profiles` en la base de datos sea 100% fiable e idempotente.

    *   **¿Cómo obtener tu `PAYPAL_WEBHOOK_ID`?:**
        1.  Inicia sesión en el [PayPal Developer Dashboard](https://developer.paypal.com/developer/applications).
        2.  Selecciona la aplicación REST API que estás utilizando (o crea una nueva para producción).  Asegúrate de que estés usando las credenciales "Live" (Producción) en lugar de "Sandbox".
        3.  Dentro de los detalles de tu aplicación, busca la sección "Webhooks" y haz clic en "Add Webhook".
        4.  En el formulario de configuración del Webhook:
            *   **URL del Webhook:** Ingresa la URL completa de tu endpoint de webhook.  Debe ser una URL HTTPS accesible públicamente.  Por ejemplo: `https://tu-dominio.com/api/paypal/webhook`.
            *   **Eventos:** Selecciona los eventos para los que deseas recibir notificaciones.  Como mínimo, selecciona `PAYMENT.CAPTURE.COMPLETED` para el procesamiento de pagos.  También puedes seleccionar otros eventos como `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `CUSTOMER.DISPUTE.CREATED`, etc., dependiendo de tu lógica de negocio.
            *   Haz clic en "Save".
        5.  Después de guardar, PayPal generará un `Webhook ID`.  Este ID se mostrará en los detalles de tu webhook en el Dashboard.  Cópialo y configúralo como el valor de la variable de entorno `PAYPAL_WEBHOOK_ID` en tu entorno de producción.
    *   **Recuerda:** La verificación de la firma del webhook es crucial para la seguridad.  Sin ella, cualquiera podría enviar solicitudes falsas a tu endpoint de webhook y manipular tu base de datos.
    *   **Idempotencia:** Asegúrate de que tu lógica de procesamiento de webhooks sea idempotente. Esto significa que si el mismo evento se recibe varias veces (por ejemplo, debido a un problema de red), procesarlo varias veces tiene el mismo efecto que procesarlo una sola vez. Una forma común de lograr esto es verificar si la orden ya ha sido procesada en tu base de datos antes de realizar cualquier acción.

4.  **Persistencia del Historial de Análisis:**
    *   La lógica en `src/app/actions.ts` (dentro de `performAnalysisAction`) para guardar los resultados de cada análisis en la tabla `analysis_records` de Supabase, vinculados al `userId`, ya está implementada.
    *   La página `/dashboard` ahora muestra estos registros al usuario autenticado.
5.  **Despliegue y Alojamiento Profesional:** Vercel, AWS, GCP, etc. Configuración segura de variables de entorno LIVE.
6.  **Seguridad de la Plataforma:** Protección de claves, validación de entradas, rate limiting, firewalls.
7.  **Aspectos Legales:** Términos de Servicio (`terms.md`) y Política de Privacidad (`privacy.md`) profesionalmente redactados y adaptados a tu servicio. (Actualmente son plantillas y requieren revisión legal).
8.  **Operaciones y Mantenimiento:** Logging, monitorización, copias de seguridad, soporte al cliente.
9.  **Publicidad (Google AdSense - Opcional):** Si se desea, integrar Google AdSense para ingresos adicionales, considerando el impacto en la experiencia del usuario.

## Roadmap (Posibles Mejoras Futuras)
*   **Integración Profunda con Herramientas de Seguridad:** Permitir importación/exportación con Nessus, Burp Suite.
*   **Motor de Reglas Personalizadas:** Permitir a las empresas definir sus propias reglas de detección.
*   **Políticas de Seguridad Corporativas:** Validar contra políticas definidas por la empresa.
*   **Integración con SIEM/SOAR:** Enviar alertas y hallazgos a Splunk, QRadar, Sentinel.
*   **Integración con CI/CD:** Automatizar análisis en pipelines de desarrollo.
*   **Análisis de Seguridad de APIs Dedicado.**
*   **Paneles de Control (Dashboards) Avanzados:** Con métricas, tendencias y visualizaciones interactivas para el historial de análisis.
*   **Informes en PDF Personalizables.**
*   **Interfaz de Línea de Comandos (CLI).**
*   **Mejoras en Análisis de Servidores de Juegos:** Detección de trampas, análisis de protocolos de juego, análisis de scripts/mods.
*   **Soporte Multilingüe Adicional.**
*   **Gestión de Equipos/Organizaciones:** Cuentas maestras con múltiples usuarios y roles.
*   **Pruebas Unitarias y de Integración (Jest, Vitest).**
*   **Linters y Formateadores (ESLint, Prettier) con Hooks (Husky).**
*   **Documentación Técnica Detallada para Desarrolladores (`/docs` o Wiki).**

## Reactivación de hCaptcha (Opcional)
La integración de hCaptcha está actualmente deshabilitada en los formularios de login/signup debido a problemas persistentes con la instalación del paquete `react-hcaptcha` en el entorno de desarrollo. Si deseas reactivarla:

1.  **Intenta Instalar `react-hcaptcha`:**
    ```bash
    npm install react-hcaptcha@latest --save
    # o
    yarn add react-hcaptcha@latest
    ```
    Si esto falla, investiga el error específico. Podría ser un problema con tu caché de npm (`npm cache clean --force`), tu registro de npm, o un problema de red. Consulta `npmjs.com` para la última versión estable y prueba con esa versión específica si `@latest` no funciona.
2.  **Descomenta el Código:**
    *   En `src/app/login/page.tsx` y `src/app/signup/page.tsx`:
        *   Descomenta el `import HCaptcha from "react-hcaptcha";`.
        *   Descomenta el estado `captchaToken` y la referencia `captchaRef`.
        *   Descomenta las funciones `onCaptchaVerify`, `onCaptchaExpire`, y `onCaptchaError`.
        *   Descomenta el componente `<HCaptcha ... />` dentro de los formularios.
        *   Descomenta la lógica que deshabilita el botón de envío si `!captchaToken`.
3.  **Variables de Entorno (Frontend):**
    *   Asegúrate de que `NEXT_PUBLIC_HCAPTCHA_SITE_KEY=22860de4-8b40-4054-95d8-fac6d9f477ca` (o tu clave de sitio real) esté en tu `.env.local`.
4.  **Implementar Verificación del Backend (¡CRUCIAL!):**
    *   Esto es esencial para que hCaptcha sea efectivo. Necesitarás modificar la lógica de backend que maneja el login/signup (si es una API route o una Server Action) para:
        *   Recibir el `captchaToken` que el frontend envía.
        *   Hacer una solicitud `POST` al endpoint de verificación de hCaptcha: `https://api.hcaptcha.com/siteverify`.
        *   Enviar los siguientes parámetros en el cuerpo de la solicitud (como `application/x-www-form-urlencoded`):
            *   `secret`: Tu **clave secreta de hCaptcha** (debe estar en una variable de entorno del servidor, ej. `HCAPTCHA_SECRET_KEY`).
            *   `response`: El `captchaToken` recibido del frontend.
            *   `remoteip`: (Opcional pero recomendado) La dirección IP del usuario.
        *   El proceso de login/signup solo debe continuar si la respuesta de `siteverify` es exitosa (`"success": true`).

## 🪪 Licencia
Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche


[https://github.com/FIREmica/centro_de_analisis]: https://github.com/ciberanalitic/Centro-de-an-lisis#   A N A L Y Z E R  
 