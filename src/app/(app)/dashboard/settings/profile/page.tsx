// app/dashboard/settings/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileSettingsForm } from '../../../../../components/settings/profile-settings-form';
import { PasswordChangeForm } from '../../../../../components/settings/password-change-form';
import { AccountDeletionSection } from '../../../../../components/settings/account-deletion';
import { UserCircle2, ShieldCheck, AlertTriangleIcon } from 'lucide-react';


const fontHeading = "font-manrope";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=Please log in to access settings.');
  }

  // Fetch profile data from public.profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, username, bio, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows found (user might not have a profile yet)
    console.error("Error fetching profile for settings:", profileError);
    // Handle error, maybe show a message, but allow page to render for password change etc.
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-0.5">
        <h1 className={`text-2xl sm:text-3xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50 tracking-tight`}>
          Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage your account settings and profile information.
        </p>
      </div>
      <Separator className="my-6 bg-slate-200 dark:bg-slate-800" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Column 1: Navigation or just content for smaller settings pages */}
        <div className="lg:col-span-1 hidden lg:block">
          <nav className="space-y-1 sticky top-20"> {/* Sticky for desktop */}
            <a href="#profile" className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}>
              <UserCircle2 className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              Profile Information
            </a>
            <a href="#security" className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}>
              <ShieldCheck className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              Security
            </a>
            <a href="#account" className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}>
              <AlertTriangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              Account Management
            </a>
          </nav>
        </div>

        {/* Column 2: Settings Forms */}
        <div className="lg:col-span-2 space-y-8">
          <Card id="profile" className="bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/70 shadow-sm">
            <CardHeader>
              <CardTitle className={`${fontHeading} text-xl text-slate-900 dark:text-slate-100`}>Profile Information</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Update your personal details and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm user={user} profile={profile} />
            </CardContent>
          </Card>

          <Card id="security" className="bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/70 shadow-sm">
            <CardHeader>
              <CardTitle className={`${fontHeading} text-xl text-slate-900 dark:text-slate-100`}>Security</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Change your account password.</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>

          <Card id="account" className="border-red-300 dark:border-red-700/50 bg-red-50/30 dark:bg-red-900/20 shadow-sm">
            <CardHeader>
              <CardTitle className={`${fontHeading} text-xl text-red-700 dark:text-red-400`}>Account Management</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-500">Manage your account deletion preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountDeletionSection />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
