
'use client';

import { useState, useMemo, useCallback } from 'react';
import { SignalTable } from '@/components/signals/signal-table';
import { SignalFilters } from '@/components/signals/signal-filters';
import { useSignals, useSignalActions } from '@/hooks/use-signals';
import type { Filters, Signal, SignalCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Define translations for this page
const translations = {
  fr: {
    pageTitle: "Historique des Signaux",
    refreshButton: "Rafraîchir",
    loadingSignals: "Chargement de l'historique...",
    noSignals: "Aucun signal dans l'historique pour le moment.",
    errorLoadingSignals: "Erreur de chargement de l'historique:",
    // Add any filter-specific translations if SignalFilters is used differently here
    searchPlaceholder: "Rechercher dans l'historique...",
  },
  en: {
    pageTitle: "Signal History",
    refreshButton: "Refresh",
    loadingSignals: "Loading history...",
    noSignals: "No signals in history at the moment.",
    errorLoadingSignals: "Error loading history:",
    searchPlaceholder: "Search history...",
  }
};

type TranslationKey = keyof typeof translations.fr;

// Assume language is provided by AppLayout context or props
// For now, hardcoding for demonstration
const MOCK_LANGUAGE = 'fr'; 

export default function HistoryPage() {
  // For now, use the same signal fetching logic. 
  // In a real app, this might fetch from a different endpoint or apply different default filters.
  const { data: signals = [], isLoading, error, refetch } = useSignals();
  const { toggleFavoriteSignal } = useSignalActions(); // toggleFavorite might still be relevant
  
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    action: 'all',
    category: 'all', 
  });

  const t = useCallback((key: TranslationKey) => {
    return translations[MOCK_LANGUAGE][key] || translations.en[key];
  }, []);

  const filteredSignals = useMemo(() => {
    // Add any history-specific filtering if needed, e.g., date ranges
    return signals.filter((signal) => {
      const searchTermMatch = signal.ticker.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const actionMatch = filters.action === 'all' || signal.action === filters.action;
      let categoryMatch = false;
      if (filters.category === 'all') {
        categoryMatch = true;
      } else if (filters.category === 'watchlist') {
        // Watchlist filter might apply differently to historical data
        // or be based on the favorite status at the time of the signal if stored.
        // For now, uses current favorite status.
        categoryMatch = !!signal.isFavorite; 
      } else {
        categoryMatch = signal.category === filters.category;
      }
      return searchTermMatch && actionMatch && categoryMatch;
    });
  }, [signals, filters]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
        <Button onClick={handleRefresh} variant="default" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('refreshButton')}
        </Button>
      </div>

      {/* You can reuse SignalFilters or create a specific one for history */}
      <SignalFilters 
        onFilterChange={setFilters} 
        initialFilters={filters} 
        language={MOCK_LANGUAGE}
        // Potentially adjust placeholder for search if needed
        // searchPlaceholder={t('searchPlaceholder')} 
      />

      <SignalTable 
        signals={filteredSignals} 
        isLoading={isLoading} 
        error={error}
        onToggleFavorite={toggleFavoriteSignal} 
        language={MOCK_LANGUAGE}
        loadingText={t('loadingSignals')}
        noSignalsText={t('noSignals')}
        errorLoadingText={t('errorLoadingSignals')}
      />
    </div>
  );
}
