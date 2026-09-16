"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNotification } from "@/lib/notification-context";
import { ApiError } from "@/lib/api/client";
import { fetchAdminDashboard } from "@/lib/api/admin";
import type { AdminDashboard } from "@/lib/api/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#8b5cf6",
  preparing: "#3b82f6",
  ready: "#8b5cf6",
  out_for_delivery: "#3b82f6",
  delivered: "#10b981",
  completed: "#10b981",
  cancelled: "#ef4444",
  refunded: "#ef4444",
};

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, { weekday: "short" });
}

function formatMonthLabel(monthString: string): string {
  const [year, month] = monthString.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, { month: "short" });
}

function getPartyName(party: { profile?: { firstName?: string; lastName?: string; businessName?: string } } | null): string {
  if (!party) return "Unknown";
  if (party.profile?.businessName) return party.profile.businessName;
  return [party.profile?.firstName, party.profile?.lastName].filter(Boolean).join(" ") || "Unknown";
}

export default function AdminDashboardPage() {
  const { addNotification } = useNotification();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    fetchAdminDashboard()
      .then((data) => {
        if (!isCancelled) setDashboard(data);
      })
      .catch((error) => {
        if (!isCancelled) addNotification(getErrorMessage(error), "error");
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [addNotification]);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Couldn&apos;t load the dashboard. Try refreshing the page.</p>
      </div>
    );
  }

  const revenueData = dashboard.revenueTrend.map((point) => ({
    date: formatShortDate(point._id),
    revenue: point.revenue,
    orders: point.orders,
  }));

  const orderStatusData = dashboard.orderStatusBreakdown.map((entry) => ({
    name: formatStatus(entry.status),
    value: entry.count,
    color: STATUS_COLORS[entry.status] ?? "#9ca3af",
  }));

  const categoryData = dashboard.revenueByCategory.map((entry) => ({
    category: entry.category,
    sales: entry.revenue,
  }));

  const customerGrowthData = dashboard.customerGrowth.map((point) => ({
    month: formatMonthLabel(point.month),
    customers: point.customers,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage your entire platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${dashboard.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">From completed orders</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.totalOrders.toLocaleString()}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {dashboard.completedToday} completed today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.activeVendors}
            </div>
            <p className="text-sm text-purple-600 mt-1">
              {dashboard.pendingVendors} awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.activeCustomers.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.pendingOrders}
            </div>
            <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendors Awaiting Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{dashboard.pendingVendors}</div>
            <Link href="/admin/vendors" className="text-sm text-pink-600 mt-1 hover:underline inline-block">
              Review vendors →
            </Link>
          </CardContent>
        </Card>
      </div>

      {revenueData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatusData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No orders yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {orderStatusData.map((status) => (
                    <div key={status.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm text-gray-600">
                        {status.name}: {status.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No sales yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {customerGrowthData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={customerGrowthData}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCustomers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{order.orderNumber}</p>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${STATUS_COLORS[order.status] ?? "#9ca3af"}20`,
                            color: STATUS_COLORS[order.status] ?? "#6b7280",
                          }}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getPartyName(order.customer)} → {getPartyName(order.vendor)}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performing Vendors</CardTitle>
            <Link href="/admin/vendors">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.topVendors.length === 0 ? (
              <p className="text-sm text-gray-500">No vendor sales yet.</p>
            ) : (
              <div className="space-y-4">
                {dashboard.topVendors.map((vendor, index) => (
                  <div key={vendor.vendorId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{vendor.name}</p>
                      <p className="text-xs text-gray-600">
                        {vendor.orders} orders
                        {vendor.rating ? ` • ⭐ ${vendor.rating}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${vendor.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/vendors">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <span className="text-2xl">🏪</span>
                <span className="text-sm">Manage Vendors</span>
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <span className="text-2xl">👥</span>
                <span className="text-sm">View Customers</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <span className="text-2xl">📦</span>
                <span className="text-sm">Review Orders</span>
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <span className="text-2xl">📈</span>
                <span className="text-sm">View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
