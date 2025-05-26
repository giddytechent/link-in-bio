// app/components/auth/reset-password-form.tsx
'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import {
  Lock,
  KeyRound, // For reset password theme
  AlertCircle,
  CheckCircle,
  Save, // For save new password button
} from 'lucide-react';

const fontHeading = "font-manrope";

// It's good practice to wrap useSearchParams in Suspense for Server Components,
// but since this whole form is a client component, we can use it directly.
// However, if this component was rendered by a server component that *itself*
// wasn't wrapped in Suspense for this specific searchParam usage, issues could arise.
// For simplicity here, we'll use it directly.

function ResetPasswordFormComponent() { // Renamed to avoid conflict if exported directly
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("No reset token found. Please request a new password reset link.");
      // Optionally redirect if no token:
      // setTimeout(() => router.push('/forgot-password'), 3000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', { // Your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccessMessage("Password updated successfully! Redirecting to login...");
        router.push('/login');
      }
    } catch (err) {
    console.error("Reset password error:", err);
    setError("An unexpected error occurred. Please check your internet connection.");
  } finally {
    setIsLoading(false);
  }
};

if (!token && !error) {
  // Still waiting for token from URL or showing initial error
  return <div className="text-center text-slate-600 dark:text-slate-400">Loading...</div>;
}

return (
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Only show form if token exists or there isn't a "no token" error */}
    {token && !error?.includes("No reset token found") && (
      <>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="newPassword-reset" className="text-slate-700 dark:text-slate-300">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password"
              id="newPassword-reset"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="confirmPassword-reset" className="text-slate-700 dark:text-slate-300">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password"
              id="confirmPassword-reset"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </>
    )}

    {error && (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className={`${fontHeading}`}>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {successMessage && (
      <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle className={`${fontHeading}`}>Success!</AlertTitle>
        <AlertDescription>{successMessage}</AlertDescription>
      </Alert>
    )}

    {/* Only show button if token exists and there's no success message yet */}
    {token && !successMessage && !error?.includes("No reset token found") && (
      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-base py-3 mt-2 rounded-lg shadow-md hover:shadow-indigo-500/30 dark:hover:shadow-indigo-400/30 transition-all duration-300 group"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Resetting Password...
          </>
        ) : (
          <>
            Set New Password <Save className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </>
        )}
      </Button>
    )}
  </form>
);
}


// Wrap the component that uses useSearchParams with Suspense
// This is good practice if the page itself is a Server Component.
export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading form...</div>}>
      <ResetPasswordFormComponent />
    </Suspense>
  );
}