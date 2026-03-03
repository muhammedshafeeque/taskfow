/* eslint-disable no-restricted-globals */
self.addEventListener('push', function (event) {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Notification', body: event.data.text() || '' };
  }
  const title = payload.title || 'TaskFlow';
  const options = {
    body: payload.body || '',
    icon: '/vite.svg',
    data: payload.data || {},
    tag: payload.data?.invitationId ? 'invitation-' + payload.data.invitationId : undefined,
  };
  if (payload.url) options.data.url = payload.url;
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/inbox';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url && clientList[i].focus) {
          clientList[i].navigate(url);
          return clientList[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
