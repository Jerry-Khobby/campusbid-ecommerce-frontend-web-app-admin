"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotification } from "@/lib/notification-context";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  totalSales: number;
  totalOrders: number;
  rating: number;
  status: "active" | "suspended" | "pending";
  joinedDate: string;
}

export default function AdminVendorsPage() {
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock vendor data
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "V001",
      name: "John Smith",
      email: "john@campusstore.com",
      phone: "+1234567890",
      businessName: "Campus Store",
      category: "General Store",
      totalSales: 15420,
      totalOrders: 234,
      rating: 4.8,
      status: "active",
      joinedDate: "2024-01-15",
    },
    {
      id: "V002",
      name: "Sarah Johnson",
      email: "sarah@techhub.com",
      phone: "+1234567891",
      businessName: "Tech Hub",
      category: "Electronics",
      totalSales: 12350,
      totalOrders: 189,
      rating: 4.9,
      status: "active",
      joinedDate: "2024-02-20",
    },
    {
      id: "V003",
      name: "Mike Davis",
      email: "mike@bookcorner.com",
      phone: "+1234567892",
      businessName: "Book Corner",
      category: "Books & Stationery",
      totalSales: 9870,
      totalOrders: 156,
      rating: 4.7,
      status: "active",
      joinedDate: "2024-03-10",
    },
    {
      id: "V004",
      name: "Emily Brown",
      email: "emily@fashionstore.com",
      phone: "+1234567893",
      businessName: "Fashion Store",
      category: "Clothing",
      totalSales: 8540,
      totalOrders: 142,
      rating: 4.6,
      status: "suspended",
      joinedDate: "2024-01-25",
    },
    {
      id: "V005",
      name: "David Wilson",
      email: "david@campuscafe.com",
      phone: "+1234567894",
      businessName: "Campus Cafe",
      category: "Food & Beverages",
      totalSales: 0,
      totalOrders: 0,
      rating: 0,
      status: "pending",
      joinedDate: "2024-04-01",
    },
  ]);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsViewDialogOpen(true);
  };

  const handleSuspendVendor = (vendorId: string) => {
    setVendors(
      vendors.map((v) =>
        v.id === vendorId
          ? { ...v, status: v.status === "suspended" ? "active" : "suspended" }
          : v
      )
    );
    const vendor = vendors.find((v) => v.id === vendorId);
    addNotification(
      `${vendor?.businessName} ${
        vendor?.status === "suspended" ? "activated" : "suspended"
      } successfully`,
      "success"
    );
  };

  const handleApproveVendor = (vendorId: string) => {
    setVendors(
      vendors.map((v) => (v.id === vendorId ? { ...v, status: "active" } : v))
    );
    const vendor = vendors.find((v) => v.id === vendorId);
    addNotification(`${vendor?.businessName} approved successfully`, "success");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all vendors on the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {vendors.filter((v) => v.status === "active").length}
            </div>
            <p className="text-sm text-gray-600">Active Vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {vendors.filter((v) => v.status === "pending").length}
            </div>
            <p className="text-sm text-gray-600">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {vendors.filter((v) => v.status === "suspended").length}
            </div>
            <p className="text-sm text-gray-600">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {vendors.length}
            </div>
            <p className="text-sm text-gray-600">Total Vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by business name, vendor name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Vendors Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Business
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {vendor.name}
                        </p>
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {vendor.businessName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{vendor.category}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        ${vendor.totalSales.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {vendor.totalOrders}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {vendor.rating > 0 ? `⭐ ${vendor.rating}` : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          vendor.status
                        )}`}
                      >
                        {vendor.status.charAt(0).toUpperCase() +
                          vendor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewVendor(vendor)}
                        >
                          View
                        </Button>
                        {vendor.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        )}
                        {vendor.status !== "pending" && (
                          <Button
                            size="sm"
                            variant={
                              vendor.status === "suspended"
                                ? "default"
                                : "destructive"
                            }
                            onClick={() => handleSuspendVendor(vendor.id)}
                          >
                            {vendor.status === "suspended"
                              ? "Activate"
                              : "Suspend"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Vendor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Complete information about the vendor
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Vendor ID</Label>
                  <p className="font-medium">{selectedVendor.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        selectedVendor.status
                      )}`}
                    >
                      {selectedVendor.status.charAt(0).toUpperCase() +
                        selectedVendor.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Vendor Name</Label>
                  <p className="font-medium">{selectedVendor.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Business Name</Label>
                  <p className="font-medium">{selectedVendor.businessName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{selectedVendor.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedVendor.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Category</Label>
                  <p className="font-medium">{selectedVendor.category}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Joined Date</Label>
                  <p className="font-medium">
                    {new Date(selectedVendor.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ${selectedVendor.totalSales.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Sales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedVendor.totalOrders}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedVendor.rating > 0
                          ? `⭐ ${selectedVendor.rating}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
