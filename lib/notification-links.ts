import type { AppNotification } from "./api/notifications"

/** Where a notification should take the admin when they open it, or null when it is informational only. */
export function getNotificationLink(notification: AppNotification): string | null {
  if (notification.type === "payment" || notification.type === "payment_disputed") return "/admin/payments"
  if (notification.data?.orderId || notification.data?.orderIds) return "/admin/orders"
  if (notification.type === "order_update" || notification.type === "order_status_changed") return "/admin/orders"
  return null
}
