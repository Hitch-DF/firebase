// src/app/api/signals/[id]/favorite/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { signals } from '../../route'; // Import the exported signals array
import { z } from 'zod';
import type { Signal } from '@/lib/types';

const favoriteUpdateSchema = z.object({
  isFavorite: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const signalId = params.id;

  // For demo purposes, allow webhook secret bypass if it's not set,
  // or ensure client calls don't need a secret for this specific endpoint.
  // This endpoint is called from client-side, so it won't have the webhook secret.
  // No secret check here as it's a user-initiated action.

  try {
    const body = await request.json();
    const validation = favoriteUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { isFavorite } = validation.data;
    const signalIndex = signals.findIndex((s: Signal) => s.id === signalId);

    if (signalIndex === -1) {
      return NextResponse.json({ message: 'Signal not found' }, { status: 404 });
    }

    signals[signalIndex] = { ...signals[signalIndex], isFavorite };
    
    // console.log(`Signal ${signalId} favorite status updated to ${isFavorite}`);
    return NextResponse.json(signals[signalIndex]);

  } catch (error) {
    console.error(`Error updating favorite status for signal ${signalId}:`, error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
