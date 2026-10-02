"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError } from "@/lib/api/client"
import { fetchAdminOrders } from "@/lib/api/orders"
import type { AdminOrder } from "@/lib/api/types"
import { formatCurrency } from "@/lib/format"
import { DisputeReviewPanel } from "@/components/admin/dispute-review-panel"

const SEARCH_DEBOUNCE_MS = 300

const STATUS_OPTIONS = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "disputed",
  "completed",
  "cancelled",
  "refunded",
]

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "delivered":
      return "bg-green-100 text-green-700"
    case "preparing":
    case "out_for_delivery":
      return "bg-blue-100 text-blue-700"
    case "ready":
    case "accepted":
      return "bg-purple-100 text-purple-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "disputed":
      return "bg-amber-100 text-amber-800"
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getPartyName(party: AdminOrder["customerId"] | AdminOrder["vendorId"]): string {
  if (!party) return "Unknown"
  const profile = party.profile
  if (profile?.businessName) return profile.businessName
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")
  return name || party.email
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await fetchAdminOrders(statusFilter === "all" ? undefined : statusFilter)
        if (!isCancelled) setOrders(data)
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

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      getPartyName(order.customerId).toLowerCase().includes(query) ||
      getPartyName(order.vendorId).toLowerCase().includes(query)
    )
  })

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  // The resolve response carries ids, not the populated customer/vendor, so
  // only the fields the resolution changed are merged into the shown order.
  const handleDisputeResolved = (resolved: AdminOrder) => {
    const applyResolution = (order: AdminOrder) =>
      order._id === resolved._id ? { ...order, status: resolved.status, dispute: resolved.dispute } : order
    setOrders((current) => current.map(applyResolution))
    setSelectedOrder((current) => (current ? applyResolution(current) : current))
  }

  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const openDisputes = orders.filter((o) => o.status === "disputed").length
  // Matches the backend dashboard's totalRevenue: only orders that actually completed count as revenue.
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.pricing?.total ?? 0), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order & Transaction Monitoring</h1>
          <p className="text-gray-600 mt-1">Track all orders and transactions across the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{completedOrders}</div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{openDisputes}</div>
            <p className="text-sm text-gray-600">Open Disputes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by order number, customer, or vendor..."
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
              Couldn&apos;t load orders: {loadError}
            </div>
          )}

          {/* Orders Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
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
                      Loading orders...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{getPartyName(order.customerId)}</p>
                          <p className="text-xs text-gray-500">{order.customerId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{getPartyName(order.vendorId)}</p>
                          <p className="text-xs text-gray-500">{order.vendorId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.pricing?.total ?? 0)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                {!isLoading && !loadError && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No orders match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete information about the order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Order Number</Label>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Order Date</Label>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Customer</Label>
                  <p className="font-medium">{getPartyName(selectedOrder.customerId)}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerId?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Vendor</Label>
                  <p className="font-medium">{getPartyName(selectedOrder.vendorId)}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.vendorId?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Order Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}
                    >
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between">
                      <p className="text-sm font-medium">
                        {typeof item.productId === "string" ? item.productId : item.productId.name} × {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedOrder.pricing?.total ?? 0)}
                  </span>
                </div>
              </div>

              <DisputeReviewPanel key={selectedOrder._id} order={selectedOrder} onResolved={handleDisputeResolved} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
