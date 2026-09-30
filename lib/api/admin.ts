import { apiFetch } from "./client"
import type { AdminAnalytics, AdminDashboard, SafeUser } from "./types"

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const json = await apiFetch<{ data: AdminDashboard }>("/admin/dashboard")
  return json.data
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const json = await apiFetch<{ data: AdminAnalytics }>("/admin/analytics")
  return json.data
}

export interface CreateAdminInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export async function createAdmin(input: CreateAdminInput): Promise<SafeUser> {
  const json = await apiFetch<{ user: SafeUser }>("/users/create-admin", { method: "POST", body: input })
  return json.user
}
