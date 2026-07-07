import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function getTrackingUrl(campaignId: string): string {
  return `${getAppBaseUrl()}/api/qr/${campaignId}`;
}

export function parseClientIp(forwardedFor: string | null, realIp: string | null): string {
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  return realIp?.trim() || '';
}

export function createVisitorId(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .slice(0, 16);
}

export interface ParsedDevice {
  type: string;
  os: string;
  browser: string;
  model: string;
}

export function parseDevice(userAgent: string): ParsedDevice {
  const result = new UAParser(userAgent).getResult();
  return {
    type: result.device.type || 'desktop',
    os: result.os.name || 'Unknown',
    browser: result.browser.name || 'Unknown',
    model: result.device.model || result.device.vendor || 'Unknown',
  };
}

export interface ParsedLocation {
  lat?: number;
  lng?: number;
  city?: string;
  region?: string;
  country?: string;
}

export function appendUtmParams(url: string, campaignId: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', 'addizi');
    parsed.searchParams.set('utm_medium', 'qr');
    parsed.searchParams.set('utm_campaign', campaignId);
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}utm_source=addizi&utm_medium=qr&utm_campaign=${campaignId}`;
  }
}

export function formatDeviceLabel(device: ParsedDevice): string {
  if (device.model && device.model !== 'Unknown') {
    return device.model;
  }
  if (device.os && device.os !== 'Unknown') {
    return `${device.os} device`;
  }
  return 'Unknown device';
}

export function formatLocationLabel(location: ParsedLocation): string {
  if (location.city) return location.city;
  if (location.region) return location.region;
  if (location.country) return location.country;
  if (location.lat != null && location.lng != null) {
    return `Near ${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
  }
  return 'Unknown location';
}
