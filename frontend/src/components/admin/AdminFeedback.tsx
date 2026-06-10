import { useMemo, useState } from 'react';
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  Send,
  CheckCircle2,
  X,
  RefreshCw,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useFeedbackList,
  useFeedbackSummary,
  useAcknowledgeFeedback,
  useReplyFeedback,
} from '@/hooks/useFeedback';
import { useSocket } from '@/hooks/useSocket';
import {
  SENTIMENT_STYLES,
  type FeedbackChannel,
  type FeedbackDto,
  type FeedbackOrderChannel,
  type FeedbackSentiment,
} from '@/lib/dto/feedback';
import { ORDER_CHANNEL_LABELS } from '@/lib/dto/orders';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ElementType;
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

export default function AdminFeedback() {
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState<'All' | FeedbackSentiment>('All');
  const [channel, setChannel] = useState<'All' | FeedbackOrderChannel>('All');
  const [acknowledged, setAcknowledged] = useState<'All' | 'yes' | 'no'>('All');
  const [hasReply, setHasReply] = useState<'All' | 'yes' | 'no'>('All');
  const [replyTo, setReplyTo] = useState<FeedbackDto | null>(null);

  const feedbackQuery = useFeedbackList({
    sentiment: sentiment === 'All' ? undefined : sentiment,
    channel: channel === 'All' ? undefined : channel,
    acknowledged:
      acknowledged === 'All' ? undefined : acknowledged === 'yes',
    hasReply: hasReply === 'All' ? undefined : hasReply === 'yes',
    limit: 100,
  });
  const summaryQuery = useFeedbackSummary();
  const acknowledge = useAcknowledgeFeedback();

  // Live new-feedback alerts
  useSocket('/staff', {
    'feedback:new': () => {
      feedbackQuery.refetch();
      summaryQuery.refetch();
    },
    'feedback:negative_alert': (payload: unknown) => {
      const p = payload as { orderNumber?: string; rating?: number };
      if (p?.orderNumber) {
        toast.error(
          `Negative feedback: Order ${p.orderNumber} (${p.rating} stars)`,
          { duration: 8000 },
        );
      }
    },
  });

  const items = feedbackQuery.data?.items ?? [];
  const summary = summaryQuery.data;

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (f) =>
        f.orderNumber.toLowerCase().includes(q) ||
        (f.customerName ?? '').toLowerCase().includes(q) ||
        (f.text ?? '').toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Guest ratings, comments, and replies across all channels
          </p>
        </div>
        <button
          onClick={() => {
            feedbackQuery.refetch();
            summaryQuery.refetch();
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${feedbackQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total"
          value={summary?.total ?? 0}
          sub="Submitted reviews"
          color="bg-blue-50 text-blue-600"
          icon={MessageSquare}
        />
        <KpiCard
          label="Avg Rating"
          value={summary?.avgRating ? summary.avgRating.toFixed(2) : '—'}
          sub="Across all channels"
          color="bg-amber-50 text-amber-600"
          icon={Star}
        />
        <KpiCard
          label="Positive / Negative"
          value={`${summary?.sentiment.positive ?? 0} / ${summary?.sentiment.negative ?? 0}`}
          sub={`Neutral: ${summary?.sentiment.neutral ?? 0}`}
          color="bg-emerald-50 text-emerald-600"
          icon={Smile}
        />
        <KpiCard
          label="Replied"
          value={summary?.replied ?? 0}
          sub={
            summary && summary.total > 0
              ? `${Math.round(((summary.replied ?? 0) / summary.total) * 100)}% response rate`
              : '—'
          }
          color="bg-violet-50 text-violet-600"
          icon={Send}
        />
      </div>

      {/* Tag distribution */}
      {summary && summary.tagDistribution.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top mentioned tags</h3>
          <div className="flex flex-wrap gap-2">
            {summary.tagDistribution.slice(0, 10).map((t) => (
              <span
                key={t.tag}
                className="text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-gray-700"
              >
                {t.tag} <span className="text-gray-400">×{t.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, name, text..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 w-64"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value as 'All' | FeedbackSentiment)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="All">All sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as 'All' | FeedbackOrderChannel)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="All">All channels</option>
              <option value="dine_in">Dine-In</option>
              <option value="window">Window</option>
              <option value="assisted">Assisted</option>
            </select>
            <select
              value={acknowledged}
              onChange={(e) => setAcknowledged(e.target.value as 'All' | 'yes' | 'no')}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="All">Ack: any</option>
              <option value="yes">Acknowledged</option>
              <option value="no">Unacknowledged</option>
            </select>
            <select
              value={hasReply}
              onChange={(e) => setHasReply(e.target.value as 'All' | 'yes' | 'no')}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="All">Reply: any</option>
              <option value="yes">Replied</option>
              <option value="no">No reply</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">
            {feedbackQuery.isLoading ? 'Loading...' : `${filtered.length} entries`}
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((fb) => (
            <FeedbackRow
              key={fb._id}
              feedback={fb}
              onAck={() => acknowledge.mutate(fb._id)}
              onReply={() => setReplyTo(fb)}
            />
          ))}
          {!feedbackQuery.isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              No feedback matches the current filters.
            </div>
          )}
        </div>
      </div>

      {replyTo && (
        <ReplyModal feedback={replyTo} onClose={() => setReplyTo(null)} />
      )}
    </div>
  );
}

function FeedbackRow({
  feedback,
  onAck,
  onReply,
}: {
  feedback: FeedbackDto;
  onAck: () => void;
  onReply: () => void;
}) {
  const sStyle = SENTIMENT_STYLES[feedback.sentiment];
  const SentimentIcon =
    feedback.sentiment === 'positive'
      ? Smile
      : feedback.sentiment === 'negative'
        ? Frown
        : Meh;

  return (
    <div className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${sStyle.bg}`}
          >
            <SentimentIcon className={`w-5 h-5 ${sStyle.text}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <StarRating value={feedback.rating} />
            <span className="text-sm font-semibold text-gray-900">
              {feedback.customerName || feedback.customerPhone || 'Anonymous'}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {ORDER_CHANNEL_LABELS[feedback.channel]}
            </span>
            <span className="text-[10px] text-gray-400">
              Order {feedback.orderNumber} · {new Date(feedback.createdAt).toLocaleDateString()}
            </span>
          </div>

          {feedback.text && (
            <p className="text-sm text-gray-700 leading-relaxed mt-1">{feedback.text}</p>
          )}

          {feedback.tagChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {feedback.tagChips.map((t) => (
                <span
                  key={t}
                  className="text-[10px] bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 text-gray-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {feedback.reply && (
            <div className="mt-3 bg-blue-50/50 border-l-2 border-blue-300 pl-3 py-2">
              <p className="text-[10px] font-bold uppercase text-blue-700 mb-0.5">
                Reply via {feedback.reply.sentVia} ·{' '}
                {new Date(feedback.reply.sentAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">{feedback.reply.text}</p>
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col gap-1.5">
          {feedback.acknowledged ? (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ack
            </span>
          ) : (
            <button
              onClick={onAck}
              className="text-[10px] font-semibold text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              Acknowledge
            </button>
          )}
          {!feedback.reply && (
            <button
              onClick={onReply}
              className="text-[10px] font-semibold text-white bg-pink-500 px-2.5 py-1 rounded-full hover:bg-pink-600 transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3" /> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Reply modal
// ──────────────────────────────────────────────────────────────────────────────
function ReplyModal({ feedback, onClose }: { feedback: FeedbackDto; onClose: () => void }) {
  const reply = useReplyFeedback();
  const [text, setText] = useState('');
  const [via, setVia] = useState<FeedbackChannel>(feedback.customerPhone ? 'sms' : 'email');

  async function submit() {
    if (!text.trim()) {
      toast.error('Write a reply first');
      return;
    }
    await reply.mutateAsync({
      id: feedback._id,
      input: { text, via },
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Reply to feedback</h3>
            <p className="text-xs text-gray-500">
              Order {feedback.orderNumber} · {feedback.customerName || 'Anonymous'}
            </p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <StarRating value={feedback.rating} />
              <span className="text-[10px] text-gray-400">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{feedback.text || <em className="text-gray-400">(no comment)</em>}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Send via</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sms', 'whatsapp', 'email'] as FeedbackChannel[]).map((v) => {
                const disabled = (v === 'sms' || v === 'whatsapp') && !feedback.customerPhone;
                return (
                  <button
                    key={v}
                    disabled={disabled}
                    onClick={() => setVia(v)}
                    className={`py-2 text-sm rounded-xl border font-medium transition-colors capitalize disabled:opacity-40 disabled:cursor-not-allowed ${
                      via === v
                        ? 'bg-pink-400 text-white border-pink-400'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
            {!feedback.customerPhone && (
              <p className="text-[10px] text-gray-400 mt-1">
                No phone on file — only email replies are available.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={800}
              placeholder="Thank you for your feedback..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{text.length} / 800</p>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={reply.isPending}
            onClick={submit}
            className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}
