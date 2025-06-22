
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv'; // Asegurar que las variables de entorno se carguen

config(); // Cargar variables de entorno desde archivos .env

// Priorizar NEXT_PUBLIC_GOOGLE_API_KEY ya que es la que se indica en el README,
// luego GOOGLE_API_KEY y GEMINI_API_KEY como fallbacks.
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

// Lista de valores placeholder comunes para la clave API
const placeholderKeys = [
  "tu_clave_api_google_aqui_valida",
  "TU_CLAVE_API_GOOGLE_AI_VALIDA",
  "YOUR_GOOGLE_AI_API_KEY_HERE",
  "YOUR_GEMINI_API_KEY",
  "", // String vacío
  undefined, // No definido
  null // Nulo
];

if (!apiKey || placeholderKeys.includes(apiKey)) {
  const keyNameInUse = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? "NEXT_PUBLIC_GOOGLE_API_KEY" : 
                       (process.env.GOOGLE_API_KEY ? "GOOGLE_API_KEY" : 
                       (process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : "GOOGLE_API_KEY/GEMINI_API_KEY"));
  
  const errorMessage = `
**********************************************************************************************************************************************************************************************
ERROR CRÍTICO DE CONFIGURACIÓN DE GENKIT:
La clave API de Google AI (${keyNameInUse}) no está definida o sigue siendo un valor placeholder en sus variables de entorno.
Las funcionalidades de Inteligencia Artificial no operarán correctamente.

Por favor, configure una clave API válida en su archivo .env.local.
Puede obtener una clave API visitando: https://aistudio.google.com/app/apikey

Asegúrese de que la variable ${keyNameInUse} en su archivo .env.local tenga un valor real.
Ejemplo en .env.local:
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Después de configurar la clave, reinicie su servidor de desarrollo.
**********************************************************************************************************************************************************************************************`;
  console.error(errorMessage);
  // Podrías optar por lanzar un error aquí para detener la inicialización si una clave es absolutamente esencial.
  // throw new Error("Error crítico: Falta la clave API de Google AI. La aplicación no puede iniciar las funciones de IA.");
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey }) // Pasar explícitamente la clave API
  ],
});
