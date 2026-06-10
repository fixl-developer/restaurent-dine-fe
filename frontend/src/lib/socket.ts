import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';

/**
 * Socket.IO factory keyed by namespace. Reuses a single connection per
 * namespace across the app — components subscribe via `useSocket(namespace)`.
 */
const sockets = new Map<string, Socket>();

export type SocketNamespace = '/staff' | '/kds' | '/guest' | '/now-serving' | '/menu';

export function getSocket(namespace: SocketNamespace, query: Record<string, string> = {}): Socket {
  const key = namespace + JSON.stringify(query);
  const existing = sockets.get(key);
  if (existing) return existing;

  const socket = io(env.socketUrl + namespace, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    query,
  });
  sockets.set(key, socket);
  return socket;
}

export function closeAllSockets(): void {
  for (const socket of sockets.values()) socket.disconnect();
  sockets.clear();
}

// Hot module reload safety — keep no stale connections across HMR.
if (import.meta.hot) {
  import.meta.hot.dispose(() => closeAllSockets());
}
