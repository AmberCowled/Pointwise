import {
	getRegistryActions,
	type NotificationActionDefinition,
} from "@pointwise/lib/realtime/registry";

export type NotificationAction = NotificationActionDefinition;

export function getNotificationActions(
	type: string,
	data: Record<string, unknown>,
): NotificationAction[] | undefined {
	return getRegistryActions(type, data);
}
