import { apiFetch } from "./client"
import type { AdminCustomer } from "./types"

interface AdminUsersResponse {
  items: AdminCustomer[]
  total: number
  page: number
  limit: number
}

export async function fetchAdminCustomers(search?: string): Promise<AdminCustomer[]> {
  const json = await apiFetch<{ data: AdminUsersResponse }>("/users/admin", {
    query: { search, limit: 100 },
  })
  return json.data.items
}

export async function approveCustomer(id: string): Promise<AdminCustomer> {
  const json = await apiFetch<{ user: AdminCustomer }>(`/users/${id}/approve`, { method: "PATCH" })
  return json.user
}

export async function suspendCustomer(id: string): Promise<AdminCustomer> {
  const json = await apiFetch<{ user: AdminCustomer }>(`/users/${id}/suspend`, { method: "PATCH" })
  return json.user
}
