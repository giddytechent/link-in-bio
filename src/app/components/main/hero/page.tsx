import React from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Sparkles } from 'lucide-react'

const fontHeading = "font-manrope";

export default function Hero() {
    return (
        <section id="home" className="relative py-24 md:py-40 min-h-[calc(100vh-5rem)] flex items-center bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
            {/* Subtle gradient background shapes */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-indigo-200/50 dark:from-indigo-700/30 to-transparent rounded-full filter blur-3xl opacity-60 dark:opacity-40 animate-[pulse_8s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-amber-200/40 dark:from-amber-600/20 to-transparent rounded-full filter blur-3xl opacity-50 dark:opacity-30 animate-[pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite_2s]"></div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                {/* Initial load animation example for hero content */}
                <div className="animate-fadeInUpBasic">
                    <h1 className={`text-5xl sm:text-6xl lg:text-7xl ${fontHeading} font-extrabold text-slate-900 dark:text-slate-50 leading-tight tracking-tight`}>
                        Craft Your <span className="text-indigo-600 dark:text-indigo-400">Digital Story</span>,
                        <br />
                        Beautifully.
                    </h1>
                    <p className="mt-6 md:mt-8 max-w-lg md:max-w-xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        FlowFolio is the all-in-one platform for creators and businesses to build stunning link-in-bio pages and scalable websites with an intuitive drag-and-drop editor.
                    </p>
                    <div className="mt-10 md:mt-12 flex flex-col sm:flex-row justify-center items-center gap-5">
                        <Link href="/builder" passHref>
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-base ${fontHeading} font-semibold rounded-xl shadow-xl hover:shadow-indigo-500/40 dark:hover:shadow-indigo-400/40 transition-all duration-300 transform hover:scale-105 px-10 py-4 group">
                                Start Building <Sparkles className="ml-2 h-5 w-5 text-amber-300 group-hover:animate-pingOnce" />
                            </Button>
                        </Link>
                        <Link href="#features" passHref>
                            <Button size="lg" variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-500/50 dark:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl px-10 py-4 text-base ${fontHeading} font-semibold transition-colors duration-300">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>

    )
}
