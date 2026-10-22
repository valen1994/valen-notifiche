
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Ricezione notifiche push da remoto
self.addEventListener('push', event => {
  let data = {
    title: 'VALEN Notifiche',
    body: 'Hai una nuova comunicazione VALEN.',
    url: './'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.svg',
      badge: './icon.svg',
      tag: 'valen-push',
      data: { url: data.url }
    })
  );
});

// Apertura della web app quando si tocca la notifica
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url || './',
    self.registration.scope
  );

  if (url.origin !== self.location.origin ||
      !url.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(async clients => {
      for (const client of clients) {
        if (client.url.startsWith(self.registration.scope)) {
          return client.focus();
        }
      }

      return self.clients.openWindow(url.href);
    })
  );
});
