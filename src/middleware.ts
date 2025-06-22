import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = req.headers.get('cookie');
          if (!cookieHeader) return [];
          return cookieHeader.split(';').map((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            return { name, value: rest.join('=') };
          });
        },
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/perfil/:path*'],
};
