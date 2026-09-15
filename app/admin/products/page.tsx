"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
  vendor: string
  category: string
  price: number
  stock: number
  sales: number
  status: "active" | "inactive" | "out-of-stock"
}

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock product data
  const products: Product[] = [
    {
      id: "P001",
      name: "Laptop Stand",
      vendor: "Campus Store",
      category: "Electronics",
      price: 29.99,
      stock: 45,
      sales: 234,
      status: "active",
    },
    {
      id: "P002",
      name: "Wireless Mouse",
      vendor: "Tech Hub",
      category: "Electronics",
      price: 24.99,
      stock: 0,
      sales: 189,
      status: "out-of-stock",
    },
    {
      id: "P003",
      name: "Physics Textbook",
      vendor: "Book Corner",
      category: "Books",
      price: 89.99,
      stock: 23,
      sales: 156,
      status: "active",
    },
    {
      id: "P004",
      name: "T-Shirt",
      vendor: "Fashion Store",
      category: "Clothing",
      price: 19.99,
      stock: 120,
      sales: 342,
      status: "active",
    },
  ]

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "inactive":
        return "bg-gray-100 text-gray-700"
      case "out-of-stock":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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
            <div className="text-2xl font-bold text-gray-900">
              {products.filter((p) => p.status === "active").length}
            </div>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {products.filter((p) => p.status === "out-of-stock").length}
            </div>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{products.reduce((sum, p) => sum + p.sales, 0)}</div>
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
              placeholder="Search by product name, vendor, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm text-gray-900">{product.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{product.vendor}</p>
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
                      <p className="text-sm text-gray-900">{product.sales}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                        {product.status
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
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
