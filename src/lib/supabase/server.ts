// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  // cookies() returns a Promise, so we need to handle it asynchronously
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies();
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Errors can occur if called in a context where cookies can't be set directly (e.g. during RSC render).
            // The middleware should handle ensuring the session cookie is correctly updated.
            // console.warn(`(Server Context) Cookie set for ${name} might be deferred to middleware or next response cycle.`);
          }
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies();
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Similar to set, this might be a no-op in certain RSC render paths.
            // console.warn(`(Server Context) Cookie remove for ${name} might be deferred to middleware or next response cycle.`);
          }
        },
      },
    }
  );
}