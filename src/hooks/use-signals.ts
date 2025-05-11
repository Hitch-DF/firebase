'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Signal, SignalCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  addGlobalFavoriteTicker,
  isTickerGloballyFavorited,
  removeGlobalFavoriteTicker,
} from '@/lib/favorites';

const API_BASE_URL = 'https://onlysignalsai.com/api'; // Symfony API root
const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || 'your-secret-token';

async function fetchSignals(): Promise<Signal[]> {
  const res = await fetch(`${API_BASE_URL}/signals`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to fetch signals' }));
    throw new Error(errorData.message || 'Failed to fetch signals');
  }

  const signals: Signal[] = await res.json();

  return signals.map(signal => ({
    ...signal,
    isFavorite: isTickerGloballyFavorited(signal.ticker),
  }));
}

export function useSignals() {
  return useQuery<Signal[], Error>({
    queryKey: ['signals'],
    queryFn: fetchSignals,
  });
}

export async function addSignal(newSignalData: Omit<Signal, 'id' | 'time'> & { time?: string }): Promise<Signal> {
  const signalPayload = {
    ...newSignalData,
    time: newSignalData.time || new Date().toISOString(),
    isFavorite: isTickerGloballyFavorited(newSignalData.ticker),
  };

  const res = await fetch(`${API_BASE_URL}/signals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': WEBHOOK_SECRET, // à valider côté Symfony si tu veux sécuriser
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

  const simulateWebhook = async (
    signalData: Omit<Signal, 'id' | 'time'> & { time?: string; category: SignalCategory }
  ) => {
    try {
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

  const toggleFavoriteSignal = async (signalId: string) => {
    const currentSignals = queryClient.getQueryData<Signal[]>(['signals']);
    const targetSignal = currentSignals?.find(s => s.id === signalId);

    if (!targetSignal) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Signal non trouvé.",
      });
      return;
    }

    const ticker = targetSignal.ticker;
    const wasFavorited = isTickerGloballyFavorited(ticker);
    const shouldFavorite = !wasFavorited;

    queryClient.setQueryData(['signals'], (old: Signal[] | undefined) => {
      if (!old) return [];
      return old.map(s =>
        s.ticker === ticker ? { ...s, isFavorite: shouldFavorite } : s
      );
    });

    if (shouldFavorite) {
      addGlobalFavoriteTicker(ticker);
    } else {
      removeGlobalFavoriteTicker(ticker);
    }

    // Tu peux ensuite implémenter une API PATCH côté Symfony si besoin

    toast({
      title: "Mise à jour Watchlist",
      description: `Tous les signaux pour ${ticker} sont maintenant ${shouldFavorite ? 'dans' : 'hors de'} la watchlist.`,
    });
  };

  return { refreshSignals, simulateWebhook, toggleFavoriteSignal };
}
