import mongoose from 'mongoose';
import { Scan } from '@/models/Scan';
import { formatDeviceLabel, formatLocationLabel } from '@/lib/tracking';

export type AnalyticsRange = '24h' | '7d' | '30d';

export interface AnalyticsSummary {
  totalScans: number;
  uniqueUsers: number;
  conversionRate: number;
  impressions: number;
  scansPerUser: number;
  changes: {
    totalScans: number;
    uniqueUsers: number;
    conversionRate: number;
  };
}

export interface TimeSeriesPoint {
  time: string;
  count: number;
}

export interface LocationStat {
  name: string;
  count: number;
  percent: number;
}

export interface DeviceStat {
  os: string;
  count: number;
  percent: number;
}

export interface PeakHour {
  label: string;
  count: number;
}

export interface RecentScan {
  device: string;
  location: string;
  timeAgo: string;
  createdAt: string;
}

export interface ScanMapPoint {
  lat: number;
  lng: number;
}

export interface CampaignAnalytics {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesPoint[];
  topLocations: LocationStat[];
  devices: DeviceStat[];
  peakHour: PeakHour;
  recentScans: RecentScan[];
  scanMap: ScanMapPoint[];
}

function rangeToMs(range: AnalyticsRange): number {
  switch (range) {
    case '7d':
      return 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

function calcConversionRate(scans: number, impressions: number): number {
  if (!impressions) return 0;
  return Math.round((scans / impressions) * 10000) / 100;
}

function calcPercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return seconds <= 1 ? 'Just now' : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatPeakHourLabel(hour: number): string {
  const end = (hour + 1) % 24;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hour)}:00 - ${pad(end)}:00`;
}

async function countScans(
  campaignId: mongoose.Types.ObjectId,
  since?: Date,
  until?: Date
): Promise<number> {
  const filter: Record<string, unknown> = { campaignId };
  if (since || until) {
    filter.createdAt = {};
    if (since) (filter.createdAt as Record<string, Date>).$gte = since;
    if (until) (filter.createdAt as Record<string, Date>).$lt = until;
  }
  return Scan.countDocuments(filter);
}

async function countUniqueUsers(
  campaignId: mongoose.Types.ObjectId,
  since?: Date,
  until?: Date
): Promise<number> {
  const match: Record<string, unknown> = { campaignId };
  if (since || until) {
    match.createdAt = {};
    if (since) (match.createdAt as Record<string, Date>).$gte = since;
    if (until) (match.createdAt as Record<string, Date>).$lt = until;
  }

  const result = await Scan.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $ifNull: ['$visitorId', '$ip'],
        },
      },
    },
    { $count: 'count' },
  ]);

  return result[0]?.count ?? 0;
}

async function buildTimeSeries(
  campaignId: mongoose.Types.ObjectId,
  since: Date,
  range: AnalyticsRange
): Promise<TimeSeriesPoint[]> {
  const groupByDay = range === '30d';

  const pipeline = [
    { $match: { campaignId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: groupByDay
          ? {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            }
          : {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: { $hour: '$createdAt' },
            },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
  ];

  const rows = await Scan.aggregate(pipeline as mongoose.PipelineStage[]);

  return rows.map((row) => {
    const { year, month, day, hour } = row._id;
    const date = groupByDay
      ? new Date(year, month - 1, day)
      : new Date(year, month - 1, day, hour ?? 0);
    return { time: date.toISOString(), count: row.count };
  });
}

async function buildTopLocations(
  campaignId: mongoose.Types.ObjectId,
  since: Date,
  total: number
): Promise<LocationStat[]> {
  const rows = await Scan.aggregate([
    { $match: { campaignId, createdAt: { $gte: since } } },
    {
      $project: {
        name: {
          $let: {
            vars: {
              lat: { $ifNull: ['$location.lat', '$lat'] },
              lng: { $ifNull: ['$location.lng', '$lng'] },
            },
            in: {
              $ifNull: [
                '$location.city',
                {
                  $ifNull: [
                    '$location.region',
                    {
                      $ifNull: [
                        '$location.country',
                        {
                          $cond: [
                            {
                              $and: [
                                { $ne: ['$$lat', null] },
                                { $ne: ['$$lng', null] },
                              ],
                            },
                            {
                              $concat: [
                                'Near ',
                                { $toString: { $round: ['$$lat', 2] } },
                                ', ',
                                { $toString: { $round: ['$$lng', 2] } },
                              ],
                            },
                            'Unknown',
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    { $group: { _id: '$name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  return rows.map((row) => ({
    name: row._id || 'Unknown',
    count: row.count,
    percent: total ? Math.round((row.count / total) * 100) : 0,
  }));
}

async function buildDeviceStats(
  campaignId: mongoose.Types.ObjectId,
  since: Date,
  total: number
): Promise<DeviceStat[]> {
  const rows = await Scan.aggregate([
    { $match: { campaignId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $ifNull: ['$device.os', 'Unknown'] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  return rows.map((row) => ({
    os: row._id || 'Unknown',
    count: row.count,
    percent: total ? Math.round((row.count / total) * 100) : 0,
  }));
}

async function buildPeakHour(
  campaignId: mongoose.Types.ObjectId,
  since: Date
): Promise<PeakHour> {
  const rows = await Scan.aggregate([
    { $match: { campaignId, createdAt: { $gte: since } } },
    { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  if (!rows.length) {
    return { label: '—', count: 0 };
  }

  return {
    label: formatPeakHourLabel(rows[0]._id),
    count: rows[0].count,
  };
}

async function buildRecentScans(campaignId: mongoose.Types.ObjectId): Promise<RecentScan[]> {
  const scans = await Scan.find({ campaignId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return scans.map((scan) => {
    const createdAt = scan.createdAt ? new Date(scan.createdAt) : new Date();
    return {
      device: formatDeviceLabel({
        type: scan.device?.type || 'desktop',
        os: scan.device?.os || 'Unknown',
        browser: scan.device?.browser || 'Unknown',
        model: scan.device?.model || 'Unknown',
      }),
      location: formatLocationLabel({
        city: scan.location?.city,
        region: scan.location?.region,
        country: scan.location?.country,
        lat: scan.location?.lat ?? scan.lat,
        lng: scan.location?.lng ?? scan.lng,
      }),
      timeAgo: formatTimeAgo(createdAt),
      createdAt: createdAt.toISOString(),
    };
  });
}

async function buildScanMap(
  campaignId: mongoose.Types.ObjectId,
  since: Date
): Promise<ScanMapPoint[]> {
  const scans = await Scan.find({
    campaignId,
    createdAt: { $gte: since },
    $or: [
      { 'location.lat': { $exists: true, $ne: null } },
      { lat: { $exists: true, $ne: null } },
    ],
  })
    .select('location lat lng')
    .lean();

  return scans
    .map((scan) => {
      const lat = scan.location?.lat ?? scan.lat;
      const lng = scan.location?.lng ?? scan.lng;
      if (lat == null || lng == null) return null;
      return { lat, lng };
    })
    .filter((point): point is ScanMapPoint => point !== null);
}

export async function getCampaignAnalytics(
  campaignId: string,
  impressions: number,
  range: AnalyticsRange = '24h'
): Promise<CampaignAnalytics> {
  const objectId = new mongoose.Types.ObjectId(campaignId);
  const rangeMs = rangeToMs(range);
  const now = Date.now();
  const since = new Date(now - rangeMs);
  const previousSince = new Date(now - rangeMs * 2);
  const previousUntil = since;

  const [totalScans, uniqueUsers, previousScans, previousUniqueUsers] = await Promise.all([
    countScans(objectId, since),
    countUniqueUsers(objectId, since),
    countScans(objectId, previousSince, previousUntil),
    countUniqueUsers(objectId, previousSince, previousUntil),
  ]);

  const allTimeScans = await countScans(objectId);
  const conversionRate = calcConversionRate(allTimeScans, impressions);
  const previousConversionRate = calcConversionRate(previousScans, impressions);
  const scansPerUser = uniqueUsers ? Math.round((totalScans / uniqueUsers) * 10) / 10 : 0;

  const [timeSeries, topLocations, devices, peakHour, recentScans, scanMap] = await Promise.all([
    buildTimeSeries(objectId, since, range),
    buildTopLocations(objectId, since, totalScans),
    buildDeviceStats(objectId, since, totalScans),
    buildPeakHour(objectId, since),
    buildRecentScans(objectId),
    buildScanMap(objectId, since),
  ]);

  return {
    summary: {
      totalScans: allTimeScans,
      uniqueUsers: await countUniqueUsers(objectId),
      conversionRate,
      impressions,
      scansPerUser,
      changes: {
        totalScans: calcPercentChange(totalScans, previousScans),
        uniqueUsers: calcPercentChange(uniqueUsers, previousUniqueUsers),
        conversionRate: Math.round((conversionRate - previousConversionRate) * 10) / 10,
      },
    },
    timeSeries,
    topLocations,
    devices,
    peakHour,
    recentScans,
    scanMap,
  };
}
