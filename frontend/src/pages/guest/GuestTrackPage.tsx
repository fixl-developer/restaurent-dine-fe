import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Sparkles,
  Star,
  Hand,
  Droplet,
  Receipt,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuestOrder, useSendGuestRequest, useSubmitGuestFeedback } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import type { OrderStatus } from '@/lib/dto/orders';
import {
  GUEST_REQUEST_LABELS,
  type GuestRequestType,
} from '@/lib/dto/guest';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_FLOW: OrderStatus[] = ['placed', 'accepted', 'preparing', 'ready', 'served', 'settled'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order placed',
  accepted: 'Confirmed by staff',
  preparing: 'In the kitchen',
  ready: 'Ready to serve',
  served: 'Served — enjoy!',
  settled: 'Bill settled',
  cancelled: 'Cancelled',
};

const REQUEST_ICONS: Record<GuestRequestType, React.ElementType> = {
  call_waiter: Hand,
  water: Droplet,
  bill: Receipt,
  other: Sparkles,
};

export default function GuestTrackPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const qc = useQueryClient();
  const orderQuery = useGuestOrder(orderId ?? null);
  const sendRequest = useSendGuestRequest();
  const submitFeedback = useSubmitGuestFeedback();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Live updates via /guest socket joined by orderId
  useSocket(
    '/guest',
    {
      'order:updated': () => qc.invalidateQueries({ queryKey: ['guest-order', orderId] }),
      'order:status_changed': () => qc.invalidateQueries({ queryKey: ['guest-order', orderId] }),
      'order:item_status_changed': () =>
        qc.invalidateQueries({ queryKey: ['guest-order', orderId] }),
    },
    { query: orderId ? { orderId } : {}, enabled: Boolean(orderId) },
  );

  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold text-gray-800">Order not found</p>
          <p className="text-xs text-gray-500 mt-1">Check the link or ask staff for help.</p>
        </div>
      </div>
    );
  }

  const flowIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isWindow = order.channel === 'window';
  const canRequest = !['settled', 'cancelled'].includes(order.status);
  const canFeedback = order.status === 'served' || order.status === 'settled';

  return (
    <div className="min-h-screen bg-pink-50/30 pb-12">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-[10px] uppercase font-semibold text-pink-500 tracking-wider">
            Order Tracker
          </p>
          <h1 className="text-xl font-bold text-gray-900">
            #{order.orderNumber}
            {isWindow && order.windowToken && (
              <span className="ml-2 text-base text-violet-600">· Token {order.windowToken}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{order.channel.replace('_', '-')}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Status hero */}
        <div
          className={`rounded-2xl p-5 ${isCancelled ? 'bg-red-50 border border-red-200' : order.status === 'ready' ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200'} shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isCancelled
                  ? 'bg-red-100 text-red-600'
                  : order.status === 'ready'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-pink-100 text-pink-600'
              }`}
            >
              {order.status === 'preparing' ? (
                <ChefHat className="w-6 h-6" />
              ) : order.status === 'ready' ? (
                <Sparkles className="w-6 h-6" />
              ) : order.status === 'served' || order.status === 'settled' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{STATUS_LABEL[order.status]}</p>
              {!isCancelled && order.estimatedPrepMinutes > 0 && order.status !== 'served' && order.status !== 'settled' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Est. prep time: {order.estimatedPrepMinutes} min
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Progress</h3>
            <div className="space-y-3">
              {STATUS_FLOW.slice(0, isWindow ? 5 : 6).map((s, idx) => {
                const reached = idx <= flowIndex;
                const current = idx === flowIndex;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        reached
                          ? current
                            ? 'bg-pink-500 text-white'
                            : 'bg-pink-100 text-pink-600'
                          : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      {reached && !current ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        current ? 'font-bold text-gray-900' : reached ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Your items</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.qty}× {item.name}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200 capitalize">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="font-bold text-gray-900">
              ₹{order.totals.grand.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick requests */}
        {canRequest && !isWindow && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Need something?</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(GUEST_REQUEST_LABELS) as GuestRequestType[]).map((t) => {
                const Icon = REQUEST_ICONS[t];
                return (
                  <button
                    key={t}
                    disabled={sendRequest.isPending}
                    onClick={() =>
                      sendRequest.mutate({
                        orderId: order.id,
                        type: t,
                      })
                    }
                    className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-pink-400 hover:bg-pink-50 transition-colors disabled:opacity-50"
                  >
                    <Icon className="w-4 h-4 text-pink-500" />
                    {GUEST_REQUEST_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback */}
        {canFeedback && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            {feedbackOpen ? (
              <FeedbackForm
                onSubmit={async (rating, text) => {
                  await submitFeedback.mutateAsync({
                    orderId: order.id,
                    input: { rating, text: text || undefined },
                  });
                  setFeedbackOpen(false);
                }}
                submitting={submitFeedback.isPending}
                onCancel={() => setFeedbackOpen(false)}
              />
            ) : (
              <button
                onClick={() => setFeedbackOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-pink-500 text-white rounded-xl font-medium text-sm"
              >
                <Star className="w-4 h-4 fill-current" />
                Rate your experience
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function FeedbackForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (rating: number, text: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">How was your experience?</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} className="p-1">
            <Star
              className={`w-9 h-9 transition-colors ${
                n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tell us more (optional)"
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm">
          Cancel
        </button>
        <button
          onClick={() => {
            if (rating === 0) {
              toast.error('Pick a rating');
              return;
            }
            onSubmit(rating, text);
          }}
          disabled={submitting}
          className="flex-1 py-2 bg-pink-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
