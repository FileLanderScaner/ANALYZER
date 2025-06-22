
import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

// Removed the user's actual valid URL and Key from this list.
// Kept generic placeholders.
const placeholderKeys = [
  "YOUR_SUPABASE_URL", 
  "YOUR_SUPABASE_ANON_KEY",
  "tu_clave_api_google_aqui_valida", // A common placeholder format seen
  // "https://odrdziwcmlumpifxfhfc.supabase.co", // REMOVED - This is a valid user value
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTgwMjgsImV4cCI6MjA2MzA5NDAyOH0.P7Wr7e070TRPkQR8LGLofg8xoXKxKov9WwZFb5xGcow" // REMOVED - This is a valid user value
];

const urlPlaceholders = ["https://your-project-id.supabase.co"];

if (!supabaseUrl || supabaseUrl.trim() === "" || placeholderKeys.includes(supabaseUrl) || urlPlaceholders.includes(supabaseUrl)) {
  console.warn(
    "CRITICAL WARNING: Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is not defined, empty, or is a placeholder/example value. " +
    "Supabase client-side features will be disabled. Please set it correctly in your .env.local file."
  );
} else if (!supabaseAnonKey || supabaseAnonKey.trim() === "" || placeholderKeys.includes(supabaseAnonKey)) {
  console.warn(
    "CRITICAL WARNING: Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is not defined, empty, or is a placeholder/example value. " +
    "Supabase client-side features will be disabled. Please set it correctly in your .env.local file."
  );
} else {
  try {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("CRITICAL ERROR: Error initializing Supabase client in src/lib/supabase/client.ts:", e);
    // supabaseInstance remains null
  }
}

export const supabase = supabaseInstance;
