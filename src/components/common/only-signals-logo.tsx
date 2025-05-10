
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Aspect ratio of the logo image (width / height)
// For https://i.imgur.com/8wBZe0V.png (the new image, assuming it's the same aspect ratio as before or adjust if different)
// If the new image https://i.imgur.com/8wBZe0V.png has a different aspect ratio, 
// this constant might need adjustment or a different approach for sizing.
// For example, if the new image is 1000x250, then LOGO_ASPECT_RATIO = 1000 / 250 = 4.
// Let's assume for now the user wants direct control via h-10 w-auto as per their provided code.

export function OnlySignalsLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { className, ...rest } = props;
  return (
    <img
      src="https://i.imgur.com/8wBZe0V.png" // Updated image URL
      alt="OnlySignals Logo"
      className={cn("h-10 w-auto", className)} // Uses h-10 w-auto as specified by user
      {...rest}
      data-ai-hint="company logo"
    />
  );
}

