
'use client';

import { useState, useMemo } from 'react';
import { SignalTable } from '@/components/signals/signal-table';
import { SignalFilters } from '@/components/signals/signal-filters';
import { useSignals, useSignalActions } from '@/hooks/use-signals';
import type { Filters, Signal, SignalCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageSquarePlus } from 'lucide-react'; // MessageSquarePlus for simulate webhook
import { AiConnectionStatus } from '@/components/common/ai-connection-status';

function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-primary">
            SignalStream
          </h1>
        </div>
        <div className="flex flex-col items-center text-center sm:items-end sm:text-right gap-1">
          <p className="text-sm text-muted-foreground">
            Vos signaux de trading en temps réel
          </p>
          <AiConnectionStatus />
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  const { data: signals = [], isLoading, error, refetch } = useSignals();
  const { simulateWebhook, toggleFavoriteSignal } = useSignalActions(); // Added toggleFavoriteSignal
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    action: 'all',
    category: 'all',
  });

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
      // time will be set by addSignal if not provided
      // isFavorite will be defaulted to false by addSignal/API
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tableau des Signaux</h2>
          <div className="flex gap-2">
            <Button onClick={handleSimulateRandomSignal} variant="outline" size="sm" className="hidden sm:flex">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Simuler Signal
            </Button>
            <Button onClick={handleRefresh} variant="default" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
          </div>
        </div>
        <Button onClick={handleSimulateRandomSignal} variant="outline" size="sm" className="w-full mb-4 sm:hidden flex">
          <MessageSquarePlus className="mr-2 h-4 w-4" /> Simuler Signal Aléatoire
        </Button>
        <SignalFilters onFilterChange={setFilters} initialFilters={filters} />
        <SignalTable 
          signals={filteredSignals} 
          isLoading={isLoading} 
          error={error}
          onToggleFavorite={toggleFavoriteSignal} // Pass the handler
        />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SignalStream. Tous droits réservés.
      </footer>
    </div>
  );
}
