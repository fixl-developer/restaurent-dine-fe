import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Clock, Coffee, ChefHat } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useOrders } from '@/hooks/useOrders';
import { useRestaurant } from '@/hooks/useRestaurant';

interface BoardEntry {
  token: string;
  status: 'placed' | 'preparing' | 'ready' | 'picked_up';
  at: number;
}

interface WindowUpdatePayload {
  windowToken?: string;
  status?: 'placed' | 'preparing' | 'ready' | 'picked_up';
}

/**
 * Public TV board for the takeaway/window queue. Listens to /now-serving socket
 * updates and renders ready tokens prominently. Tokens auto-clear from "ready"
 * shortly after they're picked up.
 *
 * The page is intentionally requires no auth — open at the counter on a TV.
 */
export default function NowServingPage() {
  const restaurant = useRestaurant();
  const [board, setBoard] = useState<Map<string, BoardEntry>>(new Map());

  // Seed with currently-open window orders so the board fills in on first load
  const openOrders = useOrders({ channel: 'window', limit: 50 });

  useEffect(() => {
    if (!openOrders.data) return;
    const next = new Map<string, BoardEntry>();
    for (const o of openOrders.data.items) {
      if (!o.windowToken) continue;
      if (o.status === 'settled' || o.status === 'cancelled') continue;
      const status =
        o.status === 'ready'
          ? 'ready'
          : o.status === 'served'
            ? 'picked_up'
            : o.status === 'preparing' || o.status === 'accepted'
              ? 'preparing'
              : 'placed';
      next.set(o.windowToken, {
        token: o.windowToken,
        status,
        at: new Date(o.updatedAt).getTime(),
      });
    }
    setBoard(next);
  }, [openOrders.data]);

  // Live updates
  useSocket('/now-serving', {
    'window:update': (payload: unknown) => {
      const p = payload as WindowUpdatePayload;
      if (!p.windowToken || !p.status) return;
      setBoard((prev) => {
        const next = new Map(prev);
        if (p.status === 'picked_up') {
          // Keep "picked_up" visible briefly, then drop
          next.set(p.windowToken!, {
            token: p.windowToken!,
            status: 'picked_up',
            at: Date.now(),
          });
          setTimeout(() => {
            setBoard((later) => {
              const c = new Map(later);
              c.delete(p.windowToken!);
              return c;
            });
          }, 15_000);
        } else {
          next.set(p.windowToken!, {
            token: p.windowToken!,
            status: p.status!,
            at: Date.now(),
          });
        }
        return next;
      });
    },
  });

  const entries = useMemo(() => Array.from(board.values()), [board]);
  const ready = entries.filter((e) => e.status === 'ready').sort((a, b) => a.at - b.at);
  const preparing = entries.filter((e) => e.status === 'preparing' || e.status === 'placed').sort((a, b) => a.at - b.at);
  const justPickedUp = entries.filter((e) => e.status === 'picked_up').sort((a, b) => b.at - a.at);

  const restaurantName = restaurant.data?.brand.name ?? 'SmartDine';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur">
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-pink-500">Now Serving</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">{restaurantName}</h1>
        </div>
        <div className="text-right">
          <ClockDisplay />
        </div>
      </header>

      <main className="flex-1 px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ready column — biggest */}
        <section className="md:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Ready to pick up
              {ready.length > 0 && (
                <span className="ml-3 text-base font-medium text-emerald-600">
                  {ready.length} waiting
                </span>
              )}
            </h2>
          </div>

          {ready.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-gray-300 text-lg">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-30" />
                All caught up — no orders ready yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1 content-start">
              {ready.map((entry) => (
                <ReadyTokenCard key={entry.token} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* Side column: preparing + just picked up */}
        <section className="space-y-6">
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Preparing</h3>
              {preparing.length > 0 && (
                <span className="text-xs text-gray-400 ml-auto">{preparing.length}</span>
              )}
            </div>
            {preparing.length === 0 ? (
              <p className="text-sm text-gray-400">No orders in the kitchen.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preparing.map((e) => (
                  <span
                    key={e.token}
                    className="text-base font-bold px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl"
                  >
                    {e.token}
                  </span>
                ))}
              </div>
            )}
          </div>

          {justPickedUp.length > 0 && (
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Just picked up</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {justPickedUp.map((e) => (
                  <span
                    key={e.token}
                    className="text-sm font-semibold px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg line-through"
                  >
                    {e.token}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="px-8 py-4 border-t border-gray-200 bg-white/50 backdrop-blur flex items-center justify-between">
        <p className="text-xs text-gray-400">Updates in real time · Stay near the counter when your number is ready</p>
        <p className="text-[10px] text-gray-300">Powered by SmartDine</p>
      </footer>
    </div>
  );
}

function ReadyTokenCard({ entry }: { entry: BoardEntry }) {
  const ageSec = Math.floor((Date.now() - entry.at) / 1000);
  const isNew = ageSec < 30;
  return (
    <div
      className={`bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 rounded-2xl p-6 text-center transition-all ${
        isNew ? 'border-emerald-400 scale-105 shadow-lg shadow-emerald-200 animate-pulse' : 'border-emerald-200'
      }`}
    >
      <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mb-2">
        Token
      </p>
      <p className="text-5xl md:text-6xl font-black text-emerald-800 tabular-nums">{entry.token}</p>
      {isNew && (
        <p className="text-[10px] font-semibold text-emerald-700 mt-2 uppercase tracking-wider">
          Just ready!
        </p>
      )}
    </div>
  );
}

function ClockDisplay() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs text-gray-500">
        {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
      </p>
    </>
  );
}
