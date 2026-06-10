import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket, type SocketNamespace } from '@/lib/socket';

type Handlers = Record<string, (payload: unknown) => void>;

/**
 * Subscribe to one Socket.IO namespace and a map of events.
 * Returns the underlying Socket so callers can `.emit()` if needed.
 *
 * Example:
 *   useSocket('/staff', { 'order:new': (o) => qc.invalidateQueries(['orders']) })
 */
export function useSocket(
  namespace: SocketNamespace,
  handlers: Handlers,
  options: { query?: Record<string, string>; enabled?: boolean } = {},
): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (options.enabled === false) return;
    const socket = getSocket(namespace, options.query ?? {});
    socketRef.current = socket;

    const wrapped: Handlers = {};
    for (const [event] of Object.entries(handlers)) {
      const fn = (payload: unknown) => handlersRef.current[event]?.(payload);
      wrapped[event] = fn;
      socket.on(event, fn);
    }
    return () => {
      for (const [event, fn] of Object.entries(wrapped)) socket.off(event, fn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, JSON.stringify(options.query), options.enabled]);

  return socketRef.current;
}
