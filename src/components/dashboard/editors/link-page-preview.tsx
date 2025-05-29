// app/components/dashboard/editors/link-page-preview.tsx
'use client';

import React from 'react';
// Assuming LinkItem and LinkPageAppearanceSettings are exported from LinkPageEditor or a shared types file
import type { LinkItem, LinkPageAppearanceSettings } from './link-page-editor';
import { ExternalLink } from 'lucide-react';

interface LinkPagePreviewProps {
  projectTitle: string;
  links: LinkItem[];
  appearance: LinkPageAppearanceSettings;
  // Optional: You might want to pass other displayable info like user avatar, bio text, etc.
  // userAvatarUrl?: string | null;
  // userBio?: string | null;
}

// Helper to generate Tailwind classes for font family
const getFontClass = (fontFamily?: LinkPageAppearanceSettings['fontFamily']): string => {
  switch (fontFamily) {
    case 'Manrope': return 'font-[Manrope,sans-serif]'; // Ensure Manrope is available via @next/font and CSS var --font-manrope
    case 'Roboto': return 'font-[Roboto,sans-serif]';
    case 'Open Sans': return 'font-["Open_Sans",sans-serif]'; // Quotes for names with spaces
    case 'Poppins': return 'font-[Poppins,sans-serif]';
    case 'Lato': return 'font-[Lato,sans-serif]';
    case 'System UI': return 'font-sans'; // Tailwind's default sans
    case 'Inter':
    default:
      return 'font-[Inter,sans-serif]'; // Assuming Inter is your base via --font-inter
  }
  // Make sure these font families are configured in your tailwind.config.js
  // if you want to use simple classes like 'font-manrope'.
  // Using arbitrary values like 'font-[Manrope,sans-serif]' works directly if the font is loaded.
};

// Helper to generate Tailwind classes for button style
const getButtonStyleClasses = (style?: LinkPageAppearanceSettings['buttonStyle']): string => {
  switch (style) {
    case 'rounded-full': return 'rounded-full';
    case 'rounded-lg': return 'rounded-lg';
    case 'rounded-md': return 'rounded-md';
    case 'square': return 'rounded-none';
    default: return 'rounded-lg'; // Default style
  }
};

// Basic contrast and luminance functions (simplified)
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Function to decide text color based on background for readability (simplified)
const getContrastingTextColor = (backgroundColorHex?: string): string => {
  if (!backgroundColorHex) return '#1F2937'; // Default dark text
  const rgb = hexToRgb(backgroundColorHex);
  if (!rgb) return '#1F2937';
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#1F2937' : '#FFFFFF'; // Dark text on light bg, light text on dark bg
};


export function LinkPagePreview({
  projectTitle,
  links,
  appearance,
  // userAvatarUrl,
  // userBio
}: LinkPagePreviewProps) {
  const fontClass = getFontClass(appearance.fontFamily);

  // Determine text color for the page title and bio based on page background
  const pageTextColor = appearance.textColor || getContrastingTextColor(appearance.backgroundColor);
  // Determine text color for buttons based on button background
  const buttonEffectiveFontColor = appearance.buttonFontColor || getContrastingTextColor(appearance.buttonColor);


  // Define default appearance settings if not already imported
  const defaultAppearanceSettings: LinkPageAppearanceSettings = {
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter',
    buttonColor: '#6366F1',
    buttonFontColor: '#FFFFFF',
    buttonHoverColor: '#4F46E5',
    buttonHoverFontColor: '#FFFFFF',
    buttonStyle: 'rounded-lg',
  };

  const previewContainerStyle: React.CSSProperties = {
    backgroundColor: appearance.backgroundColor || defaultAppearanceSettings.backgroundColor,
  };

  // Filter for active links only
  const activeLinks = links.filter(link => link.is_active);

  return (
    <div className={`w-full max-w-[300px] sm:max-w-[320px] md:max-w-[340px] mx-auto shadow-xl rounded-2xl overflow-hidden border-4 md:border-8 border-slate-800 dark:border-slate-700 aspect-[9/19] ${fontClass} cursor-default`}>
      <div
        className="h-full p-4 pt-8 sm:p-6 flex flex-col items-center overflow-y-auto transition-colors duration-300"
        style={previewContainerStyle}
      >
        {/* Profile Section Placeholder */}
        <div className="mb-6 text-center w-full">
          {/* Example Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-3 flex items-center justify-center ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-indigo-500">
            {/* Replace with actual avatar logic if you add userAvatarUrl */}
            <span className="text-3xl sm:text-4xl text-slate-500 dark:text-slate-400">👤</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold break-words" style={{ color: pageTextColor }}>
            {projectTitle || "Your Page Title"}
          </h1>
          {/* Example Bio Text */}
          <p className="text-xs sm:text-sm mt-1.5 px-2 break-words" style={{ color: pageTextColor, opacity: 0.8 }}>
            {/* {userBio || "Welcome to my page! Check out my links below."} */}
            This is where a short bio or description would appear.
          </p>
        </div>

        {/* Links Section */}
        <div className="w-full space-y-3 max-w-xs mx-auto">
          {activeLinks.length > 0 ? activeLinks.map((link) => {
            // Determine button text color for this specific link
            const currentButtonFontColor = appearance.buttonFontColor || getContrastingTextColor(appearance.buttonColor);
            const currentButtonHoverFontColor = appearance.buttonHoverFontColor || getContrastingTextColor(appearance.buttonHoverColor || appearance.buttonColor);


            return (
              <div // Using div instead of <a> for preview to prevent navigation
                key={link.id || link.title} // Use a more stable key if possible
                className={`w-full flex items-center justify-center p-3 text-center font-medium
                            transition-all duration-200 ease-in-out
                            shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                            ${getButtonStyleClasses(appearance.buttonStyle)}
                          `}
                style={{
                  backgroundColor: appearance.buttonColor || defaultAppearanceSettings.buttonColor,
                  color: currentButtonFontColor,
                  // For a more accurate hover preview, you'd need more complex state or CSS variable manipulation.
                  // This is a simplified hover effect:
                  // onMouseEnter: (e) => {
                  //   if (appearance.buttonHoverColor) e.currentTarget.style.backgroundColor = appearance.buttonHoverColor;
                  //   if (appearance.buttonHoverFontColor) e.currentTarget.style.color = appearance.buttonHoverFontColor;
                  // },
                  // onMouseLeave: (e) => {
                  //   if (appearance.buttonColor) e.currentTarget.style.backgroundColor = appearance.buttonColor;
                  //   if (appearance.buttonFontColor) e.currentTarget.style.color = currentButtonFontColor; // Revert to original calculated/set color
                  // },
                }}
                // For actual hover styles defined by appearanceSettings, you might need to generate dynamic CSS classes
                // or use CSS variables that are updated. This is a limitation of simple inline style previews.
              >
                {link.icon && <span className="mr-2 text-lg select-none" role="img">{link.icon}</span>}
                <span className="truncate">{link.title}</span>
                {/* <ExternalLink className="ml-2 h-4 w-4 opacity-70" /> */}
              </div>
            );
          }) : (
            <p className="text-center text-sm py-4" style={{ color: pageTextColor, opacity: 0.7 }}>
              No active links to display.
            </p>
          )}
        </div>

        {/* Footer/Branding (Optional) */}
        <div className="mt-auto pt-8 pb-2 text-center">
          <p className="text-xs" style={{ color: pageTextColor, opacity: 0.6 }}>
            Powered by <span className="font-semibold">FlowFolio</span>
          </p>
        </div>
      </div>
    </div>
  );
}