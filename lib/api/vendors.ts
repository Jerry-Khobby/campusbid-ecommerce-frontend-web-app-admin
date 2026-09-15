import { apiFetch } from "./client"
import type { SafeVendor } from "./types"

interface AdminVendorsResponse {
  items: SafeVendor[]
  total: number
  page: number
  limit: number
}

export async function fetchAdminVendors(search?: string): Promise<SafeVendor[]> {
  const json = await apiFetch<{ data: AdminVendorsResponse }>("/vendors/admin", {
    query: { search, limit: 100 },
  })
  return json.data.items
}

export async function approveVendor(id: string): Promise<SafeVendor> {
  const json = await apiFetch<{ vendor: SafeVendor }>(`/vendors/${id}/approve`, { method: "PATCH" })
  return json.vendor
}

export async function suspendVendor(id: string): Promise<SafeVendor> {
  const json = await apiFetch<{ vendor: SafeVendor }>(`/vendors/${id}/suspend`, { method: "PATCH" })
  return json.vendor
}
