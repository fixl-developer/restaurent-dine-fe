import { useMemo, useState } from 'react';
import {
  Bell,
  FileText,
  Send,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Mail,
  MessageSquare,
  Smartphone,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useNotificationEvents,
  useNotificationTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  usePreviewTemplate,
  useTestSend,
  useNotificationLogs,
  type LogQuery,
} from '@/hooks/useNotifications';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_AUDIENCE_LABELS,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_STATUS_STYLES,
  type CreateTemplateInput,
  type NotificationChannel,
  type NotificationEventDef,
  type NotificationStatus,
  type NotificationTemplateDto,
  type PreviewTemplateResult,
} from '@/lib/dto/notifications';

type Tab = 'templates' | 'logs';

const CHANNEL_ICONS: Record<NotificationChannel, React.ElementType> = {
  sms: Smartphone,
  whatsapp: MessageSquare,
  email: Mail,
  push: Bell,
};

export default function AdminNotifications() {
  const [tab, setTab] = useState<Tab>('templates');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Templates trigger when events fire — edit the body to change the customer message
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 max-w-md">
        {(
          [
            { id: 'templates' as const, label: 'Templates', icon: FileText },
            { id: 'logs' as const, label: 'Delivery Logs', icon: Send },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-[fadeIn_0.2s_ease-out]">
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates tab
// ─────────────────────────────────────────────────────────────────────────────
function TemplatesTab() {
  const eventsQuery = useNotificationEvents();
  const templatesQuery = useNotificationTemplates();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [editing, setEditing] = useState<NotificationTemplateDto | { event: NotificationEventDef; channel: NotificationChannel } | null>(null);
  const [testing, setTesting] = useState<NotificationTemplateDto | null>(null);

  const events = eventsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];

  const templatesByKey = useMemo(() => {
    const m = new Map<string, NotificationTemplateDto>();
    templates.forEach((t) => m.set(`${t.eventKey}:${t.channel}`, t));
    return m;
  }, [templates]);

  return (
    <div className="space-y-4">
      {eventsQuery.isLoading && (
        <div className="text-center text-sm text-gray-400 py-10">Loading events...</div>
      )}

      {events.map((event) => (
        <EventCard
          key={event.key}
          event={event}
          templates={event.channels.map((ch) => templatesByKey.get(`${event.key}:${ch}`))}
          onEdit={(template, channel) => {
            if (template) setEditing(template);
            else setEditing({ event, channel });
          }}
          onTest={(template) => setTesting(template)}
          onToggle={(template) =>
            updateTemplate.mutate({
              id: template._id,
              patch: { isActive: !template.isActive },
            })
          }
          onDelete={async (template) => {
            if (template.isSystem) {
              toast.error('System templates can\'t be deleted. Disable them instead.');
              return;
            }
            if (confirm(`Delete ${event.key} (${template.channel}) template?`)) {
              await deleteTemplate.mutateAsync(template._id);
            }
          }}
        />
      ))}

      {editing && (
        <TemplateEditor
          existing={'_id' in editing ? editing : null}
          event={'_id' in editing ? events.find((e) => e.key === editing.eventKey) : editing.event}
          channel={'_id' in editing ? editing.channel : editing.channel}
          onClose={() => setEditing(null)}
        />
      )}

      {testing && (
        <TestSendModal
          template={testing}
          event={events.find((e) => e.key === testing.eventKey)}
          onClose={() => setTesting(null)}
        />
      )}
    </div>
  );
}

function EventCard({
  event,
  templates,
  onEdit,
  onTest,
  onToggle,
  onDelete,
}: {
  event: NotificationEventDef;
  templates: Array<NotificationTemplateDto | undefined>;
  onEdit: (template: NotificationTemplateDto | null, channel: NotificationChannel) => void;
  onTest: (template: NotificationTemplateDto) => void;
  onToggle: (template: NotificationTemplateDto) => void;
  onDelete: (template: NotificationTemplateDto) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
              {event.key}
            </code>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              {NOTIFICATION_AUDIENCE_LABELS[event.audience]}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{event.description}</p>
          {event.variables.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                Variables:
              </span>
              {event.variables.map((v) => (
                <code
                  key={v}
                  className="text-[10px] bg-pink-50 text-pink-700 border border-pink-200 rounded px-1.5 py-0.5"
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {event.channels.map((ch, idx) => {
          const template = templates[idx];
          const Icon = CHANNEL_ICONS[ch];
          return (
            <div
              key={ch}
              className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/50"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {NOTIFICATION_CHANNEL_LABELS[ch]}
                  </span>
                  {template ? (
                    template.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                        Disabled
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Not configured
                    </span>
                  )}
                  {template?.isSystem && (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      <Lock className="w-2.5 h-2.5" /> System
                    </span>
                  )}
                </div>
                {template ? (
                  <>
                    {template.subject && (
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">
                        Subject: {template.subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap font-mono">
                      {template.body}
                    </p>
                    {template.notes && (
                      <p className="text-[10px] text-gray-400 mt-1 italic">{template.notes}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No template configured for this channel yet.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {template ? (
                  <>
                    <button
                      onClick={() => onTest(template)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Test send"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggle(template)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                      title={template.isActive ? 'Disable' : 'Enable'}
                    >
                      {template.isActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(template, ch)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!template.isSystem && (
                      <button
                        onClick={() => onDelete(template)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => onEdit(null, ch)}
                    className="text-xs flex items-center gap-1 px-3 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Create
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template editor with live preview
// ─────────────────────────────────────────────────────────────────────────────
function TemplateEditor({
  existing,
  event,
  channel,
  onClose,
}: {
  existing: NotificationTemplateDto | null;
  event: NotificationEventDef | undefined;
  channel: NotificationChannel;
  onClose: () => void;
}) {
  const isNew = !existing;
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const previewMut = usePreviewTemplate();

  const [subject, setSubject] = useState(existing?.subject ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [preview, setPreview] = useState<PreviewTemplateResult | null>(null);

  const supportsSubject = channel === 'email';
  const samplePayload = useMemo(() => {
    const obj: Record<string, string | number> = {};
    event?.variables.forEach((v) => {
      if (/(count|points|num|qty|minutes)/i.test(v)) obj[v] = 5;
      else if (/grand|amount|stock|threshold/i.test(v)) obj[v] = 850;
      else if (/rating/i.test(v)) obj[v] = 2;
      else obj[v] = `«${v}»`;
    });
    return obj;
  }, [event]);

  if (!event) {
    return (
      <Drawer title="Edit template" onClose={onClose}>
        <p className="text-sm text-red-600">Unknown event. Close and try again.</p>
      </Drawer>
    );
  }

  async function runPreview() {
    const r = await previewMut.mutateAsync({
      body,
      subject: subject || undefined,
      payload: samplePayload,
    });
    setPreview(r);
  }

  async function submit() {
    if (!body.trim()) {
      toast.error('Body is required');
      return;
    }
    if (isNew) {
      const payload: CreateTemplateInput = {
        eventKey: event!.key,
        channel,
        subject: supportsSubject && subject ? subject : undefined,
        body,
        notes: notes || undefined,
      };
      await create.mutateAsync(payload);
    } else {
      await update.mutateAsync({
        id: existing!._id,
        patch: {
          subject: supportsSubject ? subject : undefined,
          body,
          notes,
          isActive,
        },
      });
    }
    onClose();
  }

  function insertVar(v: string) {
    setBody((b) => b + `{{${v}}}`);
  }

  return (
    <Drawer
      title={`${isNew ? 'New' : 'Edit'} template — ${event.key} (${NOTIFICATION_CHANNEL_LABELS[channel]})`}
      onClose={onClose}
      wide
    >
      <p className="text-xs text-gray-500">{event.description}</p>

      {!isNew && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Template is active
        </label>
      )}

      {supportsSubject && (
        <Field
          label="Subject"
          value={subject}
          onChange={setSubject}
          placeholder="e.g. Your order {{orderNumber}}"
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600">Body</label>
          <span className="text-[10px] text-gray-400">{body.length} / 4000</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="Write your message. Use {{variableName}} for substitutions."
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-pink-400 font-mono"
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1.5">
          Available variables (click to insert)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {event.variables.map((v) => (
            <button
              key={v}
              onClick={() => insertVar(v)}
              className="text-[10px] bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded px-2 py-1 font-mono transition-colors"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="Internal notes (optional)"
        value={notes}
        onChange={setNotes}
        placeholder="What's this template for?"
      />

      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
        <div>
          <p className="text-xs font-semibold text-gray-700">Live preview</p>
          <p className="text-[10px] text-gray-400">Uses sample values for each variable</p>
        </div>
        <button
          onClick={runPreview}
          disabled={previewMut.isPending}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Eye className="w-3 h-3" /> Render preview
        </button>
      </div>

      {preview && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {preview.subject && (
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-[10px] uppercase font-semibold text-gray-500">Subject</p>
              <p className="text-sm font-semibold text-gray-900">{preview.subject}</p>
            </div>
          )}
          <div className="px-4 py-3 bg-white">
            <p className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Body</p>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
              {preview.body}
            </pre>
          </div>
          {preview.missing.length > 0 && (
            <div className="bg-amber-50 px-4 py-2 border-t border-amber-200 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Missing values for: {preview.missing.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      <DrawerFooter
        onCancel={onClose}
        onSubmit={submit}
        submitting={create.isPending || update.isPending}
        submitLabel={isNew ? 'Create template' : 'Save'}
      />
    </Drawer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test-send modal
// ─────────────────────────────────────────────────────────────────────────────
function TestSendModal({
  template,
  event,
  onClose,
}: {
  template: NotificationTemplateDto;
  event: NotificationEventDef | undefined;
  onClose: () => void;
}) {
  const testSend = useTestSend();
  const [to, setTo] = useState('');
  const [payload, setPayload] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    event?.variables.forEach((v) => {
      init[v] = '';
    });
    return init;
  });

  async function submit() {
    if (!to.trim()) {
      toast.error('Recipient is required');
      return;
    }
    await testSend.mutateAsync({
      eventKey: template.eventKey,
      channel: template.channel,
      to: to.trim(),
      payload,
    });
    onClose();
  }

  const placeholder =
    template.channel === 'email'
      ? 'guest@example.com'
      : '+919876543210';

  return (
    <Modal title={`Test send — ${template.eventKey}`} onClose={onClose}>
      <p className="text-xs text-gray-500">
        Channel: <strong>{NOTIFICATION_CHANNEL_LABELS[template.channel]}</strong>. If the relevant
        provider isn't configured, the send is mocked but still logged.
      </p>

      <Field
        label={`Recipient (${template.channel === 'email' ? 'email' : 'phone'})`}
        value={to}
        onChange={setTo}
        placeholder={placeholder}
      />

      {event && event.variables.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1.5">Variable values</p>
          <div className="space-y-2">
            {event.variables.map((v) => (
              <div key={v}>
                <label className="block text-[10px] font-mono text-gray-500 mb-0.5">
                  {`{{${v}}}`}
                </label>
                <input
                  value={payload[v] ?? ''}
                  onChange={(e) => setPayload({ ...payload, [v]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-5 mt-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={testSend.isPending}
          className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> Send test
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logs tab
// ─────────────────────────────────────────────────────────────────────────────
function LogsTab() {
  const eventsQuery = useNotificationEvents();
  const [filters, setFilters] = useState<LogQuery>({});
  const [search, setSearch] = useState('');

  const logsQuery = useNotificationLogs(filters);
  const events = eventsQuery.data ?? [];
  const logs = logsQuery.data?.items ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.to.toLowerCase().includes(q) ||
        l.body.toLowerCase().includes(q) ||
        l.eventKey.toLowerCase().includes(q),
    );
  }, [logs, search]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient, body, event..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 w-64"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.eventKey ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, eventKey: e.target.value || undefined })
              }
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="">All events</option>
              {events.map((ev) => (
                <option key={ev.key} value={ev.key}>
                  {ev.key}
                </option>
              ))}
            </select>
            <select
              value={filters.channel ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  channel: (e.target.value as NotificationChannel) || undefined,
                })
              }
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="">All channels</option>
              {NOTIFICATION_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {NOTIFICATION_CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
            <select
              value={filters.status ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: (e.target.value as NotificationStatus) || undefined,
                })
              }
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-400 bg-gray-50"
            >
              <option value="">All statuses</option>
              {Object.entries(NOTIFICATION_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => logsQuery.refetch()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${logsQuery.isFetching ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          <span className="text-xs text-gray-400 ml-auto">
            {logsQuery.isLoading
              ? 'Loading...'
              : `${filtered.length} of ${logs.length} entries`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['When', 'Event', 'Channel', 'Recipient', 'Body', 'Status', ''].map((h) => (
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
              {filtered.map((log) => {
                const Icon = CHANNEL_ICONS[log.channel];
                return (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] text-gray-700 font-mono">{log.eventKey}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        {NOTIFICATION_CHANNEL_LABELS[log.channel]}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">{log.to}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[280px]">
                      {log.subject && (
                        <p className="font-semibold text-gray-700 truncate">{log.subject}</p>
                      )}
                      <p className="truncate">{log.body}</p>
                      {log.errorMessage && (
                        <p className="text-[10px] text-red-600 mt-0.5 truncate">
                          ⚠ {log.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${NOTIFICATION_STATUS_STYLES[log.status]}`}
                      >
                        {NOTIFICATION_STATUS_LABELS[log.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-400 whitespace-nowrap">
                      {log.attempts > 1 ? `${log.attempts} tries` : '—'}
                    </td>
                  </tr>
                );
              })}
              {!logsQuery.isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    <Send className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    No delivery logs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────
function Drawer({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`relative ${wide ? 'max-w-2xl' : 'max-w-lg'} w-full bg-white shadow-2xl h-full overflow-y-auto z-10`}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 truncate pr-3">{title}</h3>
          <button onClick={onClose} className="shrink-0">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
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
          <h3 className="font-semibold text-gray-900 truncate pr-3">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">{children}</div>
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
    <div className="flex gap-3 pt-5 mt-3 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
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
