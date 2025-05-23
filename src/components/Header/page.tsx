import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button';
import { Sun, Moon, ArrowRight } from 'lucide-react'
import { MenuIcon } from 'lucide-react'


const fontHeading = "font-manrope";

export default function header() {
    return (

        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-lg transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <Link href="/" className={`text-2xl font-bold ${fontHeading} text-indigo-600 dark:text-indigo-400 transition-colors duration-300`}>
                        FlowFolio
                    </Link>
                    <nav className="hidden md:flex items-center space-x-5 lg:space-x-7">
                        {['Home', 'Features', 'Showcase', 'Pricing'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 relative group"
                            >
                                {item}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center space-x-3">
                        {/* Dark/Light Mode Toggle Placeholder */}
                        {/*
            DARK/LIGHT MODE TOGGLE NOTE:
            This button is a placeholder. To make it functional:
            1. Use a theme provider like `next-themes`. Wrap your root layout with it.
            2. Create a client component ('use client';) for this button.
            3. In the client component, use `useTheme` from `next-themes` to get `theme` and `setTheme`.
            4. Toggle between 'light', 'dark', and 'system' themes.
            The `dark:` variants in Tailwind CSS will then apply automatically.
          */}
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Toggle theme"
                            className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-300"
                        // onClick would be handled in a client component
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>

                        <Link href="/signup" passHref>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-indigo-500/30 dark:hover:shadow-indigo-400/30 transition-all duration-300 group">
                                Get Started <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                            <MenuIcon className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>

    )
}
