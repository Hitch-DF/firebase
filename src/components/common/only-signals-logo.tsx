
'use client';

import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function OnlySignalsLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { className, ...rest } = props;
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the logo source based on the resolved theme
  // resolvedTheme gives the actual theme (light/dark) even if 'system' is selected
  const logoSrc = (mounted && (resolvedTheme === 'dark' || theme === 'dark'))
    ? "https://i.imgur.com/8wBZe0V.png" // Dark theme logo
    : "https://i.imgur.com/N98VdoT.png"; // Light theme logo

  if (!mounted) {
    // Render a placeholder or null during server-side rendering or before hydration
    // to avoid hydration mismatch, or a default logo.
    // Using a transparent pixel as a placeholder to maintain layout if needed.
    return (
       <img
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        alt="OnlySignals Logo"
        className={cn("h-10 w-auto", className)} // Same class for layout consistency
        {...rest}
        data-ai-hint="company logo"
      />
    );
  }

  return (
    <img
      src={logoSrc}
      alt="OnlySignals Logo"
      className={cn("h-10 w-auto", className)}
      {...rest}
      data-ai-hint="company logo"
    />
  );
}

