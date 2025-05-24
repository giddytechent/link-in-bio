// app/login/page.tsx
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// Separator is used in LoginForm, so it's fine if not directly here
import {
  Briefcase, // Placeholder for a generic brand icon
  UserPlus, // For "Don't have an account?"
} from 'lucide-react';
import { LoginForm } from '../../components/auth/login-form'; // Import the client component

const fontHeading = "font-manrope";
const fontBody = "font-inter";

export default async function LoginPage() {
  const currentYear = new Date().getFullYear();
  const currentTime = "9:12 PM WAT"; // From current context
  const currentDate = "Friday, May 23, 2025"; // From current context
  const userLocation = "Abuja, Federal Capital Territory, Nigeria"; // From current context

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 ${fontBody} selection:bg-indigo-500 selection:text-white`}>
      {/* Subtle background gradient shapes - consistent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-indigo-200/30 dark:from-indigo-800/20 to-transparent rounded-full filter blur-3xl opacity-50 dark:opacity-30 animate-[pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-amber-200/30 dark:from-amber-700/20 to-transparent rounded-full filter blur-3xl opacity-50 dark:opacity-30 animate-[pulse_12s_cubic-bezier(0.4,0,0.6,1)_infinite_2s]"></div>
      </div>

      <div className="w-full max-w-md space-y-4 z-10">
        <div className="text-center">
          <Link href="/" className={`inline-flex items-center gap-2 text-3xl ${fontHeading} font-bold text-indigo-600 dark:text-indigo-400`}>
            <Briefcase className="h-8 w-8" /> {/* Replace with your actual logo icon */}
            FlowFolio
          </Link>
        </div>

        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xl border-slate-200 dark:border-slate-800/70">
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50`}>
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Log in to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Use the Client Component for the form and its logic */}
            <LoginForm />
          </CardContent>
          <CardFooter className="justify-center pt-4 pb-6">
            
          </CardFooter>
        </Card>
      </div>

      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8 z-10">
        <p>&copy; {currentYear} FlowFolio Inc. All rights reserved.</p>
        <p>{userLocation}. Page accessed: {currentDate}, {currentTime}.</p>
      </footer>
    </div>
  );
}