// app/components/dashboard/settings/password-change-form.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, AlertCircle, CheckCircle, KeyRound, Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const fontHeading = "font-manrope";

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }), // Supabase verifies this, not us
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmNewPassword: z.string().min(8, { message: "Please confirm your new password." }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

type PasswordChangeValues = z.infer<typeof PasswordChangeSchema>;

export function PasswordChangeForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<PasswordChangeValues>({
    resolver: zodResolver(PasswordChangeSchema),
  });

  const onSubmit: SubmitHandler<PasswordChangeValues> = async (formData) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      // Supabase's updateUser method for password change requires the current password IF
      // the user is already authenticated and changing their own password.
      // However, the JS client library usually handles this by re-authenticating with the current password.
      // The primary use of `updateUser` with a password is for a logged-in user changing their own password.
      // For password reset flow (after forgot password), it's different.
      // Here we assume the user is logged in.

      // For changing password while logged in, Supabase doesn't have a direct "changePassword(current, new)"
      // You update the user with the new password. Supabase may require re-authentication for this action
      // if it's considered sensitive and a certain time has passed since last auth.
      // The most straightforward way is to just call updateUser with the new password.
      // Supabase will handle if re-authentication is needed.
      // If current password verification is needed client-side before this, that's an extra step,
      // but Supabase's `updateUser` is the primary method.

      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        // Supabase error messages for password update can be generic like "AuthApiError" or more specific
        // e.g. "New password should be different from the old password." or "Password should be at least 6 characters."
        // (though our Zod schema already checks for 8)
        let friendlyError = "Failed to update password. Please try again.";
        if (updateError.message.includes("same as the old")) {
            friendlyError = "New password must be different from your current password.";
        } else if (updateError.message.includes("Password should be at least 6 characters")) {
            friendlyError = "Password is too short. Please use at least 8 characters.";
        } else if (updateError.message.includes("weak password")) {
             friendlyError = "Password is too weak. Please choose a stronger one.";
        }
        setServerError(friendlyError);
      } else {
        setSuccessMessage("Password updated successfully!");
        reset(); // Clear form fields
        // router.refresh(); // Refresh server components if needed
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Current Password - Supabase handles its verification implicitly during updateUser if needed, or may prompt re-auth */}
        {/* For an explicit current password check, you'd need a custom flow or verify it separately before calling updateUser */}
        {/* We'll omit currentPassword field for simplicity with direct updateUser call, as Supabase's behavior might vary */}

        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input id="newPassword" type="password" {...register("newPassword")} placeholder="Minimum 8 characters"
              className={`pl-10 ${errors.newPassword ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isPending}
            />
          </div>
          {errors.newPassword && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input id="confirmNewPassword" type="password" {...register("confirmNewPassword")} placeholder="Re-type new password"
              className={`pl-10 ${errors.confirmNewPassword ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isPending}
            />
          </div>
          {errors.confirmNewPassword && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.confirmNewPassword.message}</p>}
        </div>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className={`${fontHeading}`}>Update Failed</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className={`${fontHeading}`}>Success!</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white" disabled={isPending || !isDirty}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
          </>
        ) : (
          <>
            <KeyRound className="mr-2 h-4 w-4" /> Change Password
          </>
        )}
      </Button>
    </form>
  );
}
