import { apiFetch } from "./client"
import type { AdminOrder, AdminOrderDispute } from "./types"

export type DisputeResolution = NonNullable<AdminOrderDispute["resolution"]>

/** Admins hit the same GET /orders endpoint customers/vendors use — the
 * backend already returns every order, unscoped, for any role other than
 * "student"/"vendor". No admin-specific route exists or is needed. */
export async function fetchAdminOrders(status?: string): Promise<AdminOrder[]> {
  const json = await apiFetch<{ data: AdminOrder[] }>("/orders", { query: { status } })
  return json.data
}

/** Refunds the customer or releases the held payment to the vendor. Only
 * disputed orders can be resolved, and only once. */
export async function resolveOrderDispute(id: string, resolution: DisputeResolution, note: string): Promise<AdminOrder> {
  const json = await apiFetch<{ data: AdminOrder }>(`/orders/${id}/dispute/resolve`, {
    method: "PATCH",
    body: { resolution, note },
  })
  return json.data
}
