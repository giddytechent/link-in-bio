// app/components/auth/forgot-password-form.tsx
'use client';

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Not strictly needed here unless redirecting after submission
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const fontHeading = "font-manrope"; // Consistent with page

export function ForgotPasswordForm() {
  // const router = useRouter(); // If you need to redirect
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', { // Your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Even for errors, sometimes a generic message is better for security
        // to avoid confirming if an email is registered.
        // However, for dev, specific messages can be useful.
        setError(data.message || "Failed to send reset link. Please try again.");
        // For production, you might always show a generic success message here:
        // setSuccessMessage("If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).");
      } else {
        setSuccessMessage(data.message || "If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).");
        setEmail(''); // Clear email field on success
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("An unexpected error occurred. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email-forgot" className="text-slate-700 dark:text-slate-300">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="email"
            id="email-forgot"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && !successMessage && ( // Only show error if no success message
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className={`${fontHeading}`}>Request Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className={`${fontHeading}`}>Check Your Email</AlertTitle>
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
            Sending...
          </>
        ) : (
          <>
            Send Reset Link <Send className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
}