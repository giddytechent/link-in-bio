// app/components/auth/signup-form.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Lock, User, UserPlus, Github, MessageCircle, AlertCircle, CheckCircle, LogInIcon } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Import Supabase client

const fontHeading = "font-manrope";

export function SignupForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient(); // Initialize Supabase client

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // --- Client-Side Validation ---
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      setIsLoading(false);
      return;
    }
    // --- End Client-Side Validation ---

    try {
      // --- Supabase Signup ---
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { // Optional: store additional user metadata (check Supabase docs for best practices)
            full_name: fullName,
            // You might need to configure your Supabase table `auth.users` and `public.profiles`
            // or use `user_metadata` for this.
          },
          // If email confirmation is enabled in Supabase, the user will get an email.
          // emailRedirectTo: `${window.location.origin}/auth/callback` // Or your dashboard/login page
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Signup failed. Please try again.");
      } else if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
            // This can happen if "Confirm email" is ON and you are trying to sign up a user that already exists
            // but is not confirmed yet. Supabase might send a new confirmation email.
            setSuccessMessage("A confirmation link has been sent to your email address. Please verify to continue.");
        } else if (data.session) {
            // User is signed up and logged in (if email confirmation is off or already confirmed)
            setSuccessMessage("Account created and logged in successfully! Redirecting...");
            // router.refresh() is important to update server component data if any depends on auth state
            router.refresh();
            router.push('/dashboard');
        } else {
             // User is signed up, but email confirmation is required
            setSuccessMessage("Account created! Please check your email to verify your account before logging in.");
            // Optionally redirect to login or a "check your email" page
             setTimeout(() => {
               router.push('/login');
             }, 3000);
        }
      } else {
        // Fallback, should ideally be covered by specific cases above
        setError("An unexpected issue occurred during signup.");
      }
    } catch (err: any) { // Catch any unexpected errors
      console.error("Unexpected signup error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // Your OAuth callback route
      },
    });
    if (socialError) {
      setError(socialError.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
    // If successful, Supabase handles the redirect to the provider and then back to your callback.
  };

  // --- JSX for the form remains largely the same ---
  // ... (ensure all input fields use the state variables: fullName, email, password, confirmPassword)
  // ... (ensure Checkbox uses agreedToTerms state)
  // ... (ensure Button disabled={isLoading} and shows loading state)
  // ... (Error and Success Alert components are the same)

  // Example modification for Social Login Buttons:
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (All your input fields: Full Name, Email, Password, Confirm Password, Terms) ... */}
        {/* Full Name Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="fullName-form" className="text-slate-700 dark:text-slate-300">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="text" id="fullName-form" placeholder="e.g., Alex Chen" value={fullName}
              onChange={(e) => setFullName(e.target.value)} required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email-form" className="text-slate-700 dark:text-slate-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="email" id="email-form" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="password-form" className="text-slate-700 dark:text-slate-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password" id="password-form" placeholder="Minimum 8 characters" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="confirmPassword-form" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password" id="confirmPassword-form" placeholder="••••••••" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="terms-form" checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
            disabled={isLoading}
            className="border-slate-400 dark:border-slate-600 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
          />
          <Label htmlFor="terms-form" className="text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
            I agree to FlowFolio's <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 underline">Terms of Service</Link> and <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 underline">Privacy Policy</Link>.
          </Label>
        </div>

        {/* Error Message Display */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Signup Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message Display */}
        {successMessage && (
          <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full ..." disabled={isLoading}>
          {/* ... loading state ... */}
          {isLoading ? 'Creating Account...' : <>Create Account <UserPlus className="ml-2 h-5 w-5 group-hover:animate-pulse" /></>}
        </Button>
      </form>

      <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-3">
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">OR CONTINUE WITH</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={() => handleSocialLogin('google')} variant="outline" className="w-full ..." disabled={isLoading}>
            <MessageCircle className="mr-2 h-4 w-4 text-red-500" /> Google
          </Button>
          <Button onClick={() => handleSocialLogin('github')} variant="outline" className="w-full ..." disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className={`font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 hover:underline group inline-flex items-center`}>
                Log In <LogInIcon className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform"/>
            </Link>
        </p>
      </div>
    </>
  );
}