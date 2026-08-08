import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, isAuthUser } from '@/lib/apiAuth';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/platformSettings';

const patchSettingsSchema = z.object({
  productPricing: z
    .object({
      cup: z.number().optional(),
      box: z.number().optional(),
      bag: z.number().optional(),
      'pizza-box': z.number().optional(),
    })
    .optional(),
  defaultWalletCredit: z.number().optional(),
  defaultDesignCredit: z.number().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const settings = await getPlatformSettings();
    const bankConfigured = !!(
      settings.bankAccountName?.trim() &&
      settings.bankAccountNumber?.trim() &&
      settings.bankName?.trim()
    );

    return NextResponse.json({
      settings,
      env: {
        paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
        flutterwaveConfigured: !!process.env.FLUTTERWAVE_SECRET_KEY,
        bankTransferConfigured: bankConfigured,
        mapboxConfigured: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
      },
    });
  } catch (error) {
    console.error('Admin settings get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!isAuthUser(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = patchSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const current = await getPlatformSettings();
    const updates = {
      productPricing: {
        ...current.productPricing,
        ...parsed.data.productPricing,
      },
      defaultWalletCredit: parsed.data.defaultWalletCredit ?? current.defaultWalletCredit,
      defaultDesignCredit: parsed.data.defaultDesignCredit ?? current.defaultDesignCredit,
      bankAccountName: parsed.data.bankAccountName ?? current.bankAccountName,
      bankAccountNumber: parsed.data.bankAccountNumber ?? current.bankAccountNumber,
      bankName: parsed.data.bankName ?? current.bankName,
      maintenanceMode: parsed.data.maintenanceMode ?? current.maintenanceMode,
    };

    const settings = await updatePlatformSettings(updates);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Admin settings patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
