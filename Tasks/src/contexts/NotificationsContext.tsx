import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../lib/api';

export interface PushNotificationPayload {
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, unknown>;
}

interface NotificationsContextValue {
  /** Increments when a new inbox message is received (use as dependency to refetch inbox). */
  inboxVersion: number;
  /** Latest new message payload (from inbox:new event). */
  latestInboxMessage: Record<string, unknown> | null;
  /** Latest push notification (from notification:push event). */
  latestPushNotification: PushNotificationPayload | null;
  /** Dismiss the inbox toast. */
  dismissInboxToast: () => void;
  /** Dismiss the push toast. */
  dismissPushToast: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({
  children,
  token,
}: {
  children: ReactNode;
  token: string | null;
}) {
  const [inboxVersion, setInboxVersion] = useState(0);
  const [latestInboxMessage, setLatestInboxMessage] = useState<Record<string, unknown> | null>(null);
  const [latestPushNotification, setLatestPushNotification] = useState<PushNotificationPayload | null>(null);

  const dismissInboxToast = useCallback(() => {
    setLatestInboxMessage(null);
  }, []);

  const dismissPushToast = useCallback(() => {
    setLatestPushNotification(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket: Socket = io(WS_URL, {
      auth: { token },
      path: '/socket.io',
    });
    socket.on('inbox:new', (payload: Record<string, unknown>) => {
      setLatestInboxMessage(payload);
      setInboxVersion((v) => v + 1);
    });
    socket.on('notification:push', (payload: PushNotificationPayload) => {
      setLatestPushNotification(payload);
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [token]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      inboxVersion,
      latestInboxMessage,
      latestPushNotification,
      dismissInboxToast,
      dismissPushToast,
    }),
    [inboxVersion, latestInboxMessage, latestPushNotification, dismissInboxToast, dismissPushToast]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  return (
    ctx ?? {
      inboxVersion: 0,
      latestInboxMessage: null,
      latestPushNotification: null,
      dismissInboxToast: () => {},
      dismissPushToast: () => {},
    }
  );
}
