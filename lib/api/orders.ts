import { apiFetch } from "./client"
import type { AdminOrder } from "./types"

/** Admins hit the same GET /orders endpoint customers/vendors use — the
 * backend already returns every order, unscoped, for any role other than
 * "student"/"vendor". No admin-specific route exists or is needed. */
export async function fetchAdminOrders(status?: string): Promise<AdminOrder[]> {
  const json = await apiFetch<{ data: AdminOrder[] }>("/orders", { query: { status } })
  return json.data
}
