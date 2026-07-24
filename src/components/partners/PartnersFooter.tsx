import Link from 'next/link';
import { Radar } from 'lucide-react';

export default function PartnersFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/40 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-blue-400">
              <Radar className="size-4" />
            </div>
            <span className="font-display text-lg font-bold">Verveo Partners</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/50">
            Retail partner operations for branded packaging campaigns across Nigeria.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/" className="text-sm text-white/50 hover:text-white">For Advertisers</Link>
          <Link href="/auth/signup?role=retailer" className="text-sm text-white/50 hover:text-white">Apply</Link>
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white">Sign in</Link>
          <Link href="#partner-faq" className="text-sm text-white/50 hover:text-white">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
