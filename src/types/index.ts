export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  password?: string;
  role: 'advertiser' | 'retailer' | 'admin';
  walletBalance?: number;
  campaignCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Campaign {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  description?: string;
  locations: string[]; // LGAs/zones
  venueTypes: string[];
  productType: 'cup' | 'box' | 'bag' | 'pizza-box';
  quantity: number;
  design: {
    imageUrl?: string;
    previewUrl?: string; // data URL or hosted preview
    fileName?: string;
    text?: string;
    colors?: string[];
    dpiChecked?: boolean;
  };
  qrCode?: string;
  ctaUrl?: string;
  budget: number;
  status: 'draft' | 'processing' | 'printing' | 'dispatched' | 'live' | 'completed';
  stats?: {
    scans: number;
    impressions: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Retailer {
  _id?: string;
  id?: string;
  userId: string;
  businessName: string;
  venueType: string;
  city: string;
  status: 'pending' | 'active' | 'suspended';
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  allowance: number;
  currentStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockOrder {
  _id?: string;
  id?: string;
  retailerId: string;
  quantity: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  notes?: string;
  fulfilledAt?: Date | string;
  createdAt?: Date | string;
  retailer?: Pick<Retailer, 'id' | 'businessName' | 'city'>;
}

export interface Order {
  _id?: string;
  id?: string;
  campaignId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod: 'paystack' | 'flutterwave' | 'bank_transfer';
  transactionId?: string;
  proofImageUrl?: string;
  proofNote?: string;
  proofSubmittedAt?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  campaign?: { title?: string };
}

export interface Scan {
  _id?: string;
  campaignId: string;
  timestamp?: Date;
  createdAt?: Date;
  ip?: string;
  userAgent?: string;
  visitorId?: string;
  device?: {
    type?: string;
    os?: string;
    browser?: string;
    model?: string;
  };
  location?: {
    lat?: number;
    lng?: number;
    city?: string;
    region?: string;
    country?: string;
  };
  lat?: number;
  lng?: number;
  referrer?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface Proof {
  _id?: string;
  id?: string;
  retailerId: string;
  campaignId?: string;
  imageUrl: string;
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  retailer?: Retailer;
  campaign?: Campaign;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlatformSettings {
  _id?: string;
  productPricing: {
    cup: number;
    box: number;
    bag: number;
    'pizza-box': number;
  };
  defaultWalletCredit: number;
  maintenanceMode: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CampaignWithOwner extends Campaign {
  owner?: Pick<User, 'id' | 'email' | 'name'>;
}

export interface OrderWithDetails extends Order {
  campaign?: Pick<Campaign, '_id' | 'title' | 'status'>;
  user?: Pick<User, '_id' | 'email' | 'name'>;
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  scansToday: number;
  scans7d: number;
  pendingProofs: number;
  campaignsByStatus: Record<string, number>;
  recentOrders: OrderWithDetails[];
  recentScans: Scan[];
  signupsByDay: { date: string; count: number }[];
  revenueByDay: { date: string; amount: number }[];
}
