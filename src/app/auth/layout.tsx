
import type { Metadata } from 'next';
import Link from 'next/link';
import { OnlySignalsLogo } from '@/components/common/only-signals-logo';

export const metadata: Metadata = {
  title: 'Authentification - OnlySignals',
  description: 'Connectez-vous ou créez un compte pour accéder à OnlySignals.',
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
          <OnlySignalsLogo height={40} className="transition-transform group-hover:scale-105" />
        </Link>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {children}
      </main>
      <footer className="w-full text-center py-6 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} OnlySignals. Tous droits réservés.
      </footer>
    </div>
  );
}
