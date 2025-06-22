import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresca la sesión automáticamente si es necesario
  await supabase.auth.getSession();

  return res;
}

// Configura en qué rutas aplicar este middleware
export const config = {
  matcher: ['/dashboard/:path*', '/perfil/:path*'], // Asegura sesión en estas rutas
};
