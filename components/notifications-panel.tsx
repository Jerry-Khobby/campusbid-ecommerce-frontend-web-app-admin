"use client"

import { useEffect, useState } from "react"
import { Bell, Check, CheckCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { useNotification } from "@/lib/notification-context"
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/lib/api/notifications"

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function formatRelativeTime(isoDate: string): string {
  const elapsedSeconds = Math.max(0, (Date.now() - new Date(isoDate).getTime()) / 1000)

  if (elapsedSeconds < SECONDS_PER_MINUTE) return "just now"
  if (elapsedSeconds < SECONDS_PER_HOUR) return `${Math.floor(elapsedSeconds / SECONDS_PER_MINUTE)}m ago`
  if (elapsedSeconds < SECONDS_PER_DAY) return `${Math.floor(elapsedSeconds / SECONDS_PER_HOUR)}h ago`
  return `${Math.floor(elapsedSeconds / SECONDS_PER_DAY)}d ago`
}

/** Notification list + mark-read/delete actions. Self-fetching so it can be
 * dropped into the bell dialog without the caller managing any state. */
export function NotificationsPanel({ onChanged }: { onChanged?: () => void }) {
  const { addNotification } = useNotification()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = () => {
    fetchNotifications()
      .then(setNotifications)
      .catch((error) => addNotification(getErrorMessage(error, "Failed to load notifications"), "error"))
  }

  useEffect(() => {
    setIsLoading(true)
    fetchNotifications()
      .then(setNotifications)
      .catch((error) => addNotification(getErrorMessage(error, "Failed to load notifications"), "error"))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      refetch()
      onChanged?.()
    } catch (error) {
      addNotification(getErrorMessage(error, "Failed to mark notification as read"), "error")
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      refetch()
      onChanged?.()
      addNotification("All notifications marked as read", "success")
    } catch (error) {
      addNotification(getErrorMessage(error, "Failed to mark all as read"), "error")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      refetch()
      onChanged?.()
      addNotification("Notification deleted", "info")
    } catch (error) {
      addNotification(getErrorMessage(error, "Failed to delete notification"), "error")
    }
  }

  if (isLoading) return <p className="text-sm text-gray-500 p-4">Loading notifications...</p>

  const hasUnread = notifications.some((notification) => !notification.isRead)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={!hasUnread}
          className="flex items-center gap-2"
        >
          <CheckCheck size={16} />
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center border border-gray-200 rounded-lg">
          <Bell size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-3 border rounded-lg ${notification.isRead ? "border-gray-200" : "border-purple-300 bg-purple-50"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.isRead && <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />}
                    <p className="font-semibold text-sm text-gray-900 truncate">{notification.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.isRead && (
                    <button onClick={() => handleMarkRead(notification._id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Check size={16} className="text-gray-500" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notification._id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
