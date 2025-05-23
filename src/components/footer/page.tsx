import React from 'react'
import Link from 'next/link'

const fontHeading = "font-manrope";

export default function Footer() {

    const currentTime = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Africa/Lagos', // WAT is Africa/Lagos
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Africa/Lagos',
    });


    return (
        <footer className="py-12 md:py-16 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300" >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 text-sm">
                    <div className="lg:col-span-2 mb-6 lg:mb-0">
                        <Link href="/" className={`text-xl ${fontHeading} font-bold text-indigo-600 dark:text-indigo-400 mb-2 inline-block`}>
                            FlowFolio
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed pr-4">
                            The modern way to build your link-in-bio and website. Empowering creators and businesses worldwide.
                        </p>
                    </div>
                    <div>
                        <h4 className={`${fontHeading} font-semibold text-slate-700 dark:text-slate-200 mb-3`}>Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="#features" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/templates" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Templates</Link></li>
                            <li><Link href="/changelog" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Changelog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className={`${fontHeading} font-semibold text-slate-700 dark:text-slate-200 mb-3`}>Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className={`${fontHeading} font-semibold text-slate-700 dark:text-slate-200 mb-3`}>Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                    <p>&copy; {new Date().getFullYear()} FlowFolio Inc. All rights reserved.</p>
                    <p className="mt-1">Lagos, Nigeria. Current time: {currentTime} WAT, {currentDate}.</p>
                </div>
            </div>
        </footer >

    )
}
