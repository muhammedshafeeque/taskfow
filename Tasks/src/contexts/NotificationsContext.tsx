import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL, inboxApi, notificationsApi, type InAppNotification } from '../lib/api';

export interface PushNotificationPayload {
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, unknown>;
}

export interface AppToastPayload {
  title: string;
  body?: string;
  url?: string;
  autoDismissMs?: number;
}

interface NotificationsContextValue {
  /** Increments when a new inbox message is received (use as dependency to refetch inbox). */
  inboxVersion: number;
  /** Latest new message payload (from inbox:new event). */
  latestInboxMessage: Record<string, unknown> | null;
  /** Latest push notification (from notification:push event). */
  latestPushNotification: PushNotificationPayload | null;
  /** In-app notifications (persisted). */
  notifications: InAppNotification[];
  inboxUnreadCount: number;
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  markInboxItemRead: (id: string) => Promise<void>;
  refreshInboxUnreadCount: () => Promise<void>;
  /** Dismiss the inbox toast. */
  dismissInboxToast: () => void;
  /** Dismiss the push toast. */
  dismissPushToast: () => void;
  /** Subscribe to project:refresh for a project. Returns unsubscribe. */
  subscribeProject: (projectId: string, onRefresh: () => void) => () => void;
  /** Global app-level toast for local success/error messages */
  appToast: AppToastPayload | null;
  showToast: (toast: AppToastPayload) => void;
  dismissAppToast: () => void;
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
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [appToast, setAppToast] = useState<AppToastPayload | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const projectCallbacksRef = useRef<Map<string, () => void>>(new Map());

  const showToast = useCallback((toast: AppToastPayload) => {
    setAppToast(toast);
  }, []);

  const dismissAppToast = useCallback(() => {
    setAppToast(null);
  }, []);

  const dismissInboxToast = useCallback(() => {
    setLatestInboxMessage(null);
  }, []);

  const dismissPushToast = useCallback(() => {
    setLatestPushNotification(null);
  }, []);

  const refreshInboxUnreadCount = useCallback(async () => {
    if (!token) return;
    const res = await inboxApi.unreadCount(token);
    if (res.success && res.data) setInboxUnreadCount(res.data.unread ?? 0);
  }, [token]);

  const subscribeProject = useCallback((projectId: string, onRefresh: () => void) => {
    projectCallbacksRef.current.set(projectId, onRefresh);
    const socket = socketRef.current;
    if (socket?.connected) socket.emit('subscribe:project', projectId);
    return () => {
      projectCallbacksRef.current.delete(projectId);
      if (socketRef.current?.connected) socketRef.current.emit('unsubscribe:project', projectId);
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    if (!token) return;
    const res = await notificationsApi.markRead(id, token);
    if (res.success && res.data) {
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, isRead: true, readAt: (res.data as { readAt?: string }).readAt ?? now }
            : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }, [token]);

  const markAllRead = useCallback(async () => {
    if (!token) return;
    const res = await notificationsApi.markAllRead(token);
    if (res.success) {
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? now }))
      );
      setUnreadCount(0);
    }
  }, [token]);

  const markInboxItemRead = useCallback(async (id: string) => {
    if (!token) return;
    const res = await inboxApi.markRead(id, token);
    if (res.success) setInboxUnreadCount((c) => Math.max(0, c - 1));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // initial load
    inboxApi.unreadCount(token).then((res) => {
      if (res.success && res.data) setInboxUnreadCount(res.data.unread ?? 0);
    });
    notificationsApi.unreadCount(token).then((res) => {
      if (res.success && res.data) setUnreadCount(res.data.unread ?? 0);
    });
    notificationsApi.list({ page: 1, limit: 20 }, token).then((res) => {
      if (res.success && res.data?.data) setNotifications(res.data.data);
    });
    const socket: Socket = io(WS_URL, {
      auth: { token },
      path: '/socket.io',
    });
    socketRef.current = socket;
    socket.on('inbox:new', (payload: Record<string, unknown>) => {
      setLatestInboxMessage(payload);
      setInboxVersion((v) => v + 1);
      setInboxUnreadCount((c) => c + 1);
    });
    socket.on('notification:push', (payload: PushNotificationPayload) => {
      setLatestPushNotification(payload);
    });
    socket.on('notification:new', (payload: InAppNotification) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    });
    socket.on('project:refresh', (payload: { projectId?: string }) => {
      const pid = payload?.projectId;
      if (pid && typeof pid === 'string') {
        const cb = projectCallbacksRef.current.get(pid);
        if (cb) cb();
      }
    });
    socket.on('connect', () => {
      for (const projectId of projectCallbacksRef.current.keys()) {
        socket.emit('subscribe:project', projectId);
      }
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      inboxVersion,
      latestInboxMessage,
      latestPushNotification,
      notifications,
      inboxUnreadCount,
      unreadCount,
      markRead,
      markAllRead,
      markInboxItemRead,
      refreshInboxUnreadCount,
      dismissInboxToast,
      dismissPushToast,
      subscribeProject,
      appToast,
      showToast,
      dismissAppToast,
    }),
    [inboxVersion, latestInboxMessage, latestPushNotification, notifications, inboxUnreadCount, unreadCount, markRead, markAllRead, markInboxItemRead, refreshInboxUnreadCount, dismissInboxToast, dismissPushToast, subscribeProject, appToast, showToast, dismissAppToast]
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
      notifications: [],
      inboxUnreadCount: 0,
      unreadCount: 0,
      markRead: async () => {},
      markAllRead: async () => {},
      markInboxItemRead: async () => {},
      refreshInboxUnreadCount: async () => {},
      dismissInboxToast: () => {},
      dismissPushToast: () => {},
      subscribeProject: () => () => {},
      appToast: null,
      showToast: () => {},
      dismissAppToast: () => {},
    }
  );
}
