import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit3, LayoutTemplate, CheckCircle, Sparkles, Briefcase, Brush } from "lucide-react";


const scrollAnimationClass = "opacity-0 translate-y-8 transition-all duration-700 ease-out";
const fontHeading = "font-manrope";
const textAccentClass = "text-stone-600 dark:text-stone-400";



export default function Feature() {
  return (
    <>
      <section id="features" className="py-16 md:py-24 bg-stone-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900">Everything You Need, Nothing You Don't.</h2>
              <p className="mt-4 text-lg text-stone-700 max-w-2xl mx-auto">
                Discover the core features that make FlowPage the perfect all-in-one online presence tool.
              </p>
            </div>
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-12 md:mb-16">
              <div className="md:w-1/2">
                <Edit3 className={`w-8 h-8 ${textAccentClass} mb-2`} />
                <h3 className="text-2xl font-semibold text-stone-800 mb-3">Intuitive Link & Page Editor</h3>
                <p className="text-stone-700 mb-4">
                  Add, organize, and customize links in seconds. Transition smoothly to our powerful drag-and-drop editor
                  to build custom page layouts with rich content blocks.
                </p>
                <ul className="space-y-2 text-stone-700">
                  <li className="flex items-center"><CheckCircle className={`w-5 h-5 ${textAccentClass} mr-2 flex-shrink-0`} /> Simple link management</li>
                  <li className="flex items-center"><CheckCircle className={`w-5 h-5 ${textAccentClass} mr-2 flex-shrink-0`} /> Drag & drop page building</li>
                  <li className="flex items-center"><CheckCircle className={`w-5 h-5 ${textAccentClass} mr-2 flex-shrink-0`} /> Responsive design out-of-the-box</li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-white p-4 rounded-lg shadow-lg border border-stone-200 aspect-video">
                 <p className="text-stone-400 text-center flex items-center justify-center h-full">
                  [Visual Placeholder: GIF/Video of editor - showing simple link adding, then transitioning to drag-drop page building with stone palette]
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <LayoutTemplate className={`w-8 h-8 ${textAccentClass} mb-2`} />
                <h3 className="text-2xl font-semibold text-stone-800 mb-3">Beautiful & Flexible Templates</h3>
                <p className="text-stone-700 mb-4">
                  Start with professionally designed, minimalist templates for both link pages and full landing pages.
                  Fully customizable to match your brand.
                </p>
                <ul className="space-y-2 text-stone-700">
                  <li className="flex items-center"><CheckCircle className={`w-5 h-5 ${textAccentClass} mr-2 flex-shrink-0`} /> Modern link-in-bio styles</li>
                  <li className="flex items-center"><CheckCircle className={`w-5 h-5 ${textAccentClass} mr-2 flex-shrink-0`} /> Versatile landing page layouts</li>
                  <li className="flex items-center"><CheckCircle className={`w-5 h-5 ${textAccentClass} mr-2 flex-shrink-0`} /> Easy customization</li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-white p-4 rounded-lg shadow-lg border border-stone-200 aspect-video">
                <p className="text-stone-400 text-center flex items-center justify-center h-full">
                  [Visual Placeholder: Carousel or grid of sleek template examples with stone palette]
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases / Who Is It For? Section */}
        <section id="use-cases" className="py-16 md:py-24 bg-stone-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900">Perfect For Creators & Small Businesses</h2>
              <p className="mt-4 text-lg text-stone-700 max-w-2xl mx-auto">
                Whether you're building a personal brand or growing your business, FlowPage adapts to your needs.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white hover:shadow-xl transition-shadow border-stone-200">
                <CardHeader>
                  <Sparkles className={`w-10 h-10 ${textAccentClass} mb-3`} />
                  <CardTitle className="text-xl font-semibold text-stone-800">Content Creators</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">
                    Consolidate your portfolio, latest content, affiliate links, and social profiles into one stunning, easily manageable hub.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white hover:shadow-xl transition-shadow border-stone-200">
                <CardHeader>
                  <Briefcase className={`w-10 h-10 ${textAccentClass} mb-3`} />
                  <CardTitle className="text-xl font-semibold text-stone-800">Small Businesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">
                    Quickly launch a professional micro-site, promote services, capture leads with forms, and drive sales.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white hover:shadow-xl transition-shadow border-stone-200">
                <CardHeader>
                  <Brush className={`w-10 h-10 ${textAccentClass} mb-3`} />
                  <CardTitle className="text-xl font-semibold text-stone-800">Artists & Freelancers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">
                    Showcase your work with beautiful galleries, share your services, and provide an easy contact point for clients.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
    </>
  )
}
