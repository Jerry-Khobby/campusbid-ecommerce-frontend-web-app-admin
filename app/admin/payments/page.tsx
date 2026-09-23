"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "@/lib/notification-context"
import { ApiError } from "@/lib/api/client"
import {
  fetchAdminPayments,
  updatePaymentStatus,
  type AdminPayment,
  type PaymentParty,
  type PaymentStatus,
} from "@/lib/api/payments"

const SEARCH_DEBOUNCE_MS = 300
const STATUS_OPTIONS: PaymentStatus[] = ["pending", "held", "released", "refunded", "failed"]

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusColor(status: string): string {
  switch (status) {
    case "released":
      return "bg-green-100 text-green-700"
    case "held":
      return "bg-blue-100 text-blue-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "refunded":
    case "failed":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getPartyName(party: PaymentParty | undefined): string {
  if (!party) return "Unknown"
  const profile = party.profile
  if (profile?.businessName) return profile.businessName
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")
  return name || party.email
}

export default function AdminPaymentsPage() {
  const { addNotification } = useNotification()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [statusDraft, setStatusDraft] = useState<PaymentStatus>("pending")
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await fetchAdminPayments(statusFilter === "all" ? undefined : (statusFilter as PaymentStatus))
        if (!isCancelled) setPayments(data)
      } catch (error) {
        if (!isCancelled) setLoadError(getErrorMessage(error))
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [statusFilter])

  const filteredPayments = payments.filter((payment) => {
    const query = searchQuery.toLowerCase()
    return (
      payment.transactionId.toLowerCase().includes(query) ||
      getPartyName(payment.customerId).toLowerCase().includes(query) ||
      getPartyName(payment.vendorId).toLowerCase().includes(query)
    )
  })

  const handleViewPayment = (payment: AdminPayment) => {
    setSelectedPayment(payment)
    setStatusDraft(payment.status)
    setIsViewDialogOpen(true)
  }

  const handleSaveStatus = async () => {
    if (!selectedPayment || statusDraft === selectedPayment.status) return

    setIsSavingStatus(true)
    try {
      await updatePaymentStatus(selectedPayment._id, statusDraft)
      const updated = { ...selectedPayment, status: statusDraft }
      setPayments((current) => current.map((p) => (p._id === updated._id ? updated : p)))
      setSelectedPayment(updated)
      addNotification(`Payment marked as ${formatStatus(statusDraft)}`, "success")
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
    } finally {
      setIsSavingStatus(false)
    }
  }

  const totalHeld = payments.filter((p) => p.status === "held").reduce((sum, p) => sum + p.amount, 0)
  const totalReleased = payments.filter((p) => p.status === "released").reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-1">Review payments and correct their status when a dispute needs it</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
            <p className="text-sm text-gray-600">Total Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">${totalHeld.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Held in Escrow</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">${totalReleased.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Released to Vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">${totalRefunded.toFixed(2)}</div>
            <p className="text-sm text-gray-600">Refunded</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by transaction ID, customer, or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn&apos;t load payments: {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading payments...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm text-gray-900 truncate max-w-[180px]">
                          {payment.transactionId}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{getPartyName(payment.customerId)}</p>
                          <p className="text-xs text-gray-500">{payment.customerId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{getPartyName(payment.vendorId)}</p>
                          <p className="text-xs text-gray-500">{payment.vendorId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {formatStatus(payment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewPayment(payment)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                {!isLoading && !loadError && filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No payments match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Complete information about this payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Transaction ID</Label>
                  <p className="font-medium break-all">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Date</Label>
                  <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Customer</Label>
                  <p className="font-medium">{getPartyName(selectedPayment.customerId)}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.customerId?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Vendor</Label>
                  <p className="font-medium">{getPartyName(selectedPayment.vendorId)}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.vendorId?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Payment Method</Label>
                  <p className="font-medium capitalize">{selectedPayment.paymentMethod.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="font-medium">
                    {selectedPayment.currency} {selectedPayment.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-lg font-bold text-gray-900">
                      {selectedPayment.currency} {selectedPayment.adminCommission.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Admin Commission</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-lg font-bold text-gray-900">
                      {selectedPayment.currency} {selectedPayment.vendorPayout.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Vendor Payout</p>
                  </CardContent>
                </Card>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label className="text-gray-600">Status</Label>
                <div className="flex gap-3 items-center">
                  <Select value={statusDraft} onValueChange={(value) => setStatusDraft(value as PaymentStatus)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatStatus(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={isSavingStatus || statusDraft === selectedPayment.status}
                    onClick={handleSaveStatus}
                  >
                    {isSavingStatus ? "Saving..." : "Save Status"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
