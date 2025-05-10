'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SignalAgeProps {
  timestamp: string;
}

export function SignalAge({ timestamp }: SignalAgeProps) {
  const [age, setAge] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const calculateAge = () => {
      if (!isMounted) return;
      try {
        const date = new Date(timestamp);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          setAge("Date invalide");
          return;
        }
        setAge(formatDistanceToNowStrict(date, { addSuffix: true, locale: fr }));
      } catch (error) {
        console.error("Error parsing date for signal age:", error);
        if (isMounted) {
          setAge("Date invalide");
        }
      }
    };

    calculateAge(); // Calculate age immediately on mount
    const intervalId = setInterval(calculateAge, 60000); // Update every minute

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [timestamp]);

  // Render placeholder or initial calculated age if available to avoid hydration mismatch warnings for dynamic content
  return <span suppressHydrationWarning>{age || 'Calcul...'}</span>;
}
