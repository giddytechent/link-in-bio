// app/dashboard/create/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Your server client utility
import { CreateProjectForm } from '../../../../components/dashboard/create-project-form'; // We'll create this next
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const fontHeading = "font-manrope";
const fontBody = "font-inter"; // Apply to body in layout

export default async function CreateProjectPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const params = new URLSearchParams();
    params.set('message', 'Please log in to create a new project.');
    params.set('type', 'info');
    return redirect(`/login?${params.toString()}`);
  }

  // You could pass user.id to CreateProjectForm if it needs it directly,
  // but Supabase client in the form can also get the current user if needed for default values.

  return (
    <div className={`flex flex-col items-center justify-start min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 ${fontBody}`}>
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800/70">
          <CardHeader>
            <CardTitle className={`text-2xl sm:text-3xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50`}>
              Create a New Project
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Choose a project type and give it a name to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateProjectForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
       <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <p>&copy; {new Date().getFullYear()} FlowFolio Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}