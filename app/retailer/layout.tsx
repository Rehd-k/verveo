'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/store/authStore';
import { authHeaders } from '@/lib/fetchAuth';
import { useRetailer } from '@/store/retailerStore';
import RetailerSidebar from '@/components/retailer/RetailerSidebar';
import { RetailerShellProvider, useRetailerShell } from '@/components/retailer/RetailerShellContext';
import type { Retailer } from '@/types';

function RetailerLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized } = useAuth();
  const { profile, fetchProfile } = useRetailer();
  const { mobileOpen, setMobileOpen } = useRetailerShell();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [localProfile, setLocalProfile] = useState<Retailer | null>(null);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.role !== 'retailer') {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
      return;
    }

    const checkProfile = async () => {
      const isOnboarding = pathname === '/retailer/onboarding';

      const res = await fetch('/api/retailer/me', { headers: authHeaders() });

      if (res.status === 404 && !isOnboarding) {
        router.push('/retailer/onboarding');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLocalProfile(data.retailer);
        await fetchProfile();

        if (isOnboarding) {
          router.push('/retailer/dashboard');
          return;
        }

        const status = data.retailer?.status as Retailer['status'] | undefined;
        const isSettings = pathname === '/retailer/settings';

        if (status === 'suspended' && !isSettings) {
          router.push('/retailer/settings');
          return;
        }
      }

      setCheckingProfile(false);
    };

    checkProfile();
  }, [initialized, pathname, router, user, fetchProfile]);

  if (!initialized || !user || checkingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  const isOnboarding = pathname === '/retailer/onboarding';
  const activeProfile = profile || localProfile;

  return (
    <section className="min-h-screen bg-background text-foreground">
      {!isOnboarding && (
        <RetailerSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          profile={activeProfile}
        />
      )}
      <main className={isOnboarding ? 'min-w-0' : 'min-w-0 md:pl-64'}>{children}</main>
    </section>
  );
}

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RetailerShellProvider>
      <RetailerLayoutInner>{children}</RetailerLayoutInner>
    </RetailerShellProvider>
  );
}
