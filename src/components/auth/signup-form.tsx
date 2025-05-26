// app/components/auth/signup-form.tsx
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
import { Mail, Lock, User, UserPlus, Github, MessageCircle, AlertCircle, CheckCircle, LogInIcon } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { z } from 'zod'; // Import Zod

const fontHeading = "font-manrope";

// Zod Schema for Signup Validation
const SignupFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).trim(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms of Service and Privacy Policy." }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Path of error
});

export function SignupForm() {
  const router = useRouter();

  const supabase = getSupabaseBrowserClient();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodFormattedError<typeof SignupFormSchema._input> | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({ ...prev, agreedToTerms: Boolean(checked) }));
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setServerError(null);
    setSuccessMessage(null);

    const validationResult = SignupFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    const { email, password, fullName } = validationResult.data;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
          // emailRedirectTo: `${window.location.origin}/auth/callback` // If email confirm is ON
        },
      });

      if (signUpError) {
        let displayError = "Signup failed. Please try again.";
        if (signUpError.message.includes("User already registered")) {
          displayError = "This email is already registered. Try logging in or use a different email.";
        } else if (signUpError.message.includes("rate limit exceeded")) {
          displayError = "Too many signup attempts. Please try again later.";
        }
        setServerError(signUpError.message || "Signup failed. Please try again.");
      } else if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setSuccessMessage("A confirmation link has been sent to your email address. Please verify to continue.");
        } else if (data.session) {
          setSuccessMessage("Account created and logged in successfully! Redirecting...");
          router.refresh();
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          setSuccessMessage("Account created! Please check your email to verify your account before logging in.");
          setTimeout(() => router.push('/login'), 2000);
        }
      } else {
        setServerError("An unexpected issue occurred during signup.");
      }
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      setServerError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX for the form ---
  // Update input fields to use formData and handleChange
  // Display Zod errors next to each field or in a summary
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input type="text" id="fullName" name="fullName" placeholder="e.g., Alex Chen"
              value={formData.fullName} onChange={handleChange} required
              className={`pl-10 ${formErrors?.fullName ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isLoading}
            />
          </div>
          {formErrors?.fullName?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.fullName._errors[0]}</p>}
        </div>

        {/* Email */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input type="email" id="email" name="email" placeholder="you@example.com"
              value={formData.email} onChange={handleChange} required
              className={`pl-10 ${formErrors?.email ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isLoading}
            />
          </div>
          {formErrors?.email?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.email._errors[0]}</p>}
        </div>

        {/* Password */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input type="password" id="password" name="password" placeholder="Minimum 8 characters"
              value={formData.password} onChange={handleChange} required
              className={`pl-10 ${formErrors?.password ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isLoading}
            />
          </div>
          {formErrors?.password?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.password._errors[0]}</p>}
        </div>

        {/* Confirm Password */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••"
              value={formData.confirmPassword} onChange={handleChange} required
              className={`pl-10 ${formErrors?.confirmPassword ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isLoading}
            />
          </div>
          {formErrors?.confirmPassword?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.confirmPassword._errors[0]}</p>}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-2 pt-2"> {/* Changed to items-start for better alignment if error message is long */}
          <Checkbox
            id="agreedToTerms" name="agreedToTerms" checked={formData.agreedToTerms}
            onCheckedChange={handleCheckboxChange}
            disabled={isLoading}
            className={`mt-0.5 ${formErrors?.agreedToTerms ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-400 dark:border-slate-600'} data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500`}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="agreedToTerms" className="text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
              I agree to FlowFolio's <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 underline">Terms of Service</Link> and <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 underline">Privacy Policy</Link>.
            </Label>
            {formErrors?.agreedToTerms?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400">{formErrors.agreedToTerms._errors[0]}</p>}
          </div>
        </div>

        {/* Server Error / Success Message Display */}
        {serverError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Signup Failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading}`}>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full ..." disabled={isLoading}>
          {isLoading ? ( /* ... loading SVG ... */ 'Creating Account...') : <>Create Account <UserPlus className="ml-2 h-5 w-5 group-hover:animate-pulse" /></>}
        </Button>
      </form>

      {/* ... (Social Login Buttons and Link to Login - ensure they also use `disabled={isLoading}`) ... */}
      <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-3">
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">OR CONTINUE WITH</p>
        {/* ... Social login buttons ... ensure they are also disabled={isLoading} */}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link href={isLoading ? "#" : "/login"} className={`font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 hover:underline group inline-flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Log In <LogInIcon className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </div>
    </>
  );
}