self.addEventListener("push", (event) => {
	let notification = {};

	if (event.data) {
		try {
			const payload = event.data.json();
			notification = payload.notification || {};
		} catch {
			// Fallback for non-JSON payloads (e.g. DevTools test push)
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

	const url = event.notification.data?.url || "/";

	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url.includes(self.location.origin) && "focus" in client) {
						client.navigate(url);
						return client.focus();
					}
				}
				return clients.openWindow(url);
			}),
	);
});
