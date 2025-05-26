// app/components/auth-listener.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { getSupabaseBrowserClient } from '@/lib/supabase/client'; // Your Supabase client utility
import type { Session, User } from '@supabase/supabase-js';

// Optional: If you want to provide session/user via React Context for client components
// import { useAuth } from '@/context/auth-context'; // Example path to your auth context

export default function AuthListener({
  serverSession,
}: {
  serverSession: Session | null; // Session fetched on the server for initial state
}) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  // Optional: Client-side state for immediate UI updates if not using context
  // const [clientSession, setClientSession] = useState<Session | null>(serverSession);
  // const [clientUser, setClientUser] = useState<User | null>(serverSession?.user ?? null);

  // Optional: If using an AuthContext
  // const { setSession: setContextSession, setUser: setContextUser } = useAuth();

  useEffect(() => {
    // Set initial client state from server-fetched session (if using local state)
    // setClientSession(serverSession);
    // setClientUser(serverSession?.user ?? null);

    // Set initial context state (if using context)
    // if (setContextSession && setContextUser && serverSession !== undefined) {
    //   setContextSession(serverSession);
    //   setContextUser(serverSession?.user ?? null);
    // }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Supabase auth event: ${event}`, newSession);

        // Update client-side state (if using local state)
        // setClientSession(newSession);
        // setClientUser(newSession?.user ?? null);

        // Update context state (if using context)
        // if (setContextSession && setContextUser) {
        //   setContextSession(newSession);
        //   setContextUser(newSession?.user ?? null);
        // }


        // Key actions based on events:
        if (event === 'SIGNED_IN') {
          // User has successfully signed in (email/pass, OAuth, magic link, etc.)
          // Refresh server components to reflect the new auth state
          router.refresh();
          // Optionally, you might want to redirect if they landed on a public page
          // after login, e.g., if (pathname === '/login') router.push('/dashboard');
          // However, redirects after login are often handled in the form submission logic.
        } else if (event === 'SIGNED_OUT') {
          // User has signed out
          // Refresh server components
          router.refresh();
          // Redirect to login or home page. Often handled by the signOut function itself or here.
          // Example: router.push('/login');
        } else if (event === 'TOKEN_REFRESHED') {
          // Session token has been refreshed.
          // Important for long-lived sessions.
          // Refresh server components if they rely on session data passed from server.
          console.log('Token refreshed, new session:', newSession);
          router.refresh();
        } else if (event === 'USER_UPDATED') {
          // User metadata has been updated (e.g., email change, password update)
          console.log('User updated:', newSession?.user);
          router.refresh();
        } else if (event === 'PASSWORD_RECOVERY') {
          // This event fires when the user lands on the redirect URL from a password recovery email.
          // Supabase client handles setting up a recovery session.
          // Your reset password page should then allow the user to call supabase.auth.updateUser().
          console.log('Password recovery mode initiated.');
          // Typically, no redirect is needed here as the user is already on the reset password page.
        }
        // Add more event handling as needed (e.g., MFA_CHALLENGE)
      }
    );

    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  // Add dependencies: supabase, router, and context setters if you use them.
  // serverSession is removed from deps array as we only use it for initial state setting.
  }, [supabase, router /*, setContextSession, setContextUser */]);

  // This component does not render any UI itself. Its purpose is to listen and react.
  return null;
}