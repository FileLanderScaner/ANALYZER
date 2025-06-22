import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // Ensure this path is correct

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  const errorMessage = "CRITICAL_SERVER_ERROR: NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables. Supabase admin client cannot be initialized.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}
if (!serviceRoleKey) {
  const errorMessage = "CRITICAL_SERVER_ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Supabase admin client cannot be initialized.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    // autoRefreshToken: false, // Typically, admin client does not need to auto-refresh tokens
    // persistSession: false,    // Admin client usually doesn't need to persist session like a user
  }
});