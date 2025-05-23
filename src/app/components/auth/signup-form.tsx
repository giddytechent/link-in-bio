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
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Github,
  MessageCircle, // Placeholder for Google Icon
  AlertCircle,
  CheckCircle, // For success message
  LogInIcon,
} from 'lucide-react';

const fontHeading = "font-manrope"; // Consistent with page

export function SignupForm() {
  const router = useRouter();
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

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed. Please try again.");
      } else {
        setSuccessMessage(data.message || "Account created successfully! Redirecting to login...");
        // Redirect after a short delay to allow user to see success message
        setTimeout(() => {
          router.push(data.redirectUrl || '/login');
        }, 2000);
      }
    } catch (err) {
      console.error("Signup submission error:", err);
      setError("An unexpected error occurred. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="fullName-form" className="text-slate-700 dark:text-slate-300">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              id="fullName-form"
              placeholder="e.g., Alex Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email-form" className="text-slate-700 dark:text-slate-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="email"
              id="email-form"
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
          <Label htmlFor="password-form" className="text-slate-700 dark:text-slate-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password"
              id="password-form"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="confirmPassword-form" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              type="password"
              id="confirmPassword-form"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="terms-form"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
            disabled={isLoading}
            className="border-slate-400 dark:border-slate-600 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
          />
          <Label htmlFor="terms-form" className="text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
            I agree to FlowFolio's <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 underline">Terms of Service</Link> and <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 underline">Privacy Policy</Link>.
          </Label>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Signup Failed</AlertTitle>
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
              Creating Account...
            </>
          ) : (
            <>
              Create Account <UserPlus className="ml-2 h-5 w-5 group-hover:animate-pulse" />
            </>
          )}
        </Button>
      </form>

      {/* Social Login Buttons (functionality to be added separately) */}
      <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-3">
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">OR CONTINUE WITH</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300" disabled={isLoading}>
            <MessageCircle className="mr-2 h-4 w-4 text-red-500" /> {/* Placeholder for Google Icon */}
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