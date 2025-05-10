
import Image from 'next/image';
import type { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';

// Aspect ratio of the logo image (width / height)
// For https://i.imgur.com/f1BHZT0.png (1042x278)
const LOGO_ASPECT_RATIO = 1042 / 278;

interface OnlySignalsLogoProps extends Omit<NextImageProps, 'src' | 'alt' | 'width' | 'height'> {
  className?: string;
  height: number; // Height is now a required prop to control size
}

export function OnlySignalsLogo({ className, height, ...props }: OnlySignalsLogoProps) {
  const imageUrl = "https://i.imgur.com/f1BHZT0.png"; // Direct image link from the album
  const calculatedWidth = Math.round(height * LOGO_ASPECT_RATIO);

  return (
    <Image
      src={imageUrl}
      alt="OnlySignals Logo"
      width={calculatedWidth}
      height={height}
      className={cn(className)}
      priority // Logos are often LCP elements, consider priority
      {...props}
      data-ai-hint="company logo"
    />
  );
}
