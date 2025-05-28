// app/components/dashboard/settings/account-deletion.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const fontHeading = "font-manrope";

export function AccountDeletionSection() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setError(null);
    startTransition(async () => {
      // IMPORTANT: Deleting a user is a sensitive operation.
      // Supabase does not have a direct `supabase.auth.deleteUser()` client-side method
      // for security reasons (users shouldn't be able to delete themselves easily without re-auth or server-side checks).
      // This typically requires a Supabase Edge Function or a custom backend API route
      // that uses the Supabase Admin Client (with service_role key) to perform the deletion.
      // The function would verify the user's identity (e.g., by requiring current password)
      // and then delete related data before deleting the auth user.

      // For this example, we'll simulate the call and error/success.
      // In a real app, this would call your secure backend endpoint.
      // e.g., const response = await fetch('/api/user/delete-account', { method: 'POST' });
      // if (!response.ok) { throw new Error("Failed to delete account"); }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // --- THIS IS WHERE YOU'D CALL YOUR SECURE BACKEND ENDPOINT ---
      // Example of what the backend function MIGHT do (using Supabase Admin SDK):
      // const { data: { user } } = await supabase.auth.getUser(); // Get current user on server
      // if (user) {
      //   // 1. Delete related data (profiles, projects, etc.)
      //   // await supabaseAdmin.from('projects').delete().eq('user_id', user.id);
      //   // await supabaseAdmin.from('profiles').delete().eq('id', user.id);
      //   // 2. Delete the auth user
      //   // const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      //   // if (deleteError) throw deleteError;
      // } else {
      //   throw new Error("User not found or not authenticated for deletion.");
      // }

      // Simulate success for now
      console.log("Account deletion initiated (simulated).");
      await supabase.auth.signOut(); // Sign out the user locally
      router.refresh();
      router.push('/?message=account-deleted'); // Redirect to homepage with a message
      setIsDialogOpen(false);

      // Simulate error
      // setError("Simulated error: Could not delete account. Please contact support.");
      // setIsDialogOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${fontHeading} text-red-600 dark:text-red-400`}>Delete Account</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Permanently delete your account and all associated data. This action is irreversible.
        Please be absolutely sure before proceeding.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className={`${fontHeading}`}>Deletion Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className={`${fontHeading} flex items-center`}>
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              This action cannot be undone. This will permanently delete your FlowFolio account,
              all your link pages, websites, and associated data.
              <br /><br />
              To confirm, please understand that this is final.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Yes, Delete My Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
