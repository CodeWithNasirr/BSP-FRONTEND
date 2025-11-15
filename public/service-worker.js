
self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "New Message", body: "Open Chat" };
  }

  const options = {
    body: data.body,
    icon: "logo.png",
    badge: "logo.png",
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    renotify: true,
  };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: "window" }).then( windowClients => {
    // focus existing client if open
    for (const client of windowClients) {
      if (client.url.includes(url) && 'focus' in client) {
        return client.focus();
      }
    }
    // else open new
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  }));
});
