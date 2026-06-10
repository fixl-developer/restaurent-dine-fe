/**
 * Restaurant DTO — mirrors the backend `RestaurantModel`.
 * Imported by the settings + invoicing flows.
 */

export type TaxType = 'cgst' | 'sgst' | 'igst' | 'service' | 'other';
export type ApplyOn = 'subtotal' | 'item';
export type RoundingRule = 'nearest_rupee' | 'nearest_50_paise' | 'none';
export type GatewayProvider = 'razorpay' | 'phonepe' | 'stripe';

export interface OpeningHour {
  dayOfWeek: number; // 0 = Sunday .. 6 = Saturday
  open: string; // "09:00"
  close: string;
  isClosed: boolean;
}

export interface TaxLine {
  name: string;
  rate: number;
  type: TaxType;
  applyOn: ApplyOn;
}

export interface RestaurantDto {
  _id: string;
  singleton: 'main';
  brand: {
    name: string;
    logoUrl?: string;
    logoPublicId?: string;
    brandColor?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    location?: {
      city?: string;
      state?: string;
      country: string;
      postalCode?: string;
      lat?: number;
      lng?: number;
    };
    openingHours: OpeningHour[];
  };
  tax: {
    gstin?: string;
    taxes: TaxLine[];
    serviceChargePercent: number;
    roundingRule: RoundingRule;
    taxInclusive: boolean;
  };
  currency: string;
  timeZone: string;
  languages: {
    primary: string;
    supported: string[];
  };
  receipt: {
    headerLines: string[];
    footerLines: string[];
    fssaiLicense?: string;
    returnPolicy?: string;
    showLogo: boolean;
    showGstin: boolean;
  };
  paymentMethods: {
    cash: boolean;
    upi: boolean;
    card: boolean;
    wallet: boolean;
    onlinePrepay: boolean;
  };
  operatingModes: {
    dineIn: boolean;
    takeaway: boolean;
    onlinePrepay: boolean;
  };
  gateway: {
    provider?: GatewayProvider;
  };
  createdAt: string;
  updatedAt: string;
}

export type RestaurantPatch = Partial<{
  brand: Partial<Omit<RestaurantDto['brand'], 'logoUrl' | 'logoPublicId'>>;
  tax: Partial<RestaurantDto['tax']>;
  receipt: Partial<RestaurantDto['receipt']>;
  paymentMethods: Partial<RestaurantDto['paymentMethods']>;
  operatingModes: Partial<RestaurantDto['operatingModes']>;
  languages: Partial<RestaurantDto['languages']>;
  gateway: Partial<RestaurantDto['gateway']>;
  currency: string;
  timeZone: string;
}>;

// English day names indexed by dayOfWeek (0 = Sunday)
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
