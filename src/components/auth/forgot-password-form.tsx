// app/components/auth/forgot-password-form.tsx
'use client';

import React, { useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { z } from 'zod';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import {
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const fontHeading = "font-manrope"; // Consistent with page

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function ForgotPasswordForm() {
  
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formError, setFormError] = useState<string | null>(null); // For Zod field error
  const [serverMessage, setServerMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setServerMessage(null);

    const validationResult = ForgotPasswordSchema.safeParse({ email });

    if (!validationResult.success) {
      setFormError(validationResult.error.format().email?._errors[0] || "Invalid email format.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        validationResult.data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`, // Your reset password page URL
        }
      );

      if (resetError) {
        // Supabase often returns a generic error here for security, or you might get network errors
        console.error("Supabase resetPasswordForEmail error:", resetError);
        setServerMessage({type: 'error', text: "Failed to send reset link. Please ensure the email is correct or try again later."});
        // For security, Supabase might not explicitly say "email not found".
        // The generic success message is often preferred.
        // So, for a better UX you might still want to show the generic success message:
        // setServerMessage({type: 'success', text: "If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder)."});
      } else {
        setServerMessage({type: 'success', text: "If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder)."});
        setEmail(''); // Clear email field
      }
    } catch (err: any) {
      console.error("Unexpected forgot password error:", err);
      setServerMessage({type: 'error', text: "An unexpected error occurred. Please check your internet connection."});
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
          <Input type="email" id="email-forgot" name="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className={`pl-10 ${formError ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
            disabled={isLoading}
          />
        </div>
        {formError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formError}</p>}
      </div>

      {serverMessage && (
        <Alert variant={serverMessage.type === 'error' ? 'destructive' : 'default'} className={`mt-4 ${serverMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' : ''}`}>
          {serverMessage.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertTitle className={`${fontHeading}`}>{serverMessage.type === 'error' ? 'Request Failed' : 'Check Your Email'}</AlertTitle>
          <AlertDescription>{serverMessage.text}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full ..." disabled={isLoading}>
        {isLoading ? ( /* ... loading SVG ... */ 'Sending...') : <>Send Reset Link <Send className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>}
      </Button>
    </form>
  );
}