"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { fetchAdminProducts, fetchVendorNameMap } from "@/lib/api/products"
import type { AdminProduct } from "@/lib/api/types"

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}

type ProductStatus = "active" | "inactive" | "out-of-stock"

function getProductStatus(product: AdminProduct): ProductStatus {
  if (product.stock === 0) return "out-of-stock"
  return product.isAvailable ? "active" : "inactive"
}

function getStatusColor(status: ProductStatus): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700"
    case "inactive":
      return "bg-gray-100 text-gray-700"
    case "out-of-stock":
      return "bg-red-100 text-red-700"
  }
}

function formatStatus(status: ProductStatus): string {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [vendorNames, setVendorNames] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [productData, vendorMap] = await Promise.all([
          fetchAdminProducts(searchQuery || undefined),
          fetchVendorNameMap(),
        ])
        if (!isCancelled) {
          setProducts(productData)
          setVendorNames(vendorMap)
        }
      } catch (error) {
        if (!isCancelled) setLoadError(getErrorMessage(error))
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }, 300)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [searchQuery])

  const totalSales = products.reduce((sum, p) => sum + p.soldCount, 0)
  const activeCount = products.filter((p) => getProductStatus(p) === "active").length
  const outOfStockCount = products.filter((p) => getProductStatus(p) === "out-of-stock").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-600 mt-1">View all products across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <p className="text-sm text-gray-600">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{outOfStockCount}</div>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{totalSales}</div>
            <p className="text-sm text-gray-600">Total Sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn&apos;t load products: {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  products.map((product) => {
                    const status = getProductStatus(product)
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-sm text-gray-900">{product.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{vendorNames.get(product.vendorId) || "Unknown"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">${product.price}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{product.stock}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{product.soldCount}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                            {formatStatus(status)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                {!isLoading && !loadError && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
