
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface AiConnectionStatusProps {
  language: 'fr' | 'en';
}

const translations = {
  fr: {
    connecting: "Connexion à l'IA en cours...",
    connected: "Connecté à l'IA",
    modelNames: "ChatGPT-4o Claude 3.7 Sonnet",
    loadingLabel: "Chargement en cours",
    connectedLabel: "Connecté",
  },
  en: {
    connecting: "Connecting to AI...",
    connected: "Connected to AI",
    modelNames: "ChatGPT-4o Claude 3.7 Sonnet",
    loadingLabel: "Loading",
    connectedLabel: "Connected",
  }
};

type TranslationKey = keyof typeof translations.fr;

export function AiConnectionStatus({ language }: AiConnectionStatusProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); 

    return () => clearTimeout(timer);
  }, []); 

  const t = useCallback((key: TranslationKey) => translations[language][key] || translations.fr[key], [language]);

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground" data-testid="ai-connection-status">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label={t('loadingLabel')} />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-primary" aria-label={t('connectedLabel')} />
      )}
      <span> 
        {isLoading ? t('connecting') : (
          <>
            {t('connected')}:
            <span className="font-semibold text-foreground ml-1">
              {t('modelNames')}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
