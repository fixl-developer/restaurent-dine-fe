import { useMemo, useState } from 'react';
import {
  Star,
  Gift,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Percent,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useLoyaltyConfig,
  useUpdateLoyaltyConfig,
  useLoyaltyAccount,
  useAdjustLoyaltyPoints,
} from '@/hooks/usePromotions';
import { useCategories, useItems } from '@/hooks/useMenu';
import { useCustomers } from '@/hooks/useCustomers';
import {
  DAY_LABELS,
  DISCOUNT_SCOPE_LABELS,
  formatDiscountValue,
  isExpired,
  LOYALTY_HISTORY_LABELS,
  type CouponDto,
  type CreateCouponInput,
  type CreateDiscountInput,
  type DiscountDto,
  type DiscountScope,
  type DiscountType,
  type LoyaltyEarnBase,
  type LoyaltyHistoryEntry,
  type PromoChannel,
  type UpdateLoyaltyConfigInput,
} from '@/lib/dto/promotions';
import {
  customerDisplayName,
  customerInitials,
  type CustomerDto,
} from '@/lib/dto/customers';

type LoyaltyTab = 'discounts' | 'coupons' | 'config' | 'members';

const CHANNEL_LABELS: Record<PromoChannel, string> = {
  dine_in: 'Dine-In',
  window: 'Window',
  assisted: 'Assisted',
};

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminLoyalty() {
  const [tab, setTab] = useState<LoyaltyTab>('discounts');
  const tabs: { id: LoyaltyTab; label: string; icon: React.ElementType }[] = [
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'config', label: 'Loyalty Config', icon: SettingsIcon },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Promotions & Loyalty</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Discounts, coupon codes, and loyalty point management
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-[fadeIn_0.2s_ease-out]">
        {tab === 'discounts' && <DiscountsTab />}
        {tab === 'coupons' && <CouponsTab />}
        {tab === 'config' && <LoyaltyConfigTab />}
        {tab === 'members' && <MembersTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Discounts tab
// ─────────────────────────────────────────────────────────────────────────────
function DiscountsTab() {
  const discountsQuery = useDiscounts();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();
  const [editing, setEditing] = useState<DiscountDto | 'new' | null>(null);

  const items = discountsQuery.data?.items ?? [];
  const active = items.filter((d) => d.isActive).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {active} active · {items.length} total discounts
        </p>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Discount
        </button>
      </div>

      {items.length === 0 && !discountsQuery.isLoading && (
        <EmptyState
          icon={Percent}
          title="No discounts yet"
          subtitle="Create automatic discounts that apply at billing time based on bill amount, channel, category, or item."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((d) => (
          <DiscountCard
            key={d._id}
            discount={d}
            onToggle={() =>
              updateDiscount.mutate({ id: d._id, patch: { isActive: !d.isActive } })
            }
            onEdit={() => setEditing(d)}
            onDelete={async () => {
              if (confirm(`Delete "${d.name}"?`)) {
                await deleteDiscount.mutateAsync(d._id);
              }
            }}
          />
        ))}
      </div>

      {editing && (
        <DiscountEditor
          discount={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function DiscountCard({
  discount,
  onToggle,
  onEdit,
  onDelete,
}: {
  discount: DiscountDto;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        discount.isActive ? 'border-gray-200' : 'border-gray-100 opacity-70'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{discount.name}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">
              {DISCOUNT_SCOPE_LABELS[discount.scope]}
            </p>
          </div>
          <button
            onClick={onToggle}
            title={discount.isActive ? 'Disable' : 'Enable'}
            className={`shrink-0 ${discount.isActive ? 'text-emerald-500' : 'text-gray-300'}`}
          >
            {discount.isActive ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </button>
        </div>
        {discount.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{discount.description}</p>
        )}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-black text-pink-600">
            {formatDiscountValue(discount)}
          </span>
          <span className="text-xs text-gray-400">
            {discount.type === 'percent' ? 'off' : 'flat'}
          </span>
          {discount.maxDiscount && (
            <span className="text-[10px] text-gray-400 ml-2">max ₹{discount.maxDiscount}</span>
          )}
        </div>
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          {discount.minBillAmount > 0 && <p>Min bill ₹{discount.minBillAmount}</p>}
          {discount.channels.length > 0 && (
            <p>Channels: {discount.channels.map((c) => CHANNEL_LABELS[c]).join(', ')}</p>
          )}
          {discount.daysOfWeek.length > 0 && (
            <p>
              Days: {discount.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ')}
              {discount.startTime && ` · ${discount.startTime}-${discount.endTime}`}
            </p>
          )}
          {discount.validUntil && (
            <p
              className={isExpired(discount.validUntil) ? 'text-red-500 font-medium' : ''}
            >
              {isExpired(discount.validUntil) ? 'Expired ' : 'Until '}
              {new Date(discount.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-base font-black text-gray-900">{discount.usageCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Uses</p>
          </div>
          {discount.maxTotalUses && (
            <div>
              <p className="text-base font-black text-gray-900">{discount.maxTotalUses}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cap</p>
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscountEditor({
  discount,
  onClose,
}: {
  discount: DiscountDto | null;
  onClose: () => void;
}) {
  const isNew = discount === null;
  const create = useCreateDiscount();
  const update = useUpdateDiscount();
  const categoriesQuery = useCategories({ includeInactive: false });
  const itemsQuery = useItems({ isActive: true });
  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data?.items ?? [];

  const [form, setForm] = useState<CreateDiscountInput>({
    name: discount?.name ?? '',
    description: discount?.description ?? '',
    type: discount?.type ?? 'percent',
    value: discount?.value ?? 10,
    maxDiscount: discount?.maxDiscount,
    scope: discount?.scope ?? 'bill',
    categoryIds: discount?.categoryIds ?? [],
    itemIds: discount?.itemIds ?? [],
    channels: discount?.channels ?? [],
    minBillAmount: discount?.minBillAmount ?? 0,
    daysOfWeek: discount?.daysOfWeek ?? [],
    startTime: discount?.startTime,
    endTime: discount?.endTime,
    validFrom: discount?.validFrom?.slice(0, 10),
    validUntil: discount?.validUntil?.slice(0, 10),
    maxTotalUses: discount?.maxTotalUses,
  });

  async function submit() {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const payload: CreateDiscountInput = {
      ...form,
      categoryIds: form.scope === 'category' ? form.categoryIds : [],
      itemIds: form.scope === 'item' ? form.itemIds : [],
      channels: form.scope === 'channel' ? form.channels : form.channels,
    };
    if (isNew) {
      await create.mutateAsync(payload);
    } else {
      await update.mutateAsync({ id: discount!._id, patch: payload });
    }
    onClose();
  }

  return (
    <Drawer title={isNew ? 'New Discount' : 'Edit Discount'} onClose={onClose}>
      <Field
        label="Name"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        placeholder="Lunch Special"
      />
      <Field
        label="Description"
        value={form.description ?? ''}
        onChange={(v) => setForm({ ...form, description: v })}
        placeholder="What customers see"
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Type"
          value={form.type}
          onChange={(v) => setForm({ ...form, type: v as DiscountType })}
          options={[
            { value: 'percent', label: 'Percent (%)' },
            { value: 'flat', label: 'Flat (₹)' },
          ]}
        />
        <Field
          label={form.type === 'percent' ? 'Value (%)' : 'Value (₹)'}
          value={String(form.value)}
          onChange={(v) => setForm({ ...form, value: parseFloat(v) || 0 })}
          type="number"
        />
      </div>

      {form.type === 'percent' && (
        <Field
          label="Max discount (₹) — optional cap"
          value={form.maxDiscount !== undefined ? String(form.maxDiscount) : ''}
          onChange={(v) => setForm({ ...form, maxDiscount: v ? parseFloat(v) : undefined })}
          type="number"
        />
      )}

      <SelectField
        label="Scope"
        value={form.scope}
        onChange={(v) => setForm({ ...form, scope: v as DiscountScope })}
        options={[
          { value: 'bill', label: 'Whole bill' },
          { value: 'category', label: 'Category' },
          { value: 'item', label: 'Item' },
          { value: 'channel', label: 'Channel' },
        ]}
      />

      {form.scope === 'category' && (
        <MultiSelect
          label="Categories"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          selected={form.categoryIds ?? []}
          onChange={(v) => setForm({ ...form, categoryIds: v })}
        />
      )}

      {form.scope === 'item' && (
        <MultiSelect
          label="Items"
          options={items.map((i) => ({ value: i._id, label: i.name }))}
          selected={form.itemIds ?? []}
          onChange={(v) => setForm({ ...form, itemIds: v })}
        />
      )}

      <MultiSelect
        label="Channels (leave empty for all)"
        options={[
          { value: 'dine_in', label: 'Dine-In' },
          { value: 'window', label: 'Window' },
          { value: 'assisted', label: 'Assisted' },
        ]}
        selected={form.channels ?? []}
        onChange={(v) => setForm({ ...form, channels: v as PromoChannel[] })}
      />

      <Field
        label="Min bill amount (₹)"
        value={String(form.minBillAmount ?? 0)}
        onChange={(v) => setForm({ ...form, minBillAmount: parseFloat(v) || 0 })}
        type="number"
      />

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Days of week (leave empty for all)
        </label>
        <div className="flex gap-1">
          {DAY_LABELS.map((d, i) => {
            const selected = form.daysOfWeek?.includes(i);
            return (
              <button
                key={d}
                onClick={() => {
                  const cur = form.daysOfWeek ?? [];
                  setForm({
                    ...form,
                    daysOfWeek: selected ? cur.filter((x) => x !== i) : [...cur, i],
                  });
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  selected
                    ? 'bg-pink-400 text-white border-pink-400'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Start time (HH:MM)"
          value={form.startTime ?? ''}
          onChange={(v) => setForm({ ...form, startTime: v || undefined })}
          placeholder="12:00"
        />
        <Field
          label="End time (HH:MM)"
          value={form.endTime ?? ''}
          onChange={(v) => setForm({ ...form, endTime: v || undefined })}
          placeholder="15:00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Valid from"
          value={form.validFrom ?? ''}
          onChange={(v) => setForm({ ...form, validFrom: v || undefined })}
          type="date"
        />
        <Field
          label="Valid until"
          value={form.validUntil ?? ''}
          onChange={(v) => setForm({ ...form, validUntil: v || undefined })}
          type="date"
        />
      </div>

      <Field
        label="Max total uses (optional)"
        value={form.maxTotalUses !== undefined ? String(form.maxTotalUses) : ''}
        onChange={(v) => setForm({ ...form, maxTotalUses: v ? parseInt(v) : undefined })}
        type="number"
      />

      <DrawerFooter
        onCancel={onClose}
        onSubmit={submit}
        submitting={create.isPending || update.isPending}
        submitLabel={isNew ? 'Create' : 'Save'}
      />
    </Drawer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coupons tab
// ─────────────────────────────────────────────────────────────────────────────
function CouponsTab() {
  const couponsQuery = useCoupons();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [editing, setEditing] = useState<CouponDto | 'new' | null>(null);

  const items = couponsQuery.data?.items ?? [];
  const active = items.filter((c) => c.isActive && !isExpired(c.validUntil)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {active} active · {items.length} total coupons
        </p>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {items.length === 0 && !couponsQuery.isLoading && (
        <EmptyState
          icon={Tag}
          title="No coupons yet"
          subtitle="Create promo codes customers can redeem at checkout."
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'Code',
                  'Discount',
                  'Scope',
                  'Min Bill',
                  'Usage',
                  'Valid Until',
                  'Status',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((c) => {
                const expired = isExpired(c.validUntil);
                const exhausted = c.usageLimit ? c.usedCount >= c.usageLimit : false;
                const status =
                  !c.isActive
                    ? { label: 'Disabled', cls: 'bg-gray-50 text-gray-500 border-gray-200' }
                    : expired
                      ? { label: 'Expired', cls: 'bg-gray-50 text-gray-400 border-gray-200' }
                      : exhausted
                        ? { label: 'Exhausted', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
                        : { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                return (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 text-xs">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatDiscountValue(c)} off
                      {c.maxDiscount && (
                        <span className="text-[10px] text-gray-400 ml-1">max ₹{c.maxDiscount}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {DISCOUNT_SCOPE_LABELS[c.scope]}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">₹{c.minBillAmount}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500 rounded-full"
                            style={{
                              width: c.usageLimit
                                ? `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%`
                                : c.usedCount > 0 ? '100%' : '0%',
                            }}
                          />
                        </div>
                        <span>
                          {c.usedCount}
                          {c.usageLimit ? `/${c.usageLimit}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            updateCoupon.mutate({
                              id: c._id,
                              patch: { isActive: !c.isActive },
                            })
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          title={c.isActive ? 'Disable' : 'Enable'}
                        >
                          {c.isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditing(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${c.code}"?`)) {
                              await deleteCoupon.mutateAsync(c._id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <CouponEditor
          coupon={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CouponEditor({
  coupon,
  onClose,
}: {
  coupon: CouponDto | null;
  onClose: () => void;
}) {
  const isNew = coupon === null;
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const categoriesQuery = useCategories({ includeInactive: false });
  const itemsQuery = useItems({ isActive: true });
  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data?.items ?? [];

  const [form, setForm] = useState<CreateCouponInput>({
    code: coupon?.code ?? '',
    description: coupon?.description ?? '',
    type: coupon?.type ?? 'percent',
    value: coupon?.value ?? 10,
    maxDiscount: coupon?.maxDiscount,
    scope: coupon?.scope ?? 'bill',
    categoryIds: coupon?.categoryIds ?? [],
    itemIds: coupon?.itemIds ?? [],
    channels: coupon?.channels ?? [],
    minBillAmount: coupon?.minBillAmount ?? 0,
    validFrom: coupon?.validFrom?.slice(0, 10),
    validUntil: coupon?.validUntil?.slice(0, 10),
    usageLimit: coupon?.usageLimit,
    perUserLimit: coupon?.perUserLimit,
  });

  async function submit() {
    if (!form.code.trim()) {
      toast.error('Code is required');
      return;
    }
    const payload = {
      ...form,
      categoryIds: form.scope === 'category' ? form.categoryIds : [],
      itemIds: form.scope === 'item' ? form.itemIds : [],
    };
    if (isNew) {
      await create.mutateAsync(payload);
    } else {
      // Code cannot change once set; strip it
      const { code: _unused, ...rest } = payload;
      void _unused;
      await update.mutateAsync({ id: coupon!._id, patch: rest });
    }
    onClose();
  }

  return (
    <Drawer title={isNew ? 'New Coupon' : 'Edit Coupon'} onClose={onClose}>
      <Field
        label="Code"
        value={form.code}
        onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
        placeholder="SAVE20"
        disabled={!isNew}
      />
      <Field
        label="Description"
        value={form.description ?? ''}
        onChange={(v) => setForm({ ...form, description: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Type"
          value={form.type}
          onChange={(v) => setForm({ ...form, type: v as DiscountType })}
          options={[
            { value: 'percent', label: 'Percent (%)' },
            { value: 'flat', label: 'Flat (₹)' },
          ]}
        />
        <Field
          label={form.type === 'percent' ? 'Value (%)' : 'Value (₹)'}
          value={String(form.value)}
          onChange={(v) => setForm({ ...form, value: parseFloat(v) || 0 })}
          type="number"
        />
      </div>

      {form.type === 'percent' && (
        <Field
          label="Max discount (₹) — optional cap"
          value={form.maxDiscount !== undefined ? String(form.maxDiscount) : ''}
          onChange={(v) => setForm({ ...form, maxDiscount: v ? parseFloat(v) : undefined })}
          type="number"
        />
      )}

      <SelectField
        label="Scope"
        value={form.scope ?? 'bill'}
        onChange={(v) => setForm({ ...form, scope: v as DiscountScope })}
        options={[
          { value: 'bill', label: 'Whole bill' },
          { value: 'category', label: 'Category' },
          { value: 'item', label: 'Item' },
        ]}
      />

      {form.scope === 'category' && (
        <MultiSelect
          label="Categories"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          selected={form.categoryIds ?? []}
          onChange={(v) => setForm({ ...form, categoryIds: v })}
        />
      )}

      {form.scope === 'item' && (
        <MultiSelect
          label="Items"
          options={items.map((i) => ({ value: i._id, label: i.name }))}
          selected={form.itemIds ?? []}
          onChange={(v) => setForm({ ...form, itemIds: v })}
        />
      )}

      <MultiSelect
        label="Channels (leave empty for all)"
        options={[
          { value: 'dine_in', label: 'Dine-In' },
          { value: 'window', label: 'Window' },
          { value: 'assisted', label: 'Assisted' },
        ]}
        selected={form.channels ?? []}
        onChange={(v) => setForm({ ...form, channels: v as PromoChannel[] })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Min bill amount (₹)"
          value={String(form.minBillAmount ?? 0)}
          onChange={(v) => setForm({ ...form, minBillAmount: parseFloat(v) || 0 })}
          type="number"
        />
        <Field
          label="Usage limit (overall)"
          value={form.usageLimit !== undefined ? String(form.usageLimit) : ''}
          onChange={(v) => setForm({ ...form, usageLimit: v ? parseInt(v) : undefined })}
          type="number"
        />
      </div>

      <Field
        label="Per-user limit (optional)"
        value={form.perUserLimit !== undefined ? String(form.perUserLimit) : ''}
        onChange={(v) => setForm({ ...form, perUserLimit: v ? parseInt(v) : undefined })}
        type="number"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Valid from"
          value={form.validFrom ?? ''}
          onChange={(v) => setForm({ ...form, validFrom: v || undefined })}
          type="date"
        />
        <Field
          label="Valid until"
          value={form.validUntil ?? ''}
          onChange={(v) => setForm({ ...form, validUntil: v || undefined })}
          type="date"
        />
      </div>

      <DrawerFooter
        onCancel={onClose}
        onSubmit={submit}
        submitting={create.isPending || update.isPending}
        submitLabel={isNew ? 'Create' : 'Save'}
      />
    </Drawer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty config tab
// ─────────────────────────────────────────────────────────────────────────────
function LoyaltyConfigTab() {
  const configQuery = useLoyaltyConfig();
  const update = useUpdateLoyaltyConfig();
  const cfg = configQuery.data;

  const [form, setForm] = useState<UpdateLoyaltyConfigInput>({});

  function get<K extends keyof UpdateLoyaltyConfigInput>(key: K): UpdateLoyaltyConfigInput[K] {
    if (form[key] !== undefined) return form[key];
    return cfg?.[key];
  }

  function set<K extends keyof UpdateLoyaltyConfigInput>(
    key: K,
    value: UpdateLoyaltyConfigInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (configQuery.isLoading) {
    return <div className="text-sm text-gray-400 text-center py-12">Loading...</div>;
  }
  if (!cfg) {
    return <div className="text-sm text-gray-400 text-center py-12">Could not load config.</div>;
  }

  async function save() {
    if (Object.keys(form).length === 0) {
      toast.info('No changes to save');
      return;
    }
    await update.mutateAsync(form);
    setForm({});
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Loyalty Program</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure how points are earned and redeemed
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-500">
              {get('isActive') ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={Boolean(get('isActive'))}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            <span
              className={`w-10 h-6 rounded-full transition-colors relative ${
                get('isActive') ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  get('isActive') ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Earn rate (₹ spent per 1 point)"
            value={String(get('earnRate') ?? '')}
            onChange={(v) => set('earnRate', parseInt(v) || 1)}
            type="number"
          />
          <Field
            label="Redeem rate (₹ value per 1 point)"
            value={String(get('redeemRate') ?? '')}
            onChange={(v) => set('redeemRate', parseFloat(v) || 0)}
            type="number"
          />
          <SelectField
            label="Earn base"
            value={(get('earnOn') as string) ?? 'subtotal'}
            onChange={(v) => set('earnOn', v as LoyaltyEarnBase)}
            options={[
              { value: 'subtotal', label: 'Subtotal (food + modifiers)' },
              { value: 'grand', label: 'Grand total (incl tax)' },
            ]}
          />
          <Field
            label="Min points to redeem"
            value={String(get('minRedeem') ?? '')}
            onChange={(v) => set('minRedeem', parseInt(v) || 0)}
            type="number"
          />
          <Field
            label="Max % of bill coverable by points"
            value={String(get('maxRedeemPercent') ?? '')}
            onChange={(v) => set('maxRedeemPercent', parseFloat(v) || 0)}
            type="number"
          />
          <Field
            label="Welcome bonus (points on signup)"
            value={String(get('welcomeBonus') ?? '')}
            onChange={(v) => set('welcomeBonus', parseInt(v) || 0)}
            type="number"
          />
          <Field
            label="Points expire after (days, blank = never)"
            value={
              get('pointsExpiryDays') !== undefined ? String(get('pointsExpiryDays')) : ''
            }
            onChange={(v) => set('pointsExpiryDays', v ? parseInt(v) : undefined)}
            type="number"
          />
          <label className="flex items-center gap-2 mt-7 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(get('excludeWhenDiscounted'))}
              onChange={(e) => set('excludeWhenDiscounted', e.target.checked)}
            />
            Exclude points when order has discounts
          </label>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-pink-800 mb-1.5">Quick math preview</p>
          <p className="text-xs text-pink-700">
            ₹{(get('earnRate') as number) ?? 10} spent → 1 point earned. 1 point ={' '}
            ₹{(get('redeemRate') as number) ?? 1} at redemption. A ₹500 spend yields ≈{' '}
            {Math.floor(500 / ((get('earnRate') as number) ?? 10))} points (₹
            {(Math.floor(500 / ((get('earnRate') as number) ?? 10)) *
              ((get('redeemRate') as number) ?? 1)).toFixed(2)}{' '}
            value).
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setForm({})}
            disabled={Object.keys(form).length === 0}
            className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Reset changes
          </button>
          <button
            onClick={save}
            disabled={update.isPending || Object.keys(form).length === 0}
            className="px-5 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Members tab — top customers by lifetime value + per-customer loyalty drilldown
// ─────────────────────────────────────────────────────────────────────────────
function MembersTab() {
  const customersQuery = useCustomers({ hasPhone: true, limit: 200 });
  const [selected, setSelected] = useState<CustomerDto | null>(null);

  const customers = customersQuery.data?.items ?? [];
  const sorted = useMemo(
    () => [...customers].sort((a, b) => b.lifetimeValue - a.lifetimeValue),
    [customers],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Members (with phone)"
          value={customers.length}
          sub="Loyalty-eligible"
          icon={Users}
          color="bg-pink-50 text-pink-600"
        />
        <KpiCard
          label="Avg Visits"
          value={
            customers.length
              ? (
                  customers.reduce((s, c) => s + c.visitCount, 0) / customers.length
                ).toFixed(1)
              : '0'
          }
          sub="Across members"
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Total LTV"
          value={`₹${Math.round(customers.reduce((s, c) => s + c.lifetimeValue, 0)).toLocaleString()}`}
          sub="Sum of lifetime value"
          icon={Star}
          color="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Avg Bill"
          value={
            customers.length
              ? `₹${Math.round(
                  customers.reduce((s, c) => s + c.averageBill, 0) / customers.length,
                ).toLocaleString()}`
              : '₹0'
          }
          sub="Member average"
          icon={Gift}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Top members by lifetime value</h3>
          <span className="text-xs text-gray-400">{sorted.length} loaded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Member', 'Phone', 'Visits', 'Lifetime', 'Avg Bill', 'Last Visit', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-[10px] font-bold">
                      {customerInitials(c)}
                    </div>
                    {customerDisplayName(c)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{c.visitCount}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    ₹{c.lifetimeValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ₹{Math.round(c.averageBill).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(c)}
                      className="text-xs font-semibold text-pink-600 hover:text-pink-700"
                    >
                      View Points →
                    </button>
                  </td>
                </tr>
              ))}
              {!customersQuery.isLoading && sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No members yet. Customers with phone numbers appear here automatically after
                    orders settle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <LoyaltyAccountDrawer customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function LoyaltyAccountDrawer({
  customer,
  onClose,
}: {
  customer: CustomerDto;
  onClose: () => void;
}) {
  const accountQuery = useLoyaltyAccount(customer._id);
  const adjust = useAdjustLoyaltyPoints();
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');

  const account = accountQuery.data?.account;

  async function submitAdjust() {
    const d = parseInt(delta);
    if (!d || Number.isNaN(d)) {
      toast.error('Enter a non-zero integer');
      return;
    }
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    await adjust.mutateAsync({ customerId: customer._id, delta: d, reason: reason.trim() });
    setDelta('');
    setReason('');
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold shrink-0">
              {customerInitials(customer)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {customerDisplayName(customer)}
              </h3>
              <p className="text-xs text-gray-500 truncate">{customer.phone || '—'}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {accountQuery.isLoading && (
            <div className="text-center text-sm text-gray-400">Loading...</div>
          )}
          {account && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-pink-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-pink-600">{account.points}</p>
                  <p className="text-[10px] text-pink-700 uppercase tracking-wider font-semibold">
                    Balance
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">
                    {account.lifetimeEarned}
                  </p>
                  <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-semibold">
                    Earned
                  </p>
                </div>
                <div className="bg-violet-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-violet-600">
                    {account.lifetimeRedeemed}
                  </p>
                  <p className="text-[10px] text-violet-700 uppercase tracking-wider font-semibold">
                    Redeemed
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Adjust balance</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                    placeholder="e.g. 100 or -50"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                  />
                  <button
                    onClick={submitAdjust}
                    disabled={adjust.isPending}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (required)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">History</p>
                <div className="space-y-2">
                  {account.history.length === 0 && (
                    <p className="text-xs text-gray-400">No activity yet.</p>
                  )}
                  {account.history
                    .slice()
                    .reverse()
                    .map((h) => (
                      <HistoryRow key={h._id} entry={h} />
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: LoyaltyHistoryEntry }) {
  const cls: Record<typeof entry.type, string> = {
    earned: 'bg-emerald-50 text-emerald-700',
    redeemed: 'bg-violet-50 text-violet-700',
    adjusted: 'bg-blue-50 text-blue-700',
    expired: 'bg-gray-50 text-gray-500',
    welcome: 'bg-pink-50 text-pink-700',
  };
  return (
    <div className="flex items-start justify-between border-b border-gray-50 pb-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cls[entry.type]}`}
          >
            {LOYALTY_HISTORY_LABELS[entry.type]}
          </span>
          <span
            className={`text-sm font-bold ${entry.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {entry.points >= 0 ? '+' : ''}
            {entry.points} pts
          </span>
        </div>
        {entry.reason && <p className="text-xs text-gray-500">{entry.reason}</p>}
        <p className="text-[10px] text-gray-400 mt-0.5">
          {new Date(entry.at).toLocaleString()}
        </p>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-[10px] text-gray-400">Balance</p>
        <p className="text-sm font-semibold text-gray-700">{entry.balanceAfter}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared form primitives
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
      <Icon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}

function Drawer({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function DrawerFooter({
  onCancel,
  onSubmit,
  submitting,
  submitLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-5 mt-3 border-t border-gray-100">
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> {submitLabel}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400 bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.length === 0 && (
          <p className="text-xs text-gray-400">No options available.</p>
        )}
        {options.map((o) => {
          const isOn = selected.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() =>
                onChange(isOn ? selected.filter((x) => x !== o.value) : [...selected, o.value])
              }
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                isOn
                  ? 'bg-pink-400 text-white border-pink-400'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
