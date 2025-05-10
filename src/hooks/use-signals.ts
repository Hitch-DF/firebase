'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Signal, SignalCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addGlobalFavoriteTicker, isTickerGloballyFavorited, removeGlobalFavoriteTicker } from '@/lib/favorites';

const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || 'your-secret-token'; // Use an env var for actual secret

async function fetchSignals(): Promise<Signal[]> {
  const res = await fetch('/api/signals');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to fetch signals' }));
    throw new Error(errorData.message || 'Failed to fetch signals');
  }
  return res.json();
}

export function useSignals() {
  return useQuery<Signal[], Error>({
    queryKey: ['signals'],
    queryFn: fetchSignals,
    // refetchInterval: 30000, // Optional: Poll every 30 seconds
  });
}

export async function addSignal(newSignalData: Omit<Signal, 'id' | 'time'> & { time?: string }): Promise<Signal> {
  const signalPayload = {
    ...newSignalData,
    time: newSignalData.time || new Date().toISOString(), // Ensure time is set
    isFavorite: newSignalData.isFavorite || false, // Default isFavorite
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
      const isGloballyFav = isTickerGloballyFavorited(signalData.ticker);
      await addSignal({ ...signalData, isFavorite: isGloballyFav || false });
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

  const toggleFavoriteSignal = async (signalId: string, currentIsFavorite: boolean) => {
    const newIsFavorite = !currentIsFavorite;

    const signals = queryClient.getQueryData<Signal[]>(['signals']);
    const signalToToggle = signals?.find(s => s.id === signalId);

    if (!signalToToggle) {
        console.error("Signal not found for toggling favorite:", signalId);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Signal non trouvé.",
        });
        return;
    }
    const ticker = signalToToggle.ticker;

    // Optimistic update
    queryClient.setQueryData(['signals'], (oldData: Signal[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(signal =>
        signal.id === signalId ? { ...signal, isFavorite: newIsFavorite } : signal
      );
    });

    try {
      const response = await fetch(`/api/signals/${signalId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: newIsFavorite }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update favorite status' }));
        throw new Error(errorData.message || 'Failed to update favorite status');
      }
      
      // Manage global favorite tickers
      if (newIsFavorite) {
        addGlobalFavoriteTicker(ticker);
      } else {
        // If un-favoriting this specific signal, remove the ticker from global favorites.
        // This means the user has to explicitly favorite another signal of this ticker
        // to make it "sticky" again for future signals.
        removeGlobalFavoriteTicker(ticker);
      }
      
      queryClient.invalidateQueries({ queryKey: ['signals'] });

      toast({
        title: "Watchlist mise à jour",
        description: `Signal ${newIsFavorite ? 'ajouté à' : 'retiré de'} la watchlist. ${ticker} ${newIsFavorite ? 'sera' : 'ne sera plus'} automatiquement favori.`,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Rollback optimistic update on error
      queryClient.setQueryData(['signals'], (oldData: Signal[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(signal =>
          signal.id === signalId ? { ...signal, isFavorite: currentIsFavorite } : signal 
        );
      });
      toast({
        variant: "destructive",
        title: "Erreur Watchlist",
        description: (error as Error).message || "Impossible de mettre à jour le favori.",
      });
    }
  };

  return { refreshSignals, simulateWebhook, toggleFavoriteSignal };
}
