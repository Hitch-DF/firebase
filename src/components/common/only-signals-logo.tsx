
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function OnlySignalsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 380 100" // Adjusted viewBox to fit text better
      className={cn("fill-current", props.className)}
      {...props}
    >
      {/* S-like symbol */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g transform="translate(10, 0) scale(0.9)">
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
        <path
          d="M68,35 C68,25 60,15 50,15 C40,15 32,25 32,35 C32,45 40,55 50,55 C55,55 60,52.5 64,48 M32,65 C32,75 40,85 50,85 C60,85 68,75 68,65 C68,55 60,45 50,45 C45,45 40,47.5 36,52"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {/* Text "OnlySignals" */}
      <text
        x="120" // Adjusted x position
        y="65" // Adjusted y position for vertical centering
        fontSize="50" // Adjusted font size
        fontFamily="var(--font-inter), sans-serif"
        fontWeight="bold"
        className="fill-foreground"
      >
        OnlySignals
      </text>
    </svg>
  );
}
