
'use client';

import { useState, useMemo, useCallback, useContext } from 'react';
import { SignalTable } from '@/components/signals/signal-table';
import { SignalFilters } from '@/components/signals/signal-filters';
import { useSignals, useSignalActions } from '@/hooks/use-signals';
import type { Filters, Signal, SignalCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageSquarePlus } from 'lucide-react'; 

// Define translations, assuming language state is handled by the layout
const translations = {
  fr: {
    signalsTableTitle: "Tableau des Signaux",
    simulateSignalButton: "Simuler Signal",
    simulateRandomSignalButton: "Simuler Signal Aléatoire",
    refreshButton: "Rafraîchir",
    loadingSignals: "Chargement des signaux...",
    noSignals: "Aucun signal à afficher pour le moment (derniers 7 jours).",
    errorLoadingSignals: "Erreur de chargement des signaux:",
  },
  en: {
    signalsTableTitle: "Signals Table",
    simulateSignalButton: "Simulate Signal",
    simulateRandomSignalButton: "Simulate Random Signal",
    refreshButton: "Refresh",
    loadingSignals: "Loading signals...",
    noSignals: "No signals to display at the moment (last 7 days).",
    errorLoadingSignals: "Error loading signals:",
  }
};

type TranslationKey = keyof typeof translations.fr;

interface HomePageProps {
  // language is managed by AppLayout
}


export default function HomePage({ }: HomePageProps) {
  const { data: signals = [], isLoading, error, refetch } = useSignals();
  const { simulateWebhook, toggleFavoriteSignal } = useSignalActions(); 
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    action: 'all',
    category: 'all',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const language = 'fr'; // Placeholder: this should come from AppLayout via props or context.

  const t = useCallback((key: TranslationKey) => {
    const currentLanguage = language; 
    return translations[currentLanguage][key] || translations.fr[key];
  }, [language]);


  const filteredSignals = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; 

    return signals.filter((signal) => {
      const signalTime = new Date(signal.time).getTime();
      const isRecentEnough = signalTime >= oneWeekAgo; 

      if (!isRecentEnough) {
        return false; 
      }

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
      
      return searchTermMatch && actionMatch && categoryMatch;
    });
  }, [signals, filters]);

  const handleRefresh = () => {
    refetch();
    setCurrentPage(1); // Reset to first page on refresh
  };
  
  const handleSimulateRandomSignal = () => {
    const categories: SignalCategory[] = ['crypto', 'forex', 'commodities'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    let randomTicker = '';
    let randomPrice = 0;

    switch (randomCategory) {
      case 'crypto':
        randomTicker = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT'][Math.floor(Math.random() * 5)];
        randomPrice = parseFloat((Math.random() * 70000 + 1000).toFixed(2));
        break;
      case 'forex':
        randomTicker = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'][Math.floor(Math.random() * 5)];
        randomPrice = parseFloat((Math.random() * 1.5 + 0.8).toFixed(4));
        break;
      case 'commodities':
        randomTicker = ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS'][Math.floor(Math.random() * 5)];
        randomPrice = parseFloat((Math.random() * 2500 + 50).toFixed(2));
        break;
    }
    
    const randomAction = Math.random() > 0.5 ? 'buy' : 'sell';
    
    simulateWebhook({
      ticker: randomTicker,
      price: randomPrice,
      action: randomAction,
      category: randomCategory,
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('signalsTableTitle')}</h2>
        <div className="flex gap-2">
          <Button onClick={handleSimulateRandomSignal} variant="outline" size="sm" className="hidden sm:flex">
            <MessageSquarePlus className="mr-2 h-4 w-4" /> {t('simulateSignalButton')}
          </Button>
          <Button onClick={handleRefresh} variant="default" size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refreshButton')}
          </Button>
        </div>
      </div>
      <Button onClick={handleSimulateRandomSignal} variant="outline" size="sm" className="w-full mb-4 sm:hidden flex">
        <MessageSquarePlus className="mr-2 h-4 w-4" /> {t('simulateRandomSignalButton')}
      </Button>
      <SignalFilters 
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1); // Reset to first page on filter change
        }} 
        initialFilters={filters} 
        language={language} 
        showDatePicker={false} 
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
        isHistoryView={false}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredSignals.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </>
  );
}
