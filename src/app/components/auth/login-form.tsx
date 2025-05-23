// app/components/auth/login-form.tsx
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

const fontHeading = "font-manrope"; // Consistent with page

export function LoginForm() {
  const router = useRouter();
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
    setSuccessMessage(null);

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
      const response = await fetch('/api/auth/login', { // Your backend login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please check your credentials.");
      } else {
        // Login successful, backend should have set a session cookie
        setSuccessMessage(data.message || "Login successful! Redirecting...");
        // Redirect to dashboard. Backend might specify redirectUrl or frontend knows it.
        // In a real app with NextAuth.js, the session update might trigger redirect automatically.
        router.push(data.redirectUrl || '/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to the server. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email-login" className="text-slate-700 dark:text-slate-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="email"
              id="email-login"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="password-login" className="text-slate-700 dark:text-slate-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password"
              id="password-login"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me-login"
              checked={rememberMe}
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

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && ( // Optional: usually redirect is fast enough
          <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

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
              Logging In...
            </>
          ) : (
            <>
              Log In <LogInIcon className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Social Login Buttons */}
      <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-3">
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">OR LOG IN WITH</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300" disabled={isLoading}>
            <MessageCircle className="mr-2 h-4 w-4 text-red-500" /> {/* Placeholder */}
            Google
          </Button>
          <Button variant="outline" className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300" disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div>
    </>
  );
}