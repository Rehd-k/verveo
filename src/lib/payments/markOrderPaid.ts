import { Order } from '@/models/Order';
import { Campaign } from '@/models/Campaign';

export async function markOrderPaid(orderId: string, transactionId?: string) {
  const order = await Order.findById(orderId);
  if (!order || order.status === 'paid') return order;

  await Order.findByIdAndUpdate(orderId, {
    status: 'paid',
    ...(transactionId ? { transactionId } : {}),
  });

  await Campaign.findByIdAndUpdate(order.campaignId, { status: 'processing' });
  return order;
}
