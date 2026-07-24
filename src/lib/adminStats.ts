import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Campaign } from '@/models/Campaign';
import { Order } from '@/models/Order';
import { Scan } from '@/models/Scan';
import { Proof } from '@/models/Proof';
import type { AdminStats, OrderWithDetails } from '@/types';

export async function getAdminStats(): Promise<AdminStats> {
  await dbConnect();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activeStatuses = ['processing', 'printing', 'dispatched', 'live'];

  const [
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    revenueResult,
    scansToday,
    scans7d,
    pendingProofs,
    statusAgg,
    recentOrders,
    recentScans,
    signupsAgg,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: { $in: activeStatuses } }),
    Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Scan.countDocuments({ createdAt: { $gte: todayStart } }),
    Scan.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Proof.countDocuments({ status: 'pending' }),
    Campaign.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('campaignId', 'title status')
      .populate('userId', 'email name')
      .lean(),
    Scan.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('campaignId', 'title')
      .lean(),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
    Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
  ]);

  const campaignsByStatus: Record<string, number> = {};
  for (const row of statusAgg) {
    campaignsByStatus[row._id] = row.count;
  }

  const signupsByDay = signupsAgg.map((row) => {
    const { year, month, day } = row._id;
    return {
      date: new Date(year, month - 1, day).toISOString().slice(0, 10),
      count: row.count,
    };
  });

  const revenueByDay = revenueAgg.map((row) => {
    const { year, month, day } = row._id;
    return {
      date: new Date(year, month - 1, day).toISOString().slice(0, 10),
      amount: row.amount,
    };
  });

  return {
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    totalRevenue: revenueResult[0]?.total ?? 0,
    scansToday,
    scans7d,
    pendingProofs,
    campaignsByStatus,
    recentOrders: recentOrders.map((o) => ({
      _id: o._id?.toString(),
      campaignId: (o.campaignId as { _id?: { toString(): string } })?._id?.toString() || '',
      userId: (o.userId as { _id?: { toString(): string } })?._id?.toString() || '',
      amount: o.amount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      transactionId: o.transactionId,
      createdAt: o.createdAt,
      campaign: o.campaignId,
      user: o.userId,
    })) as OrderWithDetails[],
    recentScans: recentScans.map((s) => ({
      _id: s._id?.toString(),
      campaignId: (s.campaignId as { _id?: { toString(): string } })?._id?.toString() || s.campaignId?.toString(),
      device: s.device,
      location: s.location,
      createdAt: s.createdAt,
    })),
    signupsByDay,
    revenueByDay,
  };
}
