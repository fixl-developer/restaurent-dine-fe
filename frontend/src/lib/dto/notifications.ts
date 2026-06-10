/** Notification templates + logs + events DTOs. */

export type NotificationChannel = 'sms' | 'whatsapp' | 'email' | 'push';
export type NotificationAudience = 'customer' | 'staff' | 'owner';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'skipped' | 'mocked';

export const NOTIFICATION_CHANNELS: NotificationChannel[] = ['sms', 'whatsapp', 'email', 'push'];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  email: 'Email',
  push: 'Push',
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  queued: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
  skipped: 'Skipped',
  mocked: 'Mocked',
};

export const NOTIFICATION_STATUS_STYLES: Record<NotificationStatus, string> = {
  queued: 'bg-blue-50 text-blue-700 border-blue-200',
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  skipped: 'bg-gray-50 text-gray-500 border-gray-200',
  mocked: 'bg-violet-50 text-violet-700 border-violet-200',
};

export const NOTIFICATION_AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  customer: 'Customer',
  staff: 'Staff',
  owner: 'Owner',
};

export interface NotificationEventDef {
  key: string;
  description: string;
  audience: NotificationAudience;
  channels: NotificationChannel[];
  variables: string[];
}

export interface NotificationTemplateDto {
  _id: string;
  eventKey: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  isActive: boolean;
  notes?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  eventKey: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  notes?: string;
}

export interface UpdateTemplateInput {
  subject?: string;
  body?: string;
  notes?: string;
  isActive?: boolean;
}

export interface PreviewTemplateInput {
  body: string;
  subject?: string;
  payload: Record<string, unknown>;
}

export interface PreviewTemplateResult {
  body: string;
  subject?: string;
  missing: string[];
}

export interface TestSendInput {
  eventKey: string;
  channel?: NotificationChannel;
  to: string;
  payload: Record<string, unknown>;
}

export interface NotificationLogDto {
  _id: string;
  eventKey: string;
  channel: NotificationChannel;
  to: string;
  subject?: string;
  body: string;
  status: NotificationStatus;
  providerMessageId?: string;
  errorMessage?: string;
  relatedOrderId?: string;
  relatedInvoiceId?: string;
  relatedCustomerId?: string;
  triggeredById?: string;
  attempts: number;
  sentAt?: string;
  createdAt: string;
}
