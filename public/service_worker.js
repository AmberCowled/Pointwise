self.addEventListener("push", (event) => {
	let notification = {};
	if (event.data) {
		try {
			const payload = event.data.json();
			notification = payload.notification || {};
		} catch {
			notification = { body: event.data.text() };
		}
	}
	const title = notification.title || "Pointwise";
	const options = {
		body: notification.body || "You have a new notification.",
		icon: "/logo.png",
		data: notification.data || {},
	};
	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url;
	if (url) {
		event.waitUntil(
			clients
				.matchAll({ type: "window", includeUncontrolled: true })
				.then((windowClients) => {
					for (const client of windowClients) {
						if (client.url.includes(url) && "focus" in client) {
							return client.focus();
						}
					}
					if (clients.openWindow) {
						return clients.openWindow(url);
					}
				}),
		);
	}
});
