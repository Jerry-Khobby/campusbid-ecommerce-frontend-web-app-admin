"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart2,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Line,
  ComposedChart,
  Area,
  Bar,
  BarChart,
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
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { LineAreaTooltip, BarTooltip, PieTooltip } from "@/components/dashboard/chart-tooltip";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { CATEGORICAL, CHART_INK, ORDER_STATUS_COLORS, categoricalColorAt } from "@/lib/chart-palette";

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

function getPartyName(
  party: { email?: string; profile?: { firstName?: string; lastName?: string; businessName?: string } } | null,
): string {
  if (!party) return "Unknown";
  if (party.profile?.businessName) return party.profile.businessName;
  const name = [party.profile?.firstName, party.profile?.lastName].filter(Boolean).join(" ");
  return name || party.email || "Unknown";
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
    fill: ORDER_STATUS_COLORS[entry.status] ?? CHART_INK.muted,
  }));
  const totalOrdersInBreakdown = orderStatusData.reduce((sum, entry) => sum + entry.value, 0);

  const categoryData = dashboard.revenueByCategory.map((entry, index) => ({
    category: entry.category,
    sales: entry.revenue,
    fill: categoricalColorAt(index),
  }));

  const customerGrowthData = dashboard.customerGrowth.map((point) => ({
    month: formatMonthLabel(point.month),
    customers: point.customers,
  }));

  const revenueSparkline = dashboard.revenueTrend.map((p) => p.revenue);
  const ordersSparkline = dashboard.revenueTrend.map((p) => p.orders);
  const customersSparkline = dashboard.customerGrowth.map((p) => p.customers);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage your entire platform
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiTile
          label="Total Revenue"
          value={formatCompactNumber(dashboard.totalRevenue, { currency: true })}
          icon={DollarSign}
          accentColor={CATEGORICAL.blue}
          delta={{ deltaPct: dashboard.kpiDeltas.revenueChangePct, comparisonLabel: "vs last 7 days" }}
          sparkline={revenueSparkline}
        />
        <KpiTile
          label="Total Orders"
          value={formatCompactNumber(dashboard.totalOrders)}
          icon={ShoppingCart}
          accentColor={CATEGORICAL.orange}
          delta={{ deltaPct: dashboard.kpiDeltas.ordersChangePct, comparisonLabel: "vs last 7 days" }}
          sparkline={ordersSparkline}
        />
        <KpiTile
          label="Active Customers"
          value={formatCompactNumber(dashboard.activeCustomers)}
          icon={Users}
          accentColor={CATEGORICAL.yellow}
          delta={{ deltaPct: dashboard.kpiDeltas.newCustomersChangePct, comparisonLabel: "new vs last 7 days" }}
          sparkline={customersSparkline}
        />
        <KpiTile
          label="Active Vendors"
          value={formatCompactNumber(dashboard.activeVendors)}
          icon={Store}
          accentColor={CATEGORICAL.aqua}
          caption={`${dashboard.pendingVendors} awaiting approval`}
        />
        <KpiTile
          label="Pending Orders"
          value={formatCompactNumber(dashboard.pendingOrders)}
          icon={Clock}
          accentColor={CATEGORICAL.magenta}
          caption={`${dashboard.completedToday} completed today`}
        />
        <KpiTile
          label="Vendors Awaiting Approval"
          value={formatCompactNumber(dashboard.pendingVendors)}
          icon={UserCheck}
          accentColor={CATEGORICAL.violet}
          link={{ href: "/admin/vendors", label: "Review vendors →" }}
        />
      </div>

      {revenueData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 size={18} className="text-gray-400" />
              Revenue & Orders
            </CardTitle>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.gridline} vertical={false} />
                <XAxis dataKey="date" stroke={CHART_INK.muted} tickLine={false} axisLine={{ stroke: CHART_INK.baseline }} />
                <YAxis
                  yAxisId="revenue"
                  stroke={CHART_INK.muted}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatCompactNumber(v, { currency: true })}
                />
                <YAxis yAxisId="orders" orientation="right" stroke={CHART_INK.muted} tickLine={false} axisLine={false} hide />
                <Tooltip
                  cursor={{ stroke: CHART_INK.baseline, strokeDasharray: "3 3" }}
                  content={
                    <LineAreaTooltip
                      formatValue={(v, dataKey) => (dataKey === "revenue" ? formatCurrency(v) : v.toLocaleString())}
                    />
                  }
                />
                <Legend
                  formatter={(value) => <span style={{ color: CHART_INK.secondary, fontSize: 13 }}>{value}</span>}
                />
                <Bar yAxisId="orders" dataKey="orders" name="Orders" fill={CATEGORICAL.orange} radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke={CATEGORICAL.blue}
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ r: 3, fill: CATEGORICAL.blue, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <p className="text-sm text-gray-500">All-time</p>
          </CardHeader>
          <CardContent>
            {orderStatusData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No orders yet.</p>
            ) : (
              <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      cornerRadius={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {orderStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value) => <span style={{ color: CHART_INK.secondary, fontSize: 13 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ paddingRight: "33%" }}>
                  <p className="text-2xl font-bold text-gray-900">{totalOrdersInBreakdown.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total orders</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Sales</CardTitle>
            <p className="text-sm text-gray-500">All-time revenue</p>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No sales yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.gridline} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke={CHART_INK.muted}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactNumber(v, { currency: true })}
                  />
                  <YAxis type="category" dataKey="category" stroke={CHART_INK.muted} tickLine={false} axisLine={false} width={80} />
                  <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} content={<BarTooltip formatValue={formatCurrency} />} />
                  <Bar dataKey="sales" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {customerGrowthData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <p className="text-sm text-gray-500">Last 6 months, cumulative</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={customerGrowthData}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CATEGORICAL.blue} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={CATEGORICAL.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.gridline} vertical={false} />
                <XAxis dataKey="month" stroke={CHART_INK.muted} tickLine={false} axisLine={{ stroke: CHART_INK.baseline }} />
                <YAxis stroke={CHART_INK.muted} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
                <Tooltip
                  cursor={{ stroke: CHART_INK.baseline, strokeDasharray: "3 3" }}
                  content={<LineAreaTooltip formatValue={(v) => v.toLocaleString()} />}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  name="Customers"
                  stroke={CATEGORICAL.blue}
                  strokeWidth={2}
                  fill="url(#colorCustomers)"
                  dot={{ r: 3, fill: CATEGORICAL.blue, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
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
                {dashboard.recentOrders.map((order) => {
                  const statusColor = ORDER_STATUS_COLORS[order.status] ?? CHART_INK.muted;
                  return (
                    <div
                      key={order.orderNumber}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{order.orderNumber}</p>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
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
                        <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  );
                })}
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
                      <p className="font-bold text-gray-900">{formatCurrency(vendor.revenue)}</p>
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
                <Store size={22} className="text-gray-500" />
                <span className="text-sm">Manage Vendors</span>
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <Users size={22} className="text-gray-500" />
                <span className="text-sm">View Customers</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <Package size={22} className="text-gray-500" />
                <span className="text-sm">Review Orders</span>
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-transparent"
              >
                <BarChart2 size={22} className="text-gray-500" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
