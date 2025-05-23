import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link2Icon, LayoutTemplate, Palette } from "lucide-react";

const textAccentClass = "text-stone-600 dark:text-stone-400";

export default function problemSolution() {
    return (
        <section id="why-flowpage" className="py-16 md:py-24 bg-stone-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
                        Tired of Tool Sprawl? <span className="block sm:inline">Simplify Your Online Presence.</span>
                    </h2>
                    <p className="mt-4 text-lg text-stone-700 max-w-2xl mx-auto">
                        FlowPage offers one unified platform to manage and grow your digital footprint.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                    <Card className="text-center p-2 hover:shadow-xl transition-shadow bg-white border-stone-200">
                        <CardHeader className="items-center"> {/* Centering content in CardHeader */}
                            <Link2Icon className={`w-12 h-12 ${textAccentClass} mx-auto mb-3`} />
                            <CardTitle className="text-xl font-semibold text-stone-800">One Bio Link, Perfected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-stone-600">
                                Effortlessly manage all your important links from one beautiful, mobile-first page. Quick setup, instant updates.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-2 hover:shadow-xl transition-shadow bg-white border-stone-200">
                        <CardHeader className="items-center">
                            <LayoutTemplate className={`w-12 h-12 ${textAccentClass} mx-auto mb-3`} />
                            <CardTitle className="text-xl font-semibold text-stone-800">Expand When You're Ready</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-stone-600">
                                Seamlessly transition to build stunning landing pages or micro-sites with our intuitive drag-and-drop editor.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-2 hover:shadow-xl transition-shadow bg-white border-stone-200">
                        <CardHeader className="items-center">
                            <Palette className={`w-12 h-12 ${textAccentClass} mx-auto mb-3`} />
                            <CardTitle className="text-xl font-semibold text-stone-800">Focused, Powerful Control</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-stone-600">
                                Advanced design tools and analytics give you full command over your brand's online expression. All in one place.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
