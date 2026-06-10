import { useMemo, useState } from 'react';
import {
  Search,
  Star,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Tag,
  X,
  MessageSquare,
  Heart,
  Plus,
  Pencil,
  Save,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomers,
  useCustomer,
  useCustomerHistory,
  useCreateCustomer,
  useUpdateCustomer,
  useAddCustomerTag,
  useRemoveCustomerTag,
} from '@/hooks/useCustomers';
import { useFeedbackList } from '@/hooks/useFeedback';
import {
  customerDisplayName,
  customerInitials,
  type CustomerDto,
  type CustomerHistoryEntry,
} from '@/lib/dto/customers';
import { ORDER_CHANNEL_LABELS } from '@/lib/dto/orders';
import type { FeedbackDto } from '@/lib/dto/feedback';

const TAG_COLORS: Record<string, string> = {
  vip: 'bg-violet-100 text-violet-700 border-violet-200',
  regular: 'bg-blue-100 text-blue-700 border-blue-200',
  new: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  foodlover: 'bg-orange-100 text-orange-700 border-orange-200',
  vegan: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  vegetarian: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

function tagStyle(tag: string): string {
  return TAG_COLORS[tag.toLowerCase().replace(/[\s_-]/g, '')] || 'bg-gray-100 text-gray-600 border-gray-200';
}

const QUICK_TAGS = ['vip', 'regular', 'new', 'inactive', 'foodlover'];

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString();
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const sz =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  const colors = [
    'bg-pink-500',
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-orange-500',
  ];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div
      className={`${sz} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
    >
      {initials || '?'}
    </div>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'visits' | 'feedback'>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const customersQuery = useCustomers({
    q: search.trim() || undefined,
    tag: tagFilter !== 'All' ? tagFilter : undefined,
  });

  const customers = customersQuery.data?.items ?? [];

  // auto-select first on load
  const effectiveSelectedId =
    selectedId ?? customers[0]?._id ?? null;

  const customerDetail = useCustomer(effectiveSelectedId);
  const selected = customerDetail.data ?? customers.find((c) => c._id === effectiveSelectedId) ?? null;

  // Build tag chip list from the loaded customers
  const allTags = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => set.add(t)));
    QUICK_TAGS.forEach((t) => set.add(t));
    return ['All', ...Array.from(set).sort()];
  }, [customers]);

  return (
    <div className="flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      {/* ── Customer list ─────────────────────────────────────────────── */}
      <div className="w-[340px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Customers</h2>
            <button
              onClick={() => setCreateOpen(true)}
              className="text-xs flex items-center gap-1 px-2.5 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {allTags.slice(0, 7).map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  tagFilter === t
                    ? 'bg-pink-400 text-white border-pink-400'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">
            {customersQuery.isLoading ? 'Loading...' : `${customers.length} loaded`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {customers.map((c) => (
            <CustomerRow
              key={c._id}
              customer={c}
              selected={c._id === effectiveSelectedId}
              onClick={() => {
                setSelectedId(c._id);
                setProfileTab('overview');
              }}
            />
          ))}
          {!customersQuery.isLoading && customers.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <p className="text-sm text-gray-400">No customers found.</p>
              <p className="text-xs text-gray-300 mt-1">
                Customers are created automatically when orders include a phone number.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Customer profile ──────────────────────────────────────────── */}
      {selected ? (
        <CustomerProfile
          customer={selected}
          profileTab={profileTab}
          onTabChange={setProfileTab}
          onEdit={() => setEditOpen(true)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Select a customer to view profile</p>
        </div>
      )}

      {editOpen && selected && (
        <CustomerEditModal customer={selected} onClose={() => setEditOpen(false)} />
      )}
      {createOpen && (
        <CustomerCreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={(c) => {
            setSelectedId(c._id);
            setCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Customer row
// ──────────────────────────────────────────────────────────────────────────────
function CustomerRow({
  customer,
  selected,
  onClick,
}: {
  customer: CustomerDto;
  selected: boolean;
  onClick: () => void;
}) {
  const name = customerDisplayName(customer);
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${
        selected ? 'bg-pink-50 border-r-2 border-pink-500' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={customerInitials(customer)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-400 truncate">
            {customer.phone || customer.email || '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {customer.visitCount} visit{customer.visitCount === 1 ? '' : 's'} ·{' '}
            {formatDate(customer.lastVisitAt)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-gray-900">
            ₹{(customer.lifetimeValue / 1000).toFixed(1)}K
          </p>
          <p className="text-[10px] text-gray-400">avg ₹{Math.round(customer.averageBill)}</p>
        </div>
      </div>
      {customer.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {customer.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${tagStyle(t)}`}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Customer profile pane
// ──────────────────────────────────────────────────────────────────────────────
function CustomerProfile({
  customer,
  profileTab,
  onTabChange,
  onEdit,
}: {
  customer: CustomerDto;
  profileTab: 'overview' | 'visits' | 'feedback';
  onTabChange: (t: 'overview' | 'visits' | 'feedback') => void;
  onEdit: () => void;
}) {
  const historyQuery = useCustomerHistory(profileTab === 'visits' ? customer._id : null);
  const feedbackQuery = useFeedbackList(
    profileTab === 'feedback' && customer._id
      ? { limit: 50 }
      : { limit: 1 },
  );

  const allFeedback = feedbackQuery.data?.items ?? [];
  const myFeedback = useMemo(
    () => allFeedback.filter((f) => f.customerId === customer._id),
    [allFeedback, customer._id],
  );

  const addTag = useAddCustomerTag();
  const removeTag = useRemoveCustomerTag();
  const [newTag, setNewTag] = useState('');

  const name = customerDisplayName(customer);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-5">
            <Avatar name={customerInitials(customer)} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                {customer.marketingOptIn && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                    Marketing opt-in
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {customer.tags.map((t) => (
                  <span
                    key={t}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${tagStyle(t)}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500">
                {customer.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5" />
                    {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </div>
                )}
                {customer.firstVisitAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Since {new Date(customer.firstVisitAt).toLocaleDateString()}
                  </div>
                )}
                {customer.lastVisitAt && (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Last visit: {formatDate(customer.lastVisitAt)}
                  </div>
                )}
              </div>
              {customer.notes && (
                <p className="mt-3 text-xs text-gray-500 italic border-l-2 border-pink-200 pl-3">
                  {customer.notes}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-pink-400 text-white rounded-xl text-xs font-medium hover:bg-pink-500 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Total Visits',
              value: customer.visitCount.toString(),
              icon: Calendar,
              color: 'bg-blue-50 text-blue-600',
            },
            {
              label: 'Lifetime Value',
              value: `₹${customer.lifetimeValue.toLocaleString()}`,
              icon: TrendingUp,
              color: 'bg-emerald-50 text-emerald-600',
            },
            {
              label: 'Avg Bill',
              value: `₹${Math.round(customer.averageBill).toLocaleString()}`,
              icon: ShoppingBag,
              color: 'bg-violet-50 text-violet-600',
            },
            {
              label: 'Favourites',
              value: customer.favoriteItems.length.toString(),
              icon: Star,
              color: 'bg-amber-50 text-amber-600',
            },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${k.color}`}
              >
                <k.icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-900">{k.value}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                {k.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['overview', 'visits', 'feedback'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                profileTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'visits'
                ? `Visit History`
                : t === 'feedback'
                  ? `Feedback (${myFeedback.length})`
                  : 'Overview'}
            </button>
          ))}
        </div>

        {profileTab === 'overview' && (
          <div className="grid grid-cols-2 gap-4">
            {/* Favourite items */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" /> Favourite Items
              </h3>
              <div className="space-y-2">
                {customer.favoriteItems.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No favourites yet. Will be populated as orders settle.
                  </p>
                )}
                {customer.favoriteItems.slice(0, 8).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-xs font-black text-gray-300">#{i + 1}</span>
                    <p className="text-sm text-gray-800 font-medium flex-1 truncate">{item.name}</p>
                    <span className="text-[10px] text-gray-400">×{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" /> Tags & Allergens
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {customer.tags.map((t) => (
                      <div
                        key={t}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${tagStyle(t)}`}
                      >
                        {t}
                        <button
                          onClick={() => removeTag.mutate({ id: customer._id, tag: t })}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="add tag..."
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pink-400"
                    />
                    <button
                      onClick={() => {
                        const t = newTag.trim();
                        if (!t) return;
                        addTag.mutate({ id: customer._id, tag: t });
                        setNewTag('');
                      }}
                      className="px-2.5 py-1.5 bg-pink-500 text-white rounded-lg text-xs hover:bg-pink-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1.5">
                    Allergens
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {customer.allergens.length === 0 && (
                      <span className="text-xs text-gray-400">None recorded</span>
                    )}
                    {customer.allergens.map((a) => (
                      <span
                        key={a}
                        className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-md px-2 py-0.5 font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {profileTab === 'visits' && (
          <VisitHistory historyQuery={historyQuery} />
        )}

        {profileTab === 'feedback' && (
          <FeedbackList items={myFeedback} loading={feedbackQuery.isLoading} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Visit history
// ──────────────────────────────────────────────────────────────────────────────
function VisitHistory({
  historyQuery,
}: {
  historyQuery: ReturnType<typeof useCustomerHistory>;
}) {
  const orders = historyQuery.data?.orders ?? [];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Visit History</h3>
      </div>
      {historyQuery.isLoading ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          No completed orders for this customer yet.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Date', 'Order #', 'Items', 'Channel', 'Status', 'Amount'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((v: CustomerHistoryEntry) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 font-medium text-xs whitespace-nowrap">
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.orderNumber}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{v.itemCount} items</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                    {ORDER_CHANNEL_LABELS[v.channel]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] capitalize text-gray-600">{v.status}</span>
                  {v.paymentStatus && (
                    <span
                      className={`ml-1 text-[10px] capitalize ${v.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}
                    >
                      · {v.paymentStatus}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-bold text-gray-900">₹{v.grand.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Feedback list (per customer)
// ──────────────────────────────────────────────────────────────────────────────
function FeedbackList({ items, loading }: { items: FeedbackDto[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No feedback yet</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((fb) => (
        <div key={fb._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">Order {fb.orderNumber}</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(fb.createdAt).toLocaleDateString()}
            </span>
          </div>
          {fb.text && <p className="text-sm text-gray-700 leading-relaxed">{fb.text}</p>}
          {fb.tagChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {fb.tagChips.map((t) => (
                <span
                  key={t}
                  className="text-[10px] bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 text-gray-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Modals
// ──────────────────────────────────────────────────────────────────────────────
function CustomerEditModal({
  customer,
  onClose,
}: {
  customer: CustomerDto;
  onClose: () => void;
}) {
  const update = useUpdateCustomer();
  const [form, setForm] = useState({
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    notes: customer.notes ?? '',
    allergens: customer.allergens.join(', '),
    marketingOptIn: customer.marketingOptIn,
  });

  async function submit() {
    await update.mutateAsync({
      id: customer._id,
      patch: {
        name: form.name || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        notes: form.notes || undefined,
        allergens: form.allergens
          ? form.allergens.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        marketingOptIn: form.marketingOptIn,
      },
    });
    onClose();
  }

  return (
    <Modal title="Edit Customer" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field
          label="Allergens (comma-separated)"
          value={form.allergens}
          onChange={(v) => setForm({ ...form, allergens: v })}
        />
        <Field
          label="Notes"
          value={form.notes}
          onChange={(v) => setForm({ ...form, notes: v })}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.marketingOptIn}
            onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
          />
          Marketing opt-in
        </label>
      </div>
      <ModalFooter
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="Save"
        submitting={update.isPending}
      />
    </Modal>
  );
}

function CustomerCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: CustomerDto) => void;
}) {
  const create = useCreateCustomer();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    marketingOptIn: false,
  });

  async function submit() {
    if (!form.name && !form.phone && !form.email) {
      toast.error('Provide at least one of name, phone, or email');
      return;
    }
    const c = await create.mutateAsync({
      name: form.name || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      notes: form.notes || undefined,
      marketingOptIn: form.marketingOptIn,
    });
    onCreated(c);
  }

  return (
    <Modal title="Add Customer" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field
          label="Phone (E.164 format)"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="+919876543210"
        />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.marketingOptIn}
            onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
          />
          Marketing opt-in
        </label>
      </div>
      <ModalFooter
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="Create"
        submitting={create.isPending}
      />
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onSubmit,
  submitLabel,
  submitting,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitting: boolean;
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400"
      />
    </div>
  );
}
