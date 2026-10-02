import { apiFetch } from "./client"
import type { PayoutStatus } from "./payouts"

export type PaymentStatus = "pending" | "held" | "released" | "refunded" | "failed"

export interface PaymentParty {
  _id: string
  email: string
  profile?: { firstName?: string; lastName?: string; businessName?: string }
}

// GET /payments doesn't follow this API's usual { success, message, data }
// envelope - it returns the payment array directly.
export interface AdminPayment {
  _id: string
  orderId: string
  customerId: PaymentParty
  vendorId: PaymentParty
  amount: number
  currency: string
  paymentMethod: string
  status: PaymentStatus
  transactionId: string
  adminCommission: number
  vendorPayout: number
  /** Set once the vendor has requested a payout covering this payment. Rejected
   * or failed payouts release their payments, so a linked payout is always
   * requested, processing or completed. */
  payoutId?: { _id: string; status: PayoutStatus } | null
  createdAt: string
  updatedAt: string
}

export async function fetchAdminPayments(status?: PaymentStatus): Promise<AdminPayment[]> {
  return apiFetch<AdminPayment[]>("/payments", { query: { status } })
}

/** The response's customerId/vendorId come back as bare ids (unpopulated), unlike the
 * list - callers should keep using the row they already have rather than this shape. */
export async function updatePaymentStatus(id: string, status: PaymentStatus, note?: string): Promise<void> {
  await apiFetch(`/payments/${id}/status`, { method: "PATCH", body: { status, note } })
}
