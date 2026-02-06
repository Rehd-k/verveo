export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  password?: string;
  role: 'advertiser' | 'retailer' | 'admin';
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
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  allowance: number;
  currentStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id?: string;
  id?: string;
  campaignId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod: 'paystack' | 'flutterwave';
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Scan {
  _id?: string;
  campaignId: string;
  timestamp?: Date;
  ip?: string;
  userAgent?: string;
  lat?: number;
  lng?: number;
}

export interface Proof {
  _id?: string;
  retailerId: string;
  campaignId?: string;
  imageUrl: string; // stored path or URL
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
