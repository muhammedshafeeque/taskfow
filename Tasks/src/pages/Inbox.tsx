import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { inboxApi, invitationsApi, type InboxMessage } from '../lib/api';
import { formatDateTimeDDMMYYYY } from '../lib/dateFormat';

const VISIBLE_INBOX_TYPES = new Set([
  'project_invitation',
  'project_invitation_request',
  'project_invite',
  'release_notes',
  'announcement',
  'permission_granted',
]);

function getInboxTypeLabel(type: string): string {
  if (type.includes('invitation')) return 'Invitation';
  if (type === 'release_notes') return 'Release notes';
  if (type === 'announcement') return 'Announcement';
  if (type === 'permission_granted') return 'Permission update';
  return 'Inbox';
}

export default function Inbox() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { inboxVersion, markInboxItemRead, refreshInboxUnreadCount } = useNotifications();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function loadInbox() {
    if (!token) return;
    setLoading(true);
    inboxApi
      .list(1, 50, token)
      .then((res) => {
        if (res.success && res.data) {
          const next = ((res.data as { data: InboxMessage[] }).data ?? []).filter((item) =>
            VISIBLE_INBOX_TYPES.has(item.type) || item.type.includes('invitation')
          );
          setMessages(next);
          setSelectedMessage((prev) => {
            if (!prev) return next[0] ?? null;
            return next.find((m) => m._id === prev._id) ?? next[0] ?? null;
          });
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token || location.pathname !== '/inbox') return;
    loadInbox();
  }, [token, inboxVersion, location.pathname]);

  async function markRead(id: string) {
    await markInboxItemRead(id);
    const now = new Date().toISOString();
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, readAt: m.readAt ?? now } : m)));
    setSelectedMessage((prev) => (prev?._id === id ? { ...prev, readAt: prev.readAt ?? now } : prev));
  }

  function openMessage(m: InboxMessage) {
    setSelectedMessage(m);
    setActionError(null);
    if (!m.readAt) markRead(m._id);
  }

  async function acceptInvitation(invitationId: string) {
    if (!token) return;
    setActionError(null);
    setActionId(invitationId);
    const res = await invitationsApi.accept(invitationId, token);
    setActionId(null);
    if (res.success && res.data && (res.data as { projectId?: string }).projectId) {
      const projectId = (res.data as { projectId: string }).projectId;
      setMessages((prev) =>
        prev.map((m) =>
          m.type === 'project_invitation' && m.meta?.invitationId === invitationId
            ? { ...m, meta: { ...m.meta, invitationId: m.meta.invitationId, status: 'accepted' } }
            : m
        )
      );
      setSelectedMessage((prev) =>
        prev?.meta?.invitationId === invitationId
          ? { ...prev, meta: { ...prev.meta, invitationId: prev.meta?.invitationId, status: 'accepted' as const } }
          : prev
      );
      setSelectedMessage(null);
      refreshInboxUnreadCount();
      navigate(`/projects/${projectId}/dashboard`);
    } else {
      setActionError((res as { message?: string }).message ?? 'Could not accept invitation.');
      loadInbox();
      setSelectedMessage(null);
    }
  }

  async function declineInvitation(invitationId: string) {
    if (!token) return;
    setActionError(null);
    setActionId(invitationId);
    const res = await invitationsApi.decline(invitationId, token);
    setActionId(null);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => !(m.type === 'project_invitation' && m.meta?.invitationId === invitationId)));
      if (selectedMessage?.meta?.invitationId === invitationId) setSelectedMessage(null);
      refreshInboxUnreadCount();
    } else {
      setActionError((res as { message?: string }).message ?? 'Could not decline invitation.');
      loadInbox();
      if (selectedMessage?.meta?.invitationId === invitationId) setSelectedMessage(null);
    }
  }

  const isInvitationPending = (m: InboxMessage) =>
    m.type === 'project_invitation' && m.meta?.invitationId && m.meta?.status !== 'accepted';

  const mustChange = user?.mustChangePassword ?? false;
  const unreadMessages = useMemo(() => messages.filter((m) => !m.readAt), [messages]);
  const readMessages = useMemo(() => messages.filter((m) => !!m.readAt), [messages]);

  return (
    <div className="p-4 sm:p-6 w-full">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">Inbox</h1>
          <p className="text-xs text-[color:var(--text-muted)] mt-1">
            Project invitations, release notes, and important updates.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-1 rounded-full bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)]">
            Total {messages.length}
          </span>
          <span className="px-2 py-1 rounded-full bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-[color:var(--accent)]">
            Unread {unreadMessages.length}
          </span>
        </div>
      </div>
      {mustChange && (
        <div className="mb-4 p-3 rounded-lg bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] text-[color:var(--text-muted)] text-xs leading-relaxed">
          <strong className="text-[color:var(--text-primary)]">Welcome to TaskFlow.</strong>{' '}
          Please change your password from your profile or use Forgot password after signing out.
        </div>
      )}
      {loading ? (
        <p className="text-[color:var(--text-muted)] text-xs">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-8 text-center">
          <p className="text-sm font-medium text-[color:var(--text-primary)]">No inbox items</p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            You will see invitation requests and release notes here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px),minmax(0,1fr)] gap-5 w-full">
          <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-3">
            <div className="space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              {unreadMessages.length > 0 && (
                <section>
                  <p className="px-2 pb-2 text-[11px] uppercase tracking-wide text-[color:var(--text-muted)]">
                    Unread
                  </p>
                  <ul className="space-y-2">
                    {unreadMessages.map((m) => (
                      <li
                        key={m._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openMessage(m)}
                        onKeyDown={(e) => e.key === 'Enter' && openMessage(m)}
                        className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                          selectedMessage?._id === m._id
                            ? 'bg-[color:var(--bg-elevated)] border-[color:var(--border-subtle)] ring-1 ring-[color:var(--border-subtle)]'
                            : 'bg-[color:var(--bg-elevated)] border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-[color:var(--accent)] shrink-0" />
                              <p className="text-[11px] text-[color:var(--text-muted)]">{getInboxTypeLabel(m.type)}</p>
                            </div>
                            <h3 className="mt-1 font-medium text-[color:var(--text-primary)] truncate text-sm">{m.title}</h3>
                            {m.body && <p className="mt-0.5 text-[color:var(--text-muted)] text-xs line-clamp-1">{m.body}</p>}
                            <p className="mt-1 text-[color:var(--text-muted)] text-[11px]">
                              {m.createdAt ? formatDateTimeDDMMYYYY(m.createdAt) : ''}
                            </p>
                          </div>
                          {isInvitationPending(m) && (
                            <span className="shrink-0 text-[11px] text-[color:var(--text-muted)] font-medium">Pending</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {readMessages.length > 0 && (
                <section>
                  <p className="px-2 pb-2 text-[11px] uppercase tracking-wide text-[color:var(--text-muted)]">Read</p>
                  <ul className="space-y-2">
                    {readMessages.map((m) => (
                      <li
                        key={m._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openMessage(m)}
                        onKeyDown={(e) => e.key === 'Enter' && openMessage(m)}
                        className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                          selectedMessage?._id === m._id
                            ? 'bg-[color:var(--bg-elevated)] border-[color:var(--border-subtle)] ring-1 ring-[color:var(--border-subtle)]'
                            : 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)]'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] text-[color:var(--text-muted)]">{getInboxTypeLabel(m.type)}</p>
                          <h3 className="mt-1 font-medium text-[color:var(--text-primary)] truncate text-sm">{m.title}</h3>
                          {m.body && <p className="mt-0.5 text-[color:var(--text-muted)] text-xs line-clamp-1">{m.body}</p>}
                          <p className="mt-1 text-[color:var(--text-muted)] text-[11px]">
                            {m.createdAt ? formatDateTimeDDMMYYYY(m.createdAt) : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] overflow-hidden flex flex-col min-h-[18rem]">
            {selectedMessage ? (
              <div className="p-4 overflow-y-auto flex-1 min-h-0">
                {actionError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {actionError}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-[11px] bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-[color:var(--text-muted)]">
                    {getInboxTypeLabel(selectedMessage.type)}
                  </span>
                  {!selectedMessage.readAt && (
                    <span className="px-2 py-1 rounded-full text-[11px] bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                      Unread
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold text-[color:var(--text-primary)]">{selectedMessage.title}</h2>
                <p className="mt-1 text-[color:var(--text-muted)] text-xs">
                  {selectedMessage.createdAt ? formatDateTimeDDMMYYYY(selectedMessage.createdAt) : ''}
                </p>
                <div className="mt-4 text-[color:var(--text-primary)] text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.body || '—'}
                </div>
                {selectedMessage.type === 'release_notes' && (selectedMessage.meta as { projectId?: string })?.projectId && (
                  <div className="mt-5 pt-4 border-t border-[color:var(--border-subtle)]">
                    <Link
                      to={`/projects/${(selectedMessage.meta as { projectId: string }).projectId}/versions`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] font-medium hover:bg-[color:var(--bg-surface)] transition"
                    >
                      View release notes
                    </Link>
                  </div>
                )}
                {selectedMessage.type === 'project_invitation' && selectedMessage.meta?.invitationId && (
                  <div className="mt-5 pt-4 border-t border-[color:var(--border-subtle)]">
                    {selectedMessage.meta?.status === 'accepted' ? (
                      <p className="text-[color:var(--accent)] text-xs font-medium">You accepted this invitation.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => acceptInvitation(selectedMessage.meta!.invitationId!)}
                          disabled={actionId === selectedMessage.meta?.invitationId}
                          className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] font-medium hover:bg-[color:var(--bg-surface)] disabled:opacity-50 transition"
                        >
                          {actionId === selectedMessage.meta?.invitationId ? 'Accepting…' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          onClick={() => declineInvitation(selectedMessage.meta!.invitationId!)}
                          disabled={actionId === selectedMessage.meta?.invitationId}
                          className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-xs text-[color:var(--text-muted)] font-medium hover:text-[color:var(--text-primary)] disabled:opacity-50 transition"
                        >
                          {actionId === selectedMessage.meta?.invitationId ? 'Declining…' : 'Decline'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {!selectedMessage.readAt && selectedMessage.type !== 'project_invitation' && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => markRead(selectedMessage._id)}
                      className="text-[color:var(--accent)] hover:underline text-xs font-medium"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <p className="text-xs text-[color:var(--text-muted)]">Select an inbox item to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
