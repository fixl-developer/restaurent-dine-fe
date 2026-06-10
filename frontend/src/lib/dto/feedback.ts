/** Guest feedback DTOs. */

export const FEEDBACK_TAG_CHIPS = [
  'food',
  'service',
  'speed',
  'cleanliness',
  'ambience',
  'pricing',
  'staff',
  'portion',
  'taste',
] as const;
export type FeedbackTagChip = (typeof FEEDBACK_TAG_CHIPS)[number];

export type FeedbackChannel = 'sms' | 'whatsapp' | 'email';
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';
export type FeedbackOrderChannel = 'dine_in' | 'window' | 'assisted';

export interface FeedbackReplyDto {
  text: string;
  sentVia: FeedbackChannel;
  sentAt: string;
  sentById?: string;
}

export interface FeedbackDto {
  _id: string;
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerPhone?: string;
  customerName?: string;
  rating: number;
  text?: string;
  tagChips: FeedbackTagChip[];
  sentiment: FeedbackSentiment;
  reply?: FeedbackReplyDto;
  acknowledged: boolean;
  channel: FeedbackOrderChannel;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSummary {
  total: number;
  avgRating: number | null;
  sentiment: { positive: number; neutral: number; negative: number };
  replied: number;
  tagDistribution: Array<{ tag: string; count: number }>;
}

export interface ReplyFeedbackInput {
  text: string;
  via: FeedbackChannel;
}

export const SENTIMENT_STYLES: Record<FeedbackSentiment, { bg: string; text: string; label: string }> = {
  positive: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Positive' },
  neutral: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Neutral' },
  negative: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Negative' },
};
