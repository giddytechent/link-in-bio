// app/components/dashboard/settings/profile-settings-form.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, Edit2, AlertCircle, CheckCircle, UploadCloud, Loader2, Save } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const fontHeading = "font-manrope";

const ProfileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(100).trim(),
  username: z.string().min(3, "Username must be at least 3 characters.").max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.").trim().optional().or(z.literal('')),
  bio: z.string().max(250, "Bio cannot exceed 250 characters.").optional().or(z.literal('')),
  avatarFile: z.instanceof(FileList).optional(), // For file upload
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

interface ProfileSettingsFormProps {
  user: SupabaseUser | null;
  profile: {
    full_name?: string | null;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function ProfileSettingsForm({ user, profile }: ProfileSettingsFormProps) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

  const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      fullName: profile?.full_name || user?.user_metadata?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
    },
  });

  const avatarFileWatch = watch("avatarFile");

  useEffect(() => {
    if (avatarFileWatch && avatarFileWatch.length > 0) {
      const file = avatarFileWatch[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!avatarFileWatch || avatarFileWatch.length === 0) {
        // If file is removed or initially empty, revert to original or default
        setAvatarPreview(profile?.avatar_url || null);
    }
  }, [avatarFileWatch, profile?.avatar_url]);


  const onSubmit: SubmitHandler<ProfileFormValues> = async (formData) => {
    if (!user) {
      setServerError("User not authenticated.");
      return;
    }

    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      let avatarPublicUrl = profile?.avatar_url; // Keep existing avatar if no new one is uploaded

      // 1. Handle Avatar Upload if a new file is selected
      if (formData.avatarFile && formData.avatarFile.length > 0) {
        const file = formData.avatarFile[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars') // Ensure you have an 'avatars' bucket in Supabase Storage
          .upload(filePath, file, { upsert: true }); // upsert: true to overwrite if exists

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          setServerError(`Failed to upload avatar: ${uploadError.message}`);
          return;
        }
        
        // Get public URL of the uploaded avatar
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarPublicUrl = urlData?.publicUrl;
      }

      // 2. Update user metadata in auth.users (e.g., full_name if you store it there)
      // And/Or update public.profiles table
      const profileUpdateData: {
        full_name?: string;
        username?: string;
        bio?: string;
        avatar_url?: string;
        updated_at: string;
      } = {
        full_name: formData.fullName,
        username: formData.username || undefined, // Store as undefined if empty
        bio: formData.bio || undefined, // Store as undefined if empty
        updated_at: new Date().toISOString(),
      };
      if (avatarPublicUrl !== undefined && avatarPublicUrl !== null) { // Only update avatar_url if it is a string
        profileUpdateData.avatar_url = avatarPublicUrl;
      }


      // Update public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        setServerError(`Failed to update profile: ${profileError.message}`);
        return;
      }

      // Optionally update auth.users.user_metadata if you store full_name there and want it synced
      // This is often useful for display purposes in Supabase's own UI or if other services read from it.
      const { data: userUpdateData, error: userAuthError } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName, avatar_url: avatarPublicUrl } // Supabase Auth user_metadata
      });

      if (userAuthError) {
          console.warn("Auth user metadata update error (might be minor):", userAuthError);
          // Not necessarily a fatal error for profile update, but good to log
      }


      setSuccessMessage("Profile updated successfully!");
      setValue("avatarFile", undefined); // Clear the file input after successful upload
      router.refresh(); // Refresh server components to reflect changes
    });
  };

  const userInitial = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0,2)
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24 ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500">
          <AvatarImage src={avatarPreview || undefined} alt={profile?.full_name || user?.email || "User avatar"} />
          <AvatarFallback className="text-3xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="relative group">
            <Label
                htmlFor="avatarFile"
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
                <UploadCloud className="mr-2 h-4 w-4" />
                Change Avatar
            </Label>
            <Input
                id="avatarFile"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="sr-only" // Hide the default file input
                {...register("avatarFile")}
                disabled={isPending}
            />
        </div>
        {errors.avatarFile && <p className="text-xs text-red-600 dark:text-red-400">{errors.avatarFile.message}</p>}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input id="fullName" {...register("fullName")} placeholder="Your full name"
              className={`pl-10 ${errors.fullName ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isPending}
            />
          </div>
          {errors.fullName && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Username (Optional)</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">@</span>
            <Input id="username" {...register("username")} placeholder="your_username"
              className={`pl-7 ${errors.username ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
              disabled={isPending}
            />
          </div>
          {errors.username && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300">Bio (Optional)</Label>
          <Textarea id="bio" {...register("bio")} placeholder="Tell us a little about yourself..." rows={3}
            className={`mt-1 ${errors.bio ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50 resize-none`}
            disabled={isPending}
          />
          {errors.bio && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.bio.message}</p>}
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
