/** Users + Roles + Audit DTOs. */

export interface UserRoleStub {
  key: string;
  name: string;
  permissions: string[];
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  role: UserRoleStub | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  roleKey: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  roleKey?: string;
  isActive?: boolean;
  password?: string;
}

// ── Roles ────────────────────────────────────────────────────────────────────
export interface RoleDto {
  _id: string;
  key: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ── Audit ────────────────────────────────────────────────────────────────────
export interface AuditLogDto {
  _id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  ip?: string;
  requestId?: string;
  at: string;
}

// ── Permission grouping helpers ──────────────────────────────────────────────
export function groupPermissions(perms: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const p of perms) {
    if (p === '*') {
      groups.wildcard = ['*'];
      continue;
    }
    const [ns] = p.split(':');
    if (!groups[ns]) groups[ns] = [];
    groups[ns].push(p);
  }
  return groups;
}

export const PERMISSION_GROUP_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  user: 'Users',
  role: 'Roles',
  menu: 'Menu',
  table: 'Tables',
  qr: 'QR Codes',
  order: 'Orders',
  kds: 'Kitchen Display',
  billing: 'Billing',
  payment: 'Payments',
  inventory: 'Inventory',
  customer: 'Customers',
  feedback: 'Feedback',
  discount: 'Discounts',
  coupon: 'Coupons',
  loyalty: 'Loyalty',
  notification: 'Notifications',
  report: 'Reports',
  audit: 'Audit Logs',
  day: 'Day Close',
  wildcard: 'Super Admin',
};
