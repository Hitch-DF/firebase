
'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function AiConnectionStatus() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Simulate connection time of 2.5 seconds

    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground" data-testid="ai-connection-status">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Chargement en cours" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-primary" aria-label="Connecté" />
      )}
      {/* Text content designed to wrap naturally or stay on one line based on available space */}
      <span> 
        {isLoading ? 'Connexion à l\'IA en cours...' : (
          <>
            Connecté à l'IA :
            <span className="font-semibold text-foreground ml-1">
              ChatGPT-4o Claude 3.7 Sonnet
            </span>
          </>
        )}
      </span>
    </div>
  );
}
