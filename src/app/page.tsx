
'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { SignalTable } from '@/components/signals/signal-table';
import { SignalFilters } from '@/components/signals/signal-filters';
import { useSignals, useSignalActions } from '@/hooks/use-signals';
import type { Filters, Signal, SignalCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageSquarePlus, UserCircle, Globe } from 'lucide-react'; 
import { AiConnectionStatus } from '@/components/common/ai-connection-status';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle'; // Import LanguageToggle

// Define translations
const translations = {
  fr: {
    pageTitle: "SignalStream",
    pageSubtitle: "Vos signaux de trading en temps réel",
    authButton: "Connexion / Inscription",
    aiStatusConnected: "Connecté à l'IA",
    aiModelNames: "ChatGPT-4o Claude 3.7 Sonnet",
    signalsTableTitle: "Tableau des Signaux",
    simulateSignalButton: "Simuler Signal",
    simulateRandomSignalButton: "Simuler Signal Aléatoire",
    refreshButton: "Rafraîchir",
    footerText: `© ${new Date().getFullYear()} SignalStream. Tous droits réservés.`,
    loadingSignals: "Chargement des signaux...",
    noSignals: "Aucun signal à afficher pour le moment.",
    errorLoadingSignals: "Erreur de chargement des signaux:",
  },
  en: {
    pageTitle: "SignalStream",
    pageSubtitle: "Your real-time trading signals",
    authButton: "Login / Sign Up",
    aiStatusConnected: "Connected to AI",
    aiModelNames: "ChatGPT-4o Claude 3.7 Sonnet",
    signalsTableTitle: "Signals Table",
    simulateSignalButton: "Simulate Signal",
    simulateRandomSignalButton: "Simulate Random Signal",
    refreshButton: "Refresh",
    footerText: `© ${new Date().getFullYear()} SignalStream. All rights reserved.`,
    loadingSignals: "Loading signals...",
    noSignals: "No signals to display at the moment.",
    errorLoadingSignals: "Error loading signals:",
  }
};

type TranslationKey = keyof typeof translations.fr;


function Header({ language, onToggleLanguage }: { language: 'fr' | 'en', onToggleLanguage: () => void}) {
  const t = useCallback((key: TranslationKey) => translations[language][key] || translations.fr[key], [language]);

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-primary">
            {t('pageTitle')}
          </h1>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-1">
          <div className="flex items-center gap-2">
            <LanguageToggle currentLanguage={language} onToggleLanguage={onToggleLanguage} />
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/auth">
                <UserCircle className="mr-2 h-4 w-4" />
                {t('authButton')}
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center sm:text-right">
            {t('pageSubtitle')}
          </p>
          <div className="mt-1 sm:mt-0 w-full flex justify-center sm:justify-end">
            <AiConnectionStatus language={language} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  const { data: signals = [], isLoading, error, refetch } = useSignals();
  const { simulateWebhook, toggleFavoriteSignal } = useSignalActions(); 
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    action: 'all',
    category: 'all',
  });
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr');
  };

  const t = useCallback((key: TranslationKey) => translations[language][key] || translations.fr[key], [language]);

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


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header language={language} onToggleLanguage={toggleLanguage} />
      <main className="flex-grow container mx-auto px-4 py-8">
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
          language={language}
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
        />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        {t('footerText')}
      </footer>
    </div>
  );
}
