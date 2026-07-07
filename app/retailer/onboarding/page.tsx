'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2, MapPin, Store } from 'lucide-react';
import { VENUE_CATEGORIES } from '@/lib/locationTargeting';
import { RETAILER_CITIES } from '@/lib/retailerCities';
import { useRetailer } from '@/store/retailerStore';

export default function RetailerOnboardingPage() {
  const router = useRouter();
  const { submitOnboarding } = useRetailer();
  const [businessName, setBusinessName] = useState('');
  const [venueType, setVenueType] = useState<string>(VENUE_CATEGORIES[0]);
  const [city, setCity] = useState(RETAILER_CITIES[0] || 'Lagos');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const useLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success('Location captured');
      },
      () => toast.error('Could not get your location')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitOnboarding({
        businessName,
        venueType,
        city,
        address: address || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      toast.success('Profile created. Awaiting admin approval.');
      router.push('/retailer/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Onboarding failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-card-dark p-6 md:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Store className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Set up your partner profile</h1>
            <p className="text-sm text-text-secondary">
              Tell us about your venue so we can match you with live campaigns.
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          After setup, an admin will review and activate your account before you can request stock or submit proofs.
        </p>

        <label className="mt-6 block text-sm font-medium text-white/70">
          Business name
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
            placeholder="e.g. Quick Bite Surulere"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-white/70">
          Venue type
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
          >
            {VENUE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium text-white/70">
          City
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
          >
            {RETAILER_CITIES.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium text-white/70">
          Address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
            placeholder="Street address or landmark"
          />
        </label>

        <div className="mt-4">
          <button
            type="button"
            onClick={useLocation}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-text-secondary transition hover:border-primary/40 hover:text-white"
          >
            <MapPin className="size-4" />
            {coords
              ? `Location saved (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              : 'Use my current location (optional)'}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Creating profile...' : 'Complete setup'}
        </button>
      </form>
    </div>
  );
}
