"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">$125,450</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">1,847</div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-xs text-blue-600 mt-1">+8.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">3,421</div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-xs text-purple-600 mt-1">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">$67.85</div>
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-xs text-orange-600 mt-1">+5.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Electronics", revenue: 45200, percentage: 36 },
                { category: "Books", revenue: 32100, percentage: 26 },
                { category: "Clothing", revenue: 28500, percentage: 23 },
                { category: "Food", revenue: 19650, percentage: 15 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-gray-600">${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Campus Store", revenue: 15420, orders: 234 },
                { name: "Tech Hub", revenue: 12350, orders: 189 },
                { name: "Book Corner", revenue: 9870, orders: 156 },
                { name: "Fashion Store", revenue: 8540, orders: 142 },
              ].map((vendor, index) => (
                <div key={vendor.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{vendor.name}</p>
                    <p className="text-xs text-gray-600">{vendor.orders} orders</p>
                  </div>
                  <p className="font-bold text-gray-900">${vendor.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
