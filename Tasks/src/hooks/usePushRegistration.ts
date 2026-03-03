import { useEffect, useRef } from 'react';
import { pushApi } from '../lib/api';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Url = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Url);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function usePushRegistration(token: string | null) {
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!token || typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    cancelledRef.current = false;

    async function register() {
      const authToken = token;
      if (!authToken) return;
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        await new Promise<void>((resolve) => {
          if (reg.active) resolve();
          else if (reg.installing) reg.installing.addEventListener('statechange', () => { if (reg.active) resolve(); }, { once: true });
          else if (reg.waiting) reg.waiting.addEventListener('statechange', () => { if (reg.active) resolve(); }, { once: true });
          else resolve();
        });

        if (cancelledRef.current) return;
        if (Notification.permission !== 'granted') return;

        let vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
        if (!vapidPublicKey) {
          const res = await pushApi.getVapidPublicKey(authToken);
          if (!res.success || !res.data?.vapidPublicKey) return;
          vapidPublicKey = res.data.vapidPublicKey;
        }
        if (!vapidPublicKey || cancelledRef.current) return;

        const existing = await reg.pushManager.getSubscription();
        let subscription = existing;
        if (!subscription) {
          const key = urlBase64ToUint8Array(vapidPublicKey);
          const buf = key.buffer.slice(0) as ArrayBuffer;
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: buf,
          });
        }
        if (!subscription || cancelledRef.current) return;

        const sub = subscription.toJSON();
        if (sub.endpoint && sub.keys) {
          await pushApi.subscribe(
            { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
            authToken
          );
        }
      } catch (err) {
        console.warn('Push registration failed:', err);
      }
    }

    register();
    return () => {
      cancelledRef.current = true;
    };
  }, [token]);
}
