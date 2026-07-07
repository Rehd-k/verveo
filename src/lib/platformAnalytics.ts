import mongoose from 'mongoose';
import { Scan } from '@/models/Scan';
import { Campaign } from '@/models/Campaign';
import type { AnalyticsRange } from '@/lib/analytics';
import { formatDeviceLabel, formatLocationLabel } from '@/lib/tracking';

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

export interface PlatformAnalytics {
  totalScans: number;
  uniqueVisitors: number;
  totalCampaigns: number;
  liveCampaigns: number;
  topCampaigns: { id: string; title: string; scans: number }[];
  topLocations: { name: string; count: number }[];
  devices: { os: string; count: number }[];
  timeSeries: { time: string; count: number }[];
}

export async function getPlatformAnalytics(
  range: AnalyticsRange = '7d'
): Promise<PlatformAnalytics> {
  const since = new Date(Date.now() - rangeToMs(range));

  const [totalScans, uniqueResult, totalCampaigns, liveCampaigns, topCampaigns, topLocations, devices, timeSeries] =
    await Promise.all([
      Scan.countDocuments({ createdAt: { $gte: since } }),
      Scan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $ifNull: ['$visitorId', '$ip'] } } },
        { $count: 'count' },
      ]),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'live' }),
      Scan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$campaignId', scans: { $sum: 1 } } },
        { $sort: { scans: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'campaigns',
            localField: '_id',
            foreignField: '_id',
            as: 'campaign',
          },
        },
        { $unwind: { path: '$campaign', preserveNullAndEmptyArrays: true } },
      ]),
      Scan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $ifNull: ['$location.city', '$location.region', 'Unknown'] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Scan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $ifNull: ['$device.os', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Scan.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: range === '30d' ? null : { $hour: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
      ]),
    ]);

  return {
    totalScans,
    uniqueVisitors: uniqueResult[0]?.count ?? 0,
    totalCampaigns,
    liveCampaigns,
    topCampaigns: topCampaigns.map((row) => ({
      id: row._id?.toString(),
      title: row.campaign?.title || 'Unknown',
      scans: row.scans,
    })),
    topLocations: topLocations.map((row) => ({
      name: row._id || 'Unknown',
      count: row.count,
    })),
    devices: devices.map((row) => ({
      os: row._id || 'Unknown',
      count: row.count,
    })),
    timeSeries: timeSeries.map((row) => {
      const { year, month, day, hour } = row._id;
      const date =
        range === '30d'
          ? new Date(year, month - 1, day)
          : new Date(year, month - 1, day, hour ?? 0);
      return { time: date.toISOString(), count: row.count };
    }),
  };
}

export function formatScanForFeed(scan: {
  _id?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId | { title?: string };
  device?: { type?: string; os?: string; browser?: string; model?: string };
  location?: { city?: string; region?: string; country?: string; lat?: number; lng?: number };
  lat?: number;
  lng?: number;
  createdAt?: Date;
}) {
  const campaign = scan.campaignId as { title?: string; _id?: mongoose.Types.ObjectId } | undefined;
  return {
    id: scan._id?.toString(),
    campaignId:
      typeof scan.campaignId === 'object' && scan.campaignId && '_id' in scan.campaignId
        ? (scan.campaignId as { _id?: mongoose.Types.ObjectId })._id?.toString()
        : scan.campaignId?.toString(),
    campaignTitle: campaign?.title,
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
    createdAt: scan.createdAt,
  };
}
