"use client";

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

export default function AdminDashboardPage() {
  // Mock data - in production, this would come from your database
  const stats = {
    totalRevenue: 125450,
    totalOrders: 1847,
    activeVendors: 156,
    activeCustomers: 3421,
    pendingOrders: 23,
    completedToday: 45,
  };

  const recentOrders = [
    {
      id: "ORD-1234",
      customer: "John Doe",
      vendor: "Campus Store",
      amount: 45.99,
      status: "Completed",
      time: "2 mins ago",
    },
    {
      id: "ORD-1235",
      customer: "Jane Smith",
      vendor: "Tech Hub",
      amount: 129.99,
      status: "Processing",
      time: "5 mins ago",
    },
    {
      id: "ORD-1236",
      customer: "Mike Johnson",
      vendor: "Book Corner",
      amount: 34.5,
      status: "Pending",
      time: "12 mins ago",
    },
    {
      id: "ORD-1237",
      customer: "Sarah Williams",
      vendor: "Fashion Store",
      amount: 89.99,
      status: "Completed",
      time: "18 mins ago",
    },
    {
      id: "ORD-1238",
      customer: "Tom Brown",
      vendor: "Food Court",
      amount: 15.75,
      status: "Processing",
      time: "25 mins ago",
    },
  ];

  const topVendors = [
    { name: "Campus Store", sales: 15420, orders: 234, rating: 4.8 },
    { name: "Tech Hub", sales: 12350, orders: 189, rating: 4.9 },
    { name: "Book Corner", sales: 9870, orders: 156, rating: 4.7 },
    { name: "Fashion Store", sales: 8540, orders: 142, rating: 4.6 },
  ];

  const recentActivity = [
    {
      type: "vendor",
      action: "New vendor registered",
      name: "Campus Cafe",
      time: "10 mins ago",
    },
    {
      type: "order",
      action: "Large order placed",
      name: "Order #1239 - $250",
      time: "15 mins ago",
    },
    {
      type: "customer",
      action: "New customer signed up",
      name: "Alex Turner",
      time: "22 mins ago",
    },
    {
      type: "product",
      action: "Product reported",
      name: "Laptop Stand",
      time: "35 mins ago",
    },
  ];

  const revenueData = [
    { date: "Mon", revenue: 12400, orders: 45 },
    { date: "Tue", revenue: 15600, orders: 52 },
    { date: "Wed", revenue: 18200, orders: 61 },
    { date: "Thu", revenue: 14800, orders: 48 },
    { date: "Fri", revenue: 21500, orders: 73 },
    { date: "Sat", revenue: 25300, orders: 89 },
    { date: "Sun", revenue: 17650, orders: 58 },
  ];

  const orderStatusData = [
    { name: "Completed", value: 1245, color: "#10b981" },
    { name: "Processing", value: 342, color: "#3b82f6" },
    { name: "Pending", value: 156, color: "#f59e0b" },
    { name: "Cancelled", value: 104, color: "#ef4444" },
  ];

  const categoryData = [
    { category: "Electronics", sales: 45200 },
    { category: "Fashion", sales: 32100 },
    { category: "Books", sales: 18900 },
    { category: "Food", sales: 15600 },
    { category: "Accessories", sales: 13650 },
  ];

  const customerGrowthData = [
    { month: "Jan", customers: 2100 },
    { month: "Feb", customers: 2350 },
    { month: "Mar", customers: 2680 },
    { month: "Apr", customers: 2920 },
    { month: "May", customers: 3150 },
    { month: "Jun", customers: 3421 },
  ];

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
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-green-600 mt-1">
              +12.5% from last month
            </p>
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
              {stats.totalOrders.toLocaleString()}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {stats.completedToday} completed today
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
              {stats.activeVendors}
            </div>
            <p className="text-sm text-purple-600 mt-1">+8 new this week</p>
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
              {stats.activeCustomers.toLocaleString()}
            </div>
            <p className="text-sm text-orange-600 mt-1">+156 new this week</p>
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
              {stats.pendingOrders}
            </div>
            <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Excellent</div>
            <p className="text-sm text-gray-600 mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

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
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Revenue ($)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
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
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {status.name}: {status.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Sales</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

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
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{order.id}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.customer} → {order.vendor}
                    </p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {topVendors.map((vendor, index) => (
                <div
                  key={vendor.name}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{vendor.name}</p>
                    <p className="text-xs text-gray-600">
                      {vendor.orders} orders • ⭐ {vendor.rating}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${vendor.sales.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total sales</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 border-l-4 border-l-purple-500 bg-purple-50 rounded"
              >
                <div className="text-2xl">
                  {activity.type === "vendor" && "🏪"}
                  {activity.type === "order" && "📦"}
                  {activity.type === "customer" && "👤"}
                  {activity.type === "product" && "🛍️"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">{activity.name}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
