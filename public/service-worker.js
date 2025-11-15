// FORCE NEW SW to activate immediately
self.addEventListener("install", (event) => {
  console.log("SW Install — forcing activation");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW Activated — claiming clients");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "New Message", body: "Open Chat" };
  }

  // SAFE TITLE
  const title = data.title?.trim() || "New Message";

  // SAFE OPTIONS — guaranteed NEW FORMAT
  const options = {
    body: data.body || "",
    icon: "logo.png",
    badge: "logo.png",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],

    // THIS MUST BE INCLUDED
    tag: "msg-" + Date.now(),
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
