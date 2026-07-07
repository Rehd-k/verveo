'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import RetailerPageHeader from '@/components/retailer/RetailerPageHeader';
import { useRetailerShell } from '@/components/retailer/RetailerShellContext';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { VENUE_CATEGORIES } from '@/lib/locationTargeting';
import { RETAILER_CITIES } from '@/lib/retailerCities';
import { useRetailer } from '@/store/retailerStore';

export default function RetailerSettingsPage() {
  const { toggleMobile } = useRetailerShell();
  const { profile, user, loading, fetchProfile, updateProfile } = useRetailer();
  const [businessName, setBusinessName] = useState('');
  const [venueType, setVenueType] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    setBusinessName(profile.businessName);
    setVenueType(profile.venueType);
    setCity(profile.city);
    setAddress(profile.address || '');
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ businessName, venueType, city, address });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <RetailerPageHeader
        title="Settings"
        description="Manage your partner profile and account details."
        onMenuClick={toggleMobile}
      />

      <div className="p-4 md:p-8">
        <form onSubmit={handleSave} className="mx-auto max-w-xl space-y-4 rounded-2xl border border-white/10 bg-card-dark/80 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="mt-1 text-sm font-medium text-white">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Account status</p>
              <div className="mt-1">
                <StatusBadge status={profile?.status || 'pending'} />
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Stock allowance</p>
              <p className="mt-1 text-sm font-medium text-white">
                {(profile?.allowance ?? 0).toLocaleString()} packs
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-white/70">
            Business name
            <input
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
            />
          </label>

          <label className="block text-sm font-medium text-white/70">
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

          <label className="block text-sm font-medium text-white/70">
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

          <label className="block text-sm font-medium text-white/70">
            Address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-white outline-none focus:border-primary/70"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
