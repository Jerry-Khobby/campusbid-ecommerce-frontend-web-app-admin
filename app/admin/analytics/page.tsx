"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotification } from "@/lib/notification-context"
import { ApiError } from "@/lib/api/client"
import { fetchAdminAnalytics, fetchAdminDashboard } from "@/lib/api/admin"
import type { AdminAnalytics, AdminDashboard } from "@/lib/api/types"
import { formatCurrency } from "@/lib/format"

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}

export default function AdminAnalyticsPage() {
  const { addNotification } = useNotification()
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    Promise.all([fetchAdminDashboard(), fetchAdminAnalytics()])
      .then(([dashboardData, analyticsData]) => {
        if (!isCancelled) {
          setDashboard(dashboardData)
          setAnalytics(analyticsData)
        }
      })
      .catch((error) => {
        if (!isCancelled) addNotification(getErrorMessage(error), "error")
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [addNotification])

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (!dashboard || !analytics) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Couldn&apos;t load analytics. Try refreshing the page.</p>
      </div>
    )
  }

  const averageOrderValue = dashboard.totalOrders > 0 ? dashboard.totalRevenue / dashboard.totalOrders : 0
  const categoryTotal = analytics.revenueByCategory.reduce((sum, c) => sum + c.revenue, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard.totalRevenue)}</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{dashboard.totalOrders.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{dashboard.activeCustomers.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(averageOrderValue)}</div>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.revenueByCategory.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No sales yet.</p>
            ) : (
              <div className="space-y-4">
                {analytics.revenueByCategory.map((item) => {
                  const percentage = categoryTotal > 0 ? Math.round((item.revenue / categoryTotal) * 100) : 0
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-gray-600">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topVendors.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No vendor sales yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.topVendors.map((vendor, index) => (
                  <div key={vendor.vendorId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{vendor.name}</p>
                      <p className="text-xs text-gray-600">{vendor.orders} orders</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(vendor.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
