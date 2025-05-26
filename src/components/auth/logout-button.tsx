
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button'; // Import only Button, since ButtonProps does not exist
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu'; // To be used within a dropdown
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  asDropdownItem?: boolean; // To render as a DropdownMenuItem or a regular Button
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  asDropdownItem = false,
  className,
  children,
  ...props // Capture other props if not a dropdown item
}: LogoutButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // You might want an error state if logout can fail in a noticeable way,
  // but usually, it's pretty reliable or fails silently on the client.

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error.message);
      // Optionally, display an error to the user (e.g., using a toast notification)
      // For now, we'll just log it.
      setIsLoading(false);
    } else {
      // Supabase client clears local session.
      // Refresh server components and redirect.
      router.refresh(); // Ensures server knows user is logged out
      router.push('/login'); // Redirect to login page or homepage
    }
    // setIsLoading(false); // Might not be reached if redirect happens fast
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {children || 'Log out'}
    </>
  );

  if (asDropdownItem) {
    return (
      <DropdownMenuItem
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/50 focus:!bg-red-50 dark:focus:!bg-red-900/50 cursor-pointer ${className}`}
      >
        {buttonContent}
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}