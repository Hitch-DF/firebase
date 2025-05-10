'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Signal, SignalCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addGlobalFavoriteTicker, isTickerGloballyFavorited, removeGlobalFavoriteTicker } from '@/lib/favorites';

const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || 'your-secret-token'; 

async function fetchSignals(): Promise<Signal[]> {
  const res = await fetch('/api/signals');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to fetch signals' }));
    throw new Error(errorData.message || 'Failed to fetch signals');
  }
  const signals: Signal[] = await res.json();
  // Ensure client-side favorite status matches global ticker preference after fetch
  return signals.map(signal => ({
    ...signal,
    isFavorite: isTickerGloballyFavorited(signal.ticker),
  }));
}

export function useSignals() {
  return useQuery<Signal[], Error>({
    queryKey: ['signals'],
    queryFn: fetchSignals,
    // refetchInterval: 30000, 
  });
}

export async function addSignal(newSignalData: Omit<Signal, 'id' | 'time'> & { time?: string }): Promise<Signal> {
  const signalPayload = {
    ...newSignalData,
    time: newSignalData.time || new Date().toISOString(),
    // New signals automatically get favorited if their ticker is globally favorited
    isFavorite: isTickerGloballyFavorited(newSignalData.ticker) || false,
  };

  const res = await fetch('/api/signals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': WEBHOOK_SECRET, 
    },
    body: JSON.stringify(signalPayload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to add signal' }));
    throw new Error(errorData.message || 'Failed to add signal');
  }
  return res.json();
}


export function useSignalActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshSignals = () => {
    queryClient.invalidateQueries({ queryKey: ['signals'] });
    toast({
      title: "Signaux rafraîchis",
      description: "La liste des signaux a été mise à jour.",
    });
  };
  
  const simulateWebhook = async (signalData: Omit<Signal, 'id' | 'time'> & { time?: string; category: SignalCategory }) => {
    try {
      // addSignal will handle the global favorite check
      await addSignal(signalData); 
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      toast({
        title: "Webhook simulé avec succès",
        description: `Signal ${signalData.action} pour ${signalData.ticker} (${signalData.category}) ajouté.`,
      });
    } catch (error) {
      console.error("Error simulating webhook:", error);
      toast({
        variant: "destructive",
        title: "Erreur de simulation Webhook",
        description: (error as Error).message || "Une erreur est survenue.",
      });
    }
  };

  const toggleFavoriteSignal = async (signalIdToIdentifyTicker: string) => {
    const currentSignals = queryClient.getQueryData<Signal[]>(['signals']);
    const relevantSignal = currentSignals?.find(s => s.id === signalIdToIdentifyTicker);

    if (!relevantSignal) {
        console.error("Signal not found for toggling favorite:", signalIdToIdentifyTicker);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Signal non trouvé.",
        });
        return;
    }

    const ticker = relevantSignal.ticker;
    const currentGlobalFavoriteStateForTicker = isTickerGloballyFavorited(ticker);
    const newGlobalFavoriteStateForTicker = !currentGlobalFavoriteStateForTicker;

    // Optimistic update on the client for all signals of this ticker
    queryClient.setQueryData(['signals'], (oldData: Signal[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(s => 
        s.ticker === ticker ? { ...s, isFavorite: newGlobalFavoriteStateForTicker } : s
      );
    });

    // Update localStorage for the ticker's global favorite status
    if (newGlobalFavoriteStateForTicker) {
      addGlobalFavoriteTicker(ticker);
    } else {
      removeGlobalFavoriteTicker(ticker);
    }

    try {
      // API call to update all signals for this ticker on the server
      const response = await fetch(`/api/signals/ticker/${ticker}/favorite-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: newGlobalFavoriteStateForTicker }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to update global favorite status for ${ticker}` }));
        throw new Error(errorData.message || `Failed to update global favorite status for ${ticker}`);
      }
      
      // Invalidate to refetch from server and ensure consistency.
      // The fetchSignals function will re-apply global favorites on fetch.
      queryClient.invalidateQueries({ queryKey: ['signals'] });

      toast({
        title: "Watchlist Globale Mise à Jour",
        description: `Tous les signaux pour ${ticker} sont maintenant ${newGlobalFavoriteStateForTicker ? 'dans la watchlist' : 'hors de la watchlist'}.`,
      });

    } catch (error) {
      console.error(`Error toggling global favorite for ticker ${ticker}:`, error);
      // Rollback optimistic update on error
      queryClient.setQueryData(['signals'], (oldData: Signal[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(s => 
          s.ticker === ticker ? { ...s, isFavorite: currentGlobalFavoriteStateForTicker } : s // Revert to old global state
        );
      });
      // Rollback localStorage
      if (newGlobalFavoriteStateForTicker) { // if we tried to set it to true, roll back by removing
        removeGlobalFavoriteTicker(ticker);
      } else { // if we tried to set it to false, roll back by adding
        addGlobalFavoriteTicker(ticker);
      }

      toast({
        variant: "destructive",
        title: "Erreur Watchlist Globale",
        description: (error as Error).message || "Impossible de mettre à jour la watchlist globale.",
      });
    }
  };

  return { refreshSignals, simulateWebhook, toggleFavoriteSignal };
}
