"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Order {
  id: string
  orderNumber: string
  customer: string
  customerEmail: string
  vendor: string
  vendorEmail: string
  items: string[]
  totalAmount: number
  status: "pending" | "processing" | "ready" | "completed" | "cancelled"
  paymentStatus: "paid" | "pending" | "refunded"
  orderDate: string
  deliveryDate?: string
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Mock order data
  const [orders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-1234",
      customer: "Alice Johnson",
      customerEmail: "alice@university.edu",
      vendor: "Campus Store",
      vendorEmail: "john@campusstore.com",
      items: ["Laptop Stand", "USB Cable"],
      totalAmount: 45.99,
      status: "completed",
      paymentStatus: "paid",
      orderDate: "2024-04-15T10:30:00",
      deliveryDate: "2024-04-15T14:20:00",
    },
    {
      id: "2",
      orderNumber: "ORD-1235",
      customer: "Bob Williams",
      customerEmail: "bob@university.edu",
      vendor: "Tech Hub",
      vendorEmail: "sarah@techhub.com",
      items: ["Wireless Mouse", "Keyboard"],
      totalAmount: 129.99,
      status: "processing",
      paymentStatus: "paid",
      orderDate: "2024-04-15T11:00:00",
    },
    {
      id: "3",
      orderNumber: "ORD-1236",
      customer: "Carol Martinez",
      customerEmail: "carol@university.edu",
      vendor: "Book Corner",
      vendorEmail: "mike@bookcorner.com",
      items: ["Textbook: Physics 101"],
      totalAmount: 34.5,
      status: "pending",
      paymentStatus: "paid",
      orderDate: "2024-04-15T11:30:00",
    },
    {
      id: "4",
      orderNumber: "ORD-1237",
      customer: "David Lee",
      customerEmail: "david@university.edu",
      vendor: "Fashion Store",
      vendorEmail: "emily@fashionstore.com",
      items: ["T-Shirt", "Jeans"],
      totalAmount: 89.99,
      status: "ready",
      paymentStatus: "paid",
      orderDate: "2024-04-15T09:15:00",
    },
    {
      id: "5",
      orderNumber: "ORD-1238",
      customer: "Emma Davis",
      customerEmail: "emma@university.edu",
      vendor: "Campus Cafe",
      vendorEmail: "david@campuscafe.com",
      items: ["Coffee", "Sandwich"],
      totalAmount: 15.75,
      status: "cancelled",
      paymentStatus: "refunded",
      orderDate: "2024-04-14T12:00:00",
    },
  ])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "processing":
        return "bg-blue-100 text-blue-700"
      case "ready":
        return "bg-purple-100 text-purple-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "refunded":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0)

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</div>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{order.vendor}</p>
                        <p className="text-xs text-gray-500">{order.vendorEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
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
                  <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Customer</Label>
                  <p className="font-medium">{selectedOrder.customer}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Vendor</Label>
                  <p className="font-medium">{selectedOrder.vendor}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.vendorEmail}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Order Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Payment Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                    >
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </p>
                </div>
                {selectedOrder.deliveryDate && (
                  <div>
                    <Label className="text-gray-600">Delivery Date</Label>
                    <p className="font-medium">{new Date(selectedOrder.deliveryDate).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
