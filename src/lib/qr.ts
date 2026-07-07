import QRCode from 'qrcode';
import { getTrackingUrl } from '@/lib/tracking';

export async function generateCampaignQrCode(campaignId: string): Promise<string> {
  const trackingUrl = getTrackingUrl(campaignId);
  return QRCode.toDataURL(trackingUrl, {
    width: 220,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}
