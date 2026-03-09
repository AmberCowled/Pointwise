"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import {
	api,
	useAcceptInviteMutation,
	useApproveJoinRequestMutation,
	useDeleteNotificationMutation,
	useGetNotificationsQuery,
	useMarkAllReadMutation,
	useRejectInviteMutation,
	useRejectJoinRequestMutation,
} from "@pointwise/generated/api";
import { invalidateTags } from "@pointwise/generated/invalidation";
import type { NotificationAction } from "@pointwise/lib/notifications/actions";
import { getNotificationActions } from "@pointwise/lib/notifications/actions";
import {
	FALLBACK_RENDERER,
	getNotificationMenu,
	NOTIFICATION_RENDERERS,
} from "@pointwise/lib/realtime/registry";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import type { Notification } from "@pointwise/lib/validation/notification-schema";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { IoCheckmark, IoClose, IoNotifications } from "react-icons/io5";
import ProfilePicture from "../userCard/ProfilePicture";

export default function NotificationMenu() {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data, isLoading } = useGetNotificationsQuery(
		{},
		{
			skip: !userId,
		},
	);
	const notifications = data?.notifications ?? [];

	const [markAllRead] = useMarkAllReadMutation();
	const [acceptInvite] = useAcceptInviteMutation();
	const [rejectInvite] = useRejectInviteMutation();
	const [approveJoinRequest] = useApproveJoinRequestMutation();
	const [rejectJoinRequest] = useRejectJoinRequestMutation();
	const [deleteNotification] = useDeleteNotificationMutation();

	// Track selected roles for join request approval per notification
	const [joinRequestRoles, setJoinRequestRoles] = useState<
		Record<string, "ADMIN" | "USER" | "VIEWER">
	>({});

	// Track which notifications have pending actions
	const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

	// Remove a notification from cache optimistically
	const removeNotificationFromCache = useCallback(
		(notificationId: string) => {
			dispatch(
				api.util.updateQueryData("getNotifications", {}, (draft) => {
					draft.notifications = draft.notifications.filter(
						(n) => n.id !== notificationId,
					);
				}),
			);
		},
		[dispatch],
	);

	const handleAction = useCallback(
		async (notification: Notification, action: NotificationAction) => {
			const notifData = notification.data as Record<string, unknown>;
			const payload = action.getPayload(notifData);

			setPendingActions((prev) => new Set(prev).add(notification.id));

			try {
				if (notification.type === "PROJECT_INVITE_RECEIVED") {
					if (action.variant === "accept") {
						await acceptInvite(payload.inviteId as string).unwrap();
					} else {
						await rejectInvite(payload.inviteId as string).unwrap();
					}
				} else if (notification.type === "PROJECT_JOIN_REQUEST_RECEIVED") {
					if (action.variant === "accept") {
						const role = joinRequestRoles[notification.id] ?? "USER";
						await approveJoinRequest({
							projectId: payload.projectId as string,
							userId: payload.userId as string,
							role,
						}).unwrap();
					} else {
						await rejectJoinRequest({
							projectId: payload.projectId as string,
							userId: payload.userId as string,
						}).unwrap();
					}
				}

				// Optimistically remove from cache, then delete from DB
				removeNotificationFromCache(notification.id);
				void deleteNotification(notification.id);
				dispatch(
					invalidateTags([
						"Projects",
						"Invites",
						"JoinRequests",
						"Notifications",
					]),
				);
			} catch (err) {
				console.error("Notification action failed:", err);
			} finally {
				setPendingActions((prev) => {
					const next = new Set(prev);
					next.delete(notification.id);
					return next;
				});
			}
		},
		[
			acceptInvite,
			rejectInvite,
			approveJoinRequest,
			rejectJoinRequest,
			deleteNotification,
			joinRequestRoles,
			removeNotificationFromCache,
			dispatch,
		],
	);

	// Only show notifications routed to the "notifications" menu
	const notificationMenuItems = useMemo(
		() =>
			notifications.filter(
				(n) => getNotificationMenu(n.type) === "notifications",
			),
		[notifications],
	);
	const unreadCount = useMemo(
		() => notificationMenuItems.filter((n) => !n.read).length,
		[notificationMenuItems],
	);

	const handleOpenMenu = () => {
		if (unreadCount > 0) {
			// Optimistically mark all notification-menu items as read in cache
			const patchResult = dispatch(
				api.util.updateQueryData("getNotifications", {}, (draft) => {
					for (const n of draft.notifications) {
						if (getNotificationMenu(n.type) === "notifications") {
							n.read = true;
						}
					}
				}),
			);

			// Exclude types routed to other menus so opening the bell doesn't mark them as read
			const excludeTypes = notifications
				.filter((n) => getNotificationMenu(n.type) !== "notifications")
				.map((n) => n.type)
				.filter((t, i, arr) => arr.indexOf(t) === i);
			markAllRead(excludeTypes.length > 0 ? { excludeTypes } : {})
				.unwrap()
				.catch(() => {
					patchResult.undo();
				});
		}
	};

	return (
		<Menu
			trigger={
				<Button
					icon={IoNotifications}
					badgeCount={unreadCount}
					title="Notifications"
					aria-label={`Notifications (${unreadCount})`}
					onClick={handleOpenMenu}
				/>
			}
		>
			<Menu.Section title="Notifications">
				{isLoading ? (
					<Menu.Option label="Loading notifications..." disabled />
				) : notificationMenuItems.length === 0 ? (
					<Menu.Option label="No notifications yet" disabled />
				) : (
					notificationMenuItems.map((notification) => {
						const renderer =
							NOTIFICATION_RENDERERS[notification.type] ?? FALLBACK_RENDERER;
						const notifData = notification.data as Record<string, unknown>;
						const userInfo = renderer.getUser(notifData);
						const actorUserId = renderer.getUserId?.(notifData);
						const message = renderer.getMessage(notifData);
						const href = renderer.getHref?.(notifData);
						const actions = getNotificationActions(
							notification.type,
							notifData,
						);
						const isActionPending = pendingActions.has(notification.id);

						const hasLink = !actions && !!href;

						const content = (
							<div
								key={notification.id}
								className="flex items-center gap-3 px-3 py-2 min-w-[300px]"
							>
								<ProfilePicture
									profilePicture={userInfo.image ?? ""}
									displayName={userInfo.name}
									userId={actorUserId}
									size="xs"
									disabled={hasLink}
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-zinc-100 wrap-break-word">
										{message}
									</p>
									<span className="text-[10px] text-zinc-500 uppercase tracking-wider">
										{new Date(notification.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								{actions ? (
									<div className="flex items-center gap-1.5">
										{notification.type === "PROJECT_JOIN_REQUEST_RECEIVED" && (
											<select
												value={joinRequestRoles[notification.id] ?? "USER"}
												onChange={(e) =>
													setJoinRequestRoles((prev) => ({
														...prev,
														[notification.id]: e.target.value as
															| "ADMIN"
															| "USER"
															| "VIEWER",
													}))
												}
												className={`h-7 rounded bg-zinc-800 px-1.5 text-xs ${StyleTheme.Text.Tertiary} border border-zinc-700 focus:outline-none focus:border-indigo-500`}
											>
												<option value="ADMIN">Admin</option>
												<option value="USER">User</option>
												<option value="VIEWER">Viewer</option>
											</select>
										)}
										{actions.map((action) => (
											<button
												key={action.variant}
												type="button"
												onClick={() => handleAction(notification, action)}
												disabled={isActionPending}
												className={
													action.variant === "accept"
														? "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
														: "flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
												}
												title={action.label}
											>
												{action.variant === "accept" ? (
													<IoCheckmark className="h-4 w-4" />
												) : (
													<IoClose className="h-4 w-4" />
												)}
											</button>
										))}
									</div>
								) : (
									!notification.read && (
										<div className="h-2 w-2 rounded-full bg-indigo-500" />
									)
								)}
							</div>
						);

						if (!actions && href) {
							return (
								<a key={notification.id} href={href}>
									{content}
								</a>
							);
						}
						return content;
					})
				)}
			</Menu.Section>
		</Menu>
	);
}
