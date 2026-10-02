"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/client"
import { resolveOrderDispute, type DisputeResolution } from "@/lib/api/orders"
import type { AdminOrder } from "@/lib/api/types"
import { useNotification } from "@/lib/notification-context"

// Matches the backend's minimum for the note both parties are shown.
const RESOLUTION_NOTE_MIN_LENGTH = 3

const OUTCOME_LABELS: Record<DisputeResolution, string> = {
  refund: "Refunded to the customer",
  release: "Payment released to the vendor",
}

interface DisputeReviewPanelProps {
  order: AdminOrder
  onResolved: (order: AdminOrder) => void
}

export function DisputeReviewPanel({ order, onResolved }: DisputeReviewPanelProps) {
  const { addNotification } = useNotification()
  const [note, setNote] = useState("")
  const [pendingResolution, setPendingResolution] = useState<DisputeResolution | null>(null)

  if (!order.dispute) return null
  const { dispute } = order

  const resolve = async (resolution: DisputeResolution) => {
    if (note.trim().length < RESOLUTION_NOTE_MIN_LENGTH) {
      addNotification("Add a short note explaining the decision; both parties will see it.", "error")
      return
    }

    setPendingResolution(resolution)
    try {
      const resolved = await resolveOrderDispute(order._id, resolution, note.trim())
      addNotification(`Dispute resolved: ${OUTCOME_LABELS[resolution].toLowerCase()}`, "success")
      onResolved(resolved)
    } catch (error) {
      addNotification(error instanceof ApiError ? error.message : "Could not resolve this dispute.", "error")
    } finally {
      setPendingResolution(null)
    }
  }

  return (
    <div className="border-t pt-4 space-y-3">
      <h3 className="font-semibold">Customer dispute</h3>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
        <p className="text-sm text-amber-900">{dispute.reason}</p>
        <p className="text-xs text-amber-700">Opened {new Date(dispute.openedAt).toLocaleString()}</p>
      </div>

      {dispute.resolution ? (
        <div className="rounded-lg bg-gray-50 p-3 space-y-1">
          <p className="text-sm font-medium">{OUTCOME_LABELS[dispute.resolution]}</p>
          {dispute.resolutionNote && <p className="text-sm text-gray-600">{dispute.resolutionNote}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="dispute-note">Decision note (shown to the customer and the vendor)</Label>
            <Textarea
              id="dispute-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Vendor confirmed two items were missing"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={pendingResolution !== null}
              onClick={() => resolve("refund")}
            >
              {pendingResolution === "refund" ? "Refunding..." : "Refund customer"}
            </Button>
            <Button className="flex-1" disabled={pendingResolution !== null} onClick={() => resolve("release")}>
              {pendingResolution === "release" ? "Releasing..." : "Release to vendor"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
