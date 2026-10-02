import { apiFetch } from "./client"
import type { PaymentParty } from "./payments"

export type PayoutStatus = "requested" | "processing" | "completed" | "failed"

export interface MomoDestination {
  accountName?: string
  accountNumber?: string
  momoProvider?: string
}

export interface AdminPayout {
  _id: string
  /** bankDetails are the vendor's current details - the ones approval sends to. */
  vendorId: PaymentParty & { bankDetails?: MomoDestination }
  amount: number
  paymentIds: string[]
  status: PayoutStatus
  requestedAt: string
  completedAt?: string
  /** The vendor's details when the payout was requested; may predate later edits. */
  bankSnapshot?: MomoDestination
  adminNote?: string
  failureReason?: string
  recipientCode?: string
  transferCode?: string
}

export async function fetchAdminPayouts(status?: PayoutStatus): Promise<AdminPayout[]> {
  return apiFetch<AdminPayout[]>("/payments/payouts", { query: { status } })
}

export async function approvePayout(id: string): Promise<AdminPayout> {
  return apiFetch<AdminPayout>(`/payments/payouts/${id}/approve`, { method: "PATCH" })
}

export async function rejectPayout(id: string, reason: string): Promise<AdminPayout> {
  return apiFetch<AdminPayout>(`/payments/payouts/${id}/reject`, { method: "PATCH", body: { reason } })
}
