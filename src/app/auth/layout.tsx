
import type { Metadata } from 'next';
import Link from 'next/link';
import { SignalHigh } from 'lucide-react'; // Using a thematic icon

export const metadata: Metadata = {
  title: 'Authentification - SignalStream',
  description: 'Connectez-vous ou créez un compte pour accéder à SignalStream.',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      <header className="py-6 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 group w-fit">
          <SignalHigh className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <span className="text-3xl font-bold text-primary tracking-tight">
            SignalStream
          </span>
        </Link>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {children}
      </main>
      <footer className="w-full text-center py-6 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SignalStream. Tous droits réservés.
      </footer>
    </div>
  );
}
