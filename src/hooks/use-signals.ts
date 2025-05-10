'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Signal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
  
  // This function is for testing purposes, to simulate a webhook call from the client-side
  // In a real scenario, webhooks are received by the server endpoint directly.
  const simulateWebhook = async (signalData: Omit<Signal, 'id' | 'time'> & { time?: string }) => {
    try {
      await addSignal(signalData);
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      toast({
        title: "Webhook simulé avec succès",
        description: `Signal ${signalData.action} pour ${signalData.ticker} ajouté.`,
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

  return { refreshSignals, simulateWebhook };
}
