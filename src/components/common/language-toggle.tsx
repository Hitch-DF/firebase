
'use client';

import type { MouseEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: 'fr' | 'en';
  onToggleLanguage: MouseEventHandler<HTMLButtonElement>;
}

export function LanguageToggle({ currentLanguage, onToggleLanguage }: LanguageToggleProps) {
  // Button text now shows the current language abbreviation
  const buttonDisplayText = currentLanguage === 'fr' ? 'FR' : 'ENG';
  // Aria-label indicates which language it will switch to
  const switchToLanguageDisplay = currentLanguage === 'fr' ? 'English' : 'Français'; 
  
  return (
    <Button variant="outline" size="sm" onClick={onToggleLanguage} aria-label={`Passer en ${switchToLanguageDisplay}`}>
      <Globe className="h-4 w-4 mr-2" />
      {buttonDisplayText}
    </Button>
  );
}

