// app/components/theme-toggle-button.tsx
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Optional: if you want a dropdown

export function ThemeToggleButton() {
  const { setTheme, theme, resolvedTheme } = useTheme(); // resolvedTheme gives 'light' or 'dark' even if theme is 'system'

  // Or a simpler toggle if you don't want system preference explicitly:
  // const handleToggle = () => {
  //   setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  // };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-300">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    // Alternative: Simple Toggle Button
    // <Button
    //   variant="ghost"
    //   size="icon"
    //   aria-label="Toggle theme"
    //   className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-300"
    //   onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    // >
    //   {resolvedTheme === 'dark' ? (
    //     <Sun className="h-5 w-5" />
    //   ) : (
    //     <Moon className="h-5 w-5" />
    //   )}
    //   <span className="sr-only">Toggle theme</span>
    // </Button>
  );
}