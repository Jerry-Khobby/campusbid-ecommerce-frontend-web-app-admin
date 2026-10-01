"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "@/lib/notification-context"
import { ApiError } from "@/lib/api/client"
import { fetchAdminPayouts, approvePayout, rejectPayout, type AdminPayout, type PayoutStatus } from "@/lib/api/payouts"
import { formatCurrency } from "@/lib/format"

const STATUS_OPTIONS: PayoutStatus[] = ["requested", "processing", "completed", "failed"]

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700"
    case "processing":
      return "bg-blue-100 text-blue-700"
    case "requested":
      return "bg-yellow-100 text-yellow-700"
    case "failed":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getVendorName(vendor: AdminPayout["vendorId"]): string {
  if (!vendor) return "Unknown vendor"
  return vendor.profile?.businessName || vendor.email
}

function getPayoutDestination(payout: AdminPayout): string {
  const snapshot = payout.bankSnapshot
  if (!snapshot?.momoProvider || !snapshot?.accountNumber) return "Mobile money details not set"
  return `${snapshot.momoProvider.toUpperCase()} · ${snapshot.accountNumber}${snapshot.accountName ? ` (${snapshot.accountName})` : ""}`
}

export default function AdminPayoutsPage() {
  const { addNotification } = useNotification()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [payouts, setPayouts] = useState<AdminPayout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const [rejectTarget, setRejectTarget] = useState<AdminPayout | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  const loadPayouts = async (status: string) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await fetchAdminPayouts(status === "all" ? undefined : (status as PayoutStatus))
      setPayouts(data)
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPayouts(statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleApprove = async (payout: AdminPayout) => {
    setActioningId(payout._id)
    try {
      const updated = await approvePayout(payout._id)
      setPayouts((current) => current.map((p) => (p._id === updated._id ? updated : p)))
      addNotification(
        updated.status === "completed"
          ? `Payout sent to ${getVendorName(updated.vendorId)}`
          : `Transfer initiated for ${getVendorName(updated.vendorId)} - awaiting confirmation`,
        "success",
      )
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
      // The approval failed server-side (e.g. missing momo details) and the
      // payout reverted to 'requested' - refresh so the row reflects that.
      loadPayouts(statusFilter)
    } finally {
      setActioningId(null)
    }
  }

  const openRejectDialog = (payout: AdminPayout) => {
    setRejectTarget(payout)
    setRejectReason("")
  }

  const handleReject = async () => {
    if (!rejectTarget || rejectReason.trim().length < 3) return

    setIsRejecting(true)
    try {
      const updated = await rejectPayout(rejectTarget._id, rejectReason.trim())
      setPayouts((current) => current.map((p) => (p._id === updated._id ? updated : p)))
      addNotification(`Payout request declined`, "success")
      setRejectTarget(null)
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
    } finally {
      setIsRejecting(false)
    }
  }

  const totalRequested = payouts.filter((p) => p.status === "requested").reduce((sum, p) => sum + p.amount, 0)
  const totalProcessing = payouts.filter((p) => p.status === "processing").reduce((sum, p) => sum + p.amount, 0)
  const totalCompleted = payouts.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Payouts</h1>
        <p className="text-gray-600 mt-1">Review payout requests and send mobile money transfers to vendors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRequested)}</div>
            <p className="text-sm text-gray-600">Awaiting Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalProcessing)}</div>
            <p className="text-sm text-gray-600">Transfer Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCompleted)}</div>
            <p className="text-sm text-gray-600">Paid Out</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
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
              Couldn&apos;t load payouts: {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading payouts...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  payouts.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{getVendorName(payout.vendorId)}</p>
                        <p className="text-xs text-gray-500">{payout.vendorId?.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{getPayoutDestination(payout)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(payout.amount)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payout.status)}`}>
                          {formatStatus(payout.status)}
                        </span>
                        {payout.status === "failed" && payout.failureReason && (
                          <p className="text-xs text-red-600 mt-1 max-w-[200px]">{payout.failureReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{new Date(payout.requestedAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        {payout.status === "requested" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={actioningId === payout._id}
                              onClick={() => handleApprove(payout)}
                            >
                              {actioningId === payout._id ? "Sending..." : "Approve & Send"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actioningId === payout._id}
                              onClick={() => openRejectDialog(payout)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No action needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {!isLoading && !loadError && payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No payout requests match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout Request</DialogTitle>
            <DialogDescription>
              This releases the vendor&apos;s balance so they can request a payout again after fixing the issue.
            </DialogDescription>
          </DialogHeader>
          {rejectTarget && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Declining {formatCurrency(rejectTarget.amount)} requested by {getVendorName(rejectTarget.vendorId)}.
              </p>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Mobile money number doesn't match account name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={isRejecting || rejectReason.trim().length < 3}
                  onClick={handleReject}
                >
                  {isRejecting ? "Rejecting..." : "Reject Payout"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
