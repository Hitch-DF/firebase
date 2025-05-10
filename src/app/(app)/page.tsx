
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
    noSignals: "Aucun signal à afficher pour le moment.",
    errorLoadingSignals: "Erreur de chargement des signaux:",
  },
  en: {
    signalsTableTitle: "Signals Table",
    simulateSignalButton: "Simulate Signal",
    simulateRandomSignalButton: "Simulate Random Signal",
    refreshButton: "Refresh",
    loadingSignals: "Loading signals...",
    noSignals: "No signals to display at the moment.",
    errorLoadingSignals: "Error loading signals:",
  }
};

type TranslationKey = keyof typeof translations.fr;

// A simple way to pass language from layout, or use a context
// For now, assuming it might come from props or a context if Header is removed.
// This page component itself does not manage language state directly.
// The language state is managed by AppLayout. For components inside this page,
// they would need the language prop passed down.
// For demonstration, this page will assume 'fr' or get it passed.
// It's better if AppLayout provides language via context or passes it to children if they need it.
// Let's assume the AppLayout will provide the language to children that need it,
// for now this page will depend on its props for language or default.

interface HomePageProps {
  // language could be passed as a prop from a context in AppLayout
  // For simplicity, we'll use the language from the AppLayout's state via its children rendering
  // But the `t` function here would need access to it.
  // The `AppLayout` now manages language state. This page component doesn't.
  // The translations here are for this page's content.
}


export default function HomePage({ }: HomePageProps) {
  const { data: signals = [], isLoading, error, refetch } = useSignals();
  const { simulateWebhook, toggleFavoriteSignal } = useSignalActions(); 
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    action: 'all',
    category: 'all',
  });

  // This component doesn't manage language directly.
  // For its own text, it needs to know the current language.
  // We'll assume a default or make `t` function rely on a prop/context later if needed.
  // Since AppLayout handles language and passes it to AppHeader,
  // this page's specific texts need to be aware. For now, hardcode 'fr' for `t` or expect prop.
  // To use the language from AppLayout, we'd need to pass it down or use context.
  // The `language` prop is removed from this page, as AppLayout handles it.
  // For SignalFilters and SignalTable, they expect a language prop.
  // This page would need to get the language from its parent (AppLayout).
  // This creates a prop-drilling issue. A React Context for language is better.
  // For now, I'll pass a 'fr' default to sub-components that need it.
  // This should be improved with a LanguageContext provided by AppLayout.
  const language = 'fr'; // Placeholder: this should come from AppLayout via props or context.

  const t = useCallback((key: TranslationKey) => {
    // This is a simplified 't' function. In a real app, use a i18n library or context.
    // It needs access to the current language state.
    // For now, it will use the hardcoded 'language' variable above.
    // When `AppLayout` provides language via context, this `t` would consume it.
    const currentLanguage = language; // Access the language state from AppLayout
    return translations[currentLanguage][key] || translations.fr[key];
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
      
      return searchTermMatch && actionMatch && categoryMatch;
    });
  }, [signals, filters]);

  const handleRefresh = () => {
    refetch();
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

  // The main page content, Header is now in AppLayout
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
        onFilterChange={setFilters} 
        initialFilters={filters} 
        language={language} // Needs current language
      />
      <SignalTable 
        signals={filteredSignals} 
        isLoading={isLoading} 
        error={error}
        onToggleFavorite={toggleFavoriteSignal} 
        language={language} // Needs current language
        loadingText={t('loadingSignals')}
        noSignalsText={t('noSignals')}
        errorLoadingText={t('errorLoadingSignals')}
        isHistoryView={false} // Explicitly false for main page
      />
    </>
  );
}
