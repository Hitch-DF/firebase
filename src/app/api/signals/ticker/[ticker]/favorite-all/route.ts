// src/app/api/signals/ticker/[ticker]/favorite-all/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { signals } from '../../../route'; // Adjusted import path
import { z } from 'zod';
import type { Signal } from '@/lib/types';

const updateSchema = z.object({
  isFavorite: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const tickerToUpdate = params.ticker?.toUpperCase();

  if (!tickerToUpdate) {
    return NextResponse.json({ message: 'Ticker parameter is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { isFavorite } = validation.data;
    let updatedCount = 0;

    // Update signals in the in-memory array
    // In a real DB, this would be an UPDATE query with a WHERE clause
    signals.forEach((signal: Signal, index: number) => {
      if (signal.ticker.toUpperCase() === tickerToUpdate) {
        signals[index] = { ...signal, isFavorite }; // Update the existing signal object
        updatedCount++;
      }
    });
    
    // console.log(`${updatedCount} signals for ticker ${tickerToUpdate} updated to isFavorite: ${isFavorite}`);
    return NextResponse.json({ message: `Successfully updated ${updatedCount} signals for ${tickerToUpdate}.`, count: updatedCount });

  } catch (error) {
    console.error(`Error updating favorite status for ticker ${tickerToUpdate}:`, error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
