
'use client';

import type { MouseEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: 'fr' | 'en';
  onToggleLanguage: MouseEventHandler<HTMLButtonElement>;
}

export function LanguageToggle({ currentLanguage, onToggleLanguage }: LanguageToggleProps) {
  const nextLanguageDisplay = currentLanguage === 'fr' ? 'ENG' : 'FR';
  
  return (
    <Button variant="outline" size="sm" onClick={onToggleLanguage} aria-label={`Switch to ${nextLanguageDisplay}`}>
      <Globe className="h-4 w-4 mr-2" />
      {nextLanguageDisplay}
    </Button>
  );
}
