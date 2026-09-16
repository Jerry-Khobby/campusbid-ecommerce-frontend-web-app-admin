import { apiFetch } from "./client"
import type { AdminAnalytics, AdminDashboard } from "./types"

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const json = await apiFetch<{ data: AdminDashboard }>("/admin/dashboard")
  return json.data
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const json = await apiFetch<{ data: AdminAnalytics }>("/admin/analytics")
  return json.data
}
