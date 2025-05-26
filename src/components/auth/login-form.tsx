// app/components/auth/login-form.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import {
  Mail,
  Lock,
  LogInIcon,
  Github,
  MessageCircle, // Placeholder for Google Icon
  AlertCircle,
  CheckCircle,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const fontHeading = "font-manrope"; // Consistent with page

export function LoginForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Optional for login

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // Handle different types of Supabase auth errors
        if (signInError.message === "Invalid login credentials") {
          setError("Invalid email or password. Please try again.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before logging in. Check your inbox for a confirmation link.");
        }
        else {
          setError(signInError.message || "Login failed. Please try again.");
        }
      } else if (data.session && data.user) {
        // Login successful! Supabase client handles session and cookies.
        // You usually don't need to manually store the session token in the client.
        console.log("Login successful, session:", data.session);
        console.log("User:", data.user);

        // router.refresh() is important to re-fetch server components
        // that might depend on the user's authentication state.
        router.refresh();

        // Redirect to the dashboard or intended page
        router.push('/dashboard');
      } else {
        // This case should ideally not be reached if signInError is null and session is also null,
        // but good for defensive programming.
        setError("An unexpected issue occurred during login. No session data received.");
      }
    } catch (err: any) { // Catch any unexpected errors during the async operation
      console.error("Unexpected login error:", err);
      setError(err.message || "An unexpected error occurred. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email-login" className="text-slate-700 dark:text-slate-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="email" id="email-login" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="password-login" className="text-slate-700 dark:text-slate-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password" id="password-login" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me-login" checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              disabled={isLoading}
              className="border-slate-400 dark:border-slate-600 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
            />
            <Label htmlFor="remember-me-login" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className={`text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 hover:underline inline-flex items-center`}>
            <KeyRound className="mr-1 h-3 w-3" /> Forgot password?
          </Link>
        </div>

        {/* Error Message Display */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Success message is less common for login, direct redirect is usual */}

        {/* Submit Button */}
        <Button type="submit" className="w-full ..." disabled={isLoading}>
          {isLoading ? ( /* ... loading SVG ... */ 'Logging In...') : ( <> Log In <LogInIcon className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" /> </>)}
        </Button>
      </form>

      {/* Social Login Buttons (to be updated to use supabase.auth.signInWithOAuth) */}
      <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-3">
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">OR LOG IN WITH</p>
        {/* Social login buttons here would call handleSocialLogin as in SignupForm */}
      </div>
      <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link href="/signup" className={`font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 hover:underline group inline-flex items-center`}>
                  Sign Up <UserPlus className="ml-1 h-4 w-4 group-hover:animate-bounceOnce" />
              </Link>
          </p>
      </div>
    </>
  );
}