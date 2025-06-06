import { NextResponse, type NextRequest } from 'next/server';
import type { Signal, SignalCategory } from '@/lib/types';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// In-memory store for signals 
// Exporting for use in other API routes.
export let signals: Signal[] = [
  { id: randomUUID(), ticker: 'BTCUSDT', price: 68500.75, time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), action: 'buy', category: 'crypto', isFavorite: false },
  { id: randomUUID(), ticker: 'ETHUSDT', price: 3600.20, time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), action: 'sell', category: 'crypto', isFavorite: false },
  { id: randomUUID(), ticker: 'SOLUSDT', price: 150.50, time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), action: 'buy', category: 'crypto', isFavorite: false },
  { id: randomUUID(), ticker: 'EURUSD', price: 1.0850, time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), action: 'sell', category: 'forex', isFavorite: false },
  { id: randomUUID(), ticker: 'XAUUSD', price: 2350.00, time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), action: 'buy', category: 'commodities', isFavorite: false },
];

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-token'; // Store this securely!

const signalSchema = z.object({
  ticker: z.string().min(1, "Ticker est requis"),
  price: z.number().positive("Le prix doit être positif"),
  time: z.string().datetime("Format de date invalide").optional(),
  action: z.enum(['buy', 'sell'], { message: "L'action doit être 'buy' ou 'sell'" }),
  category: z.enum(['crypto', 'forex', 'commodities'], { message: "La catégorie doit être 'crypto', 'forex', ou 'commodities'" }),
  isFavorite: z.boolean().optional(), 
});

export async function GET(request: NextRequest) {
  try {
    // Client-side will apply global favorites after fetching.
    // Server returns the raw `isFavorite` status from the in-memory store.
    const sortedSignals = [...signals].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return NextResponse.json(sortedSignals);
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const providedSecret = request.headers.get('X-Webhook-Secret');
  if (providedSecret !== WEBHOOK_SECRET) {
    console.warn("Unauthorized webhook attempt. Provided secret:", providedSecret);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsedSignal = signalSchema.safeParse(body);

    if (!parsedSignal.success) {
      return NextResponse.json({ message: 'Invalid signal data', errors: parsedSignal.error.flatten().fieldErrors }, { status: 400 });
    }

    const { ticker, price, action, category } = parsedSignal.data;
    const time = parsedSignal.data.time || new Date().toISOString();

    // For direct webhook POSTs, isFavorite will be what's sent or default to false.
    // The client's `addSignal` function (used by `simulateWebhook`) correctly sets
    // `isFavorite` based on global ticker preferences before POSTing.
    const newSignal: Signal = {
      id: randomUUID(),
      ticker: ticker.toUpperCase(),
      price,
      time,
      action,
      category,
      isFavorite: parsedSignal.data.isFavorite || false,
    };

    signals.unshift(newSignal); 
    if (signals.length > 200) { 
        signals = signals.slice(0, 200);
    }

    console.log("New signal received and stored:", newSignal);
    return NextResponse.json(newSignal, { status: 201 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof SyntaxError) { 
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
