
'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface SignalAgeProps {
  timestamp: string;
  language: 'fr' | 'en';
}

const translations = {
  fr: {
    invalidDate: "Date invalide",
    calculating: "Calcul...",
  },
  en: {
    invalidDate: "Invalid date",
    calculating: "Calculating...",
  }
};

type TranslationKey = keyof typeof translations.fr;

export function SignalAge({ timestamp, language }: SignalAgeProps) {
  const [age, setAge] = useState<string>('');

  const t = useCallback((key: TranslationKey) => translations[language][key] || translations.fr[key], [language]);

  useEffect(() => {
    let isMounted = true;

    const calculateAge = () => {
      if (!isMounted) return;
      try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          setAge(t('invalidDate'));
          return;
        }
        setAge(formatDistanceToNowStrict(date, { addSuffix: true, locale: language === 'fr' ? fr : enUS }));
      } catch (error) {
        console.error("Error parsing date for signal age:", error);
        if (isMounted) {
          setAge(t('invalidDate'));
        }
      }
    };

    calculateAge();
    const intervalId = setInterval(calculateAge, 60000); 

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [timestamp, language, t]);

  return <span suppressHydrationWarning>{age || t('calculating')}</span>;
}
