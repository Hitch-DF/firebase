
'use client';

import { useState, useMemo, useCallback } from 'react';
import { SignalTable } from '@/components/signals/signal-table';
import { SignalFilters } from '@/components/signals/signal-filters';
import { useSignals, useSignalActions } from '@/hooks/use-signals';
import type { Filters, Signal, SignalCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

// Define translations for this page
const translations = {
  fr: {
    pageTitle: "Historique des Signaux",
    refreshButton: "Rafraîchir",
    loadingSignals: "Chargement de l'historique...",
    noSignals: "Aucun signal dans l'historique pour le moment.",
    errorLoadingSignals: "Erreur de chargement de l'historique:",
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


export default function HistoryPage() {
  const { data: signals = [], isLoading, error, refetch } = useSignals();
  const { toggleFavoriteSignal } = useSignalActions(); 
  const { language } = useLanguage();
  
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    action: 'all',
    category: 'all', 
    selectedDate: undefined,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const t = useCallback((key: TranslationKey) => {
    return translations[language][key] || translations.en[key];
  }, [language]);

  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      const searchTermMatch = signal.ticker.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const actionMatch = filters.action === 'all' || signal.action === filters.action;
      
      let categoryMatch = false;
      if (filters.category === 'all') {
        categoryMatch = true;
      } else if (filters.category === 'watchlist') {
        categoryMatch = !!signal.isFavorite; 
      } else {
        categoryMatch = signal.category === filters.category;
      }

      const dateMatch = !filters.selectedDate || 
        (new Date(signal.time).toDateString() === filters.selectedDate.toDateString());
        
      return searchTermMatch && actionMatch && categoryMatch && dateMatch;
    });
  }, [signals, filters]);

  const handleRefresh = () => {
    refetch();
    setCurrentPage(1); // Reset to first page on refresh
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 bg-card rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
        <Button onClick={handleRefresh} variant="default" size="sm" className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('refreshButton')}
        </Button>
      </div>

      <SignalFilters 
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1); // Reset to first page on filter change
        }} 
        initialFilters={filters} 
        language={language}
        showDatePicker={true} 
      />

      <SignalTable 
        signals={filteredSignals} 
        isLoading={isLoading} 
        error={error}
        onToggleFavorite={toggleFavoriteSignal} 
        language={language}
        loadingText={t('loadingSignals')}
        noSignalsText={t('noSignals')}
        errorLoadingText={t('errorLoadingSignals')}
        isHistoryView={true}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredSignals.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
