"use client";

import { useEffect, useState } from "react";
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
import { ApiError } from "@/lib/api/client";
import { approveVendor, fetchAdminVendors, suspendVendor } from "@/lib/api/vendors";
import type { SafeVendor } from "@/lib/api/types";

const SEARCH_DEBOUNCE_MS = 300;

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export default function AdminVendorsPage() {
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<SafeVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<SafeVendor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchAdminVendors(searchQuery || undefined);
        if (!isCancelled) setVendors(data);
      } catch (error) {
        if (!isCancelled) setLoadError(getErrorMessage(error));
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleViewVendor = (vendor: SafeVendor) => {
    setSelectedVendor(vendor);
    setIsViewDialogOpen(true);
  };

  const handleApproveVendor = async (vendor: SafeVendor) => {
    setPendingActionId(vendor._id);
    try {
      const updated = await approveVendor(vendor._id);
      setVendors((current) => current.map((v) => (v._id === updated._id ? updated : v)));
      addNotification(`${updated.profile.businessName} approved successfully`, "success");
    } catch (error) {
      addNotification(getErrorMessage(error), "error");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleSuspendVendor = async (vendor: SafeVendor) => {
    setPendingActionId(vendor._id);
    try {
      const updated = await suspendVendor(vendor._id);
      setVendors((current) => current.map((v) => (v._id === updated._id ? updated : v)));
      addNotification(`${updated.profile.businessName} suspended successfully`, "success");
    } catch (error) {
      addNotification(getErrorMessage(error), "error");
    } finally {
      setPendingActionId(null);
    }
  };

  const activeCount = vendors.filter((v) => v.isActive).length;
  const pendingCount = vendors.filter((v) => !v.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve vendors who have self-registered on the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <p className="text-sm text-gray-600">Active Vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
            <p className="text-sm text-gray-600">Awaiting Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{vendors.length}</div>
            <p className="text-sm text-gray-600">Total Vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by business name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn&apos;t load vendors: {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Business
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categories
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
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
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading vendors...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {vendor.profile.businessName}
                          </p>
                          <p className="text-sm text-gray-500">{vendor.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">
                          {vendor.categories.length > 0 ? vendor.categories.join(", ") : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          ${vendor.stats.totalRevenue.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{vendor.stats.totalOrders}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">
                          {vendor.rating.average > 0 ? `⭐ ${vendor.rating.average}` : "N/A"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            vendor.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {vendor.isActive ? "Active" : "Pending Approval"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewVendor(vendor)}>
                            View
                          </Button>
                          {vendor.isActive ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={pendingActionId === vendor._id}
                              onClick={() => handleSuspendVendor(vendor)}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={pendingActionId === vendor._id}
                              onClick={() => handleApproveVendor(vendor)}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && !loadError && vendors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No vendors match your search.
                    </td>
                  </tr>
                )}
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
                  <Label className="text-gray-600">Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedVendor.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedVendor.isActive ? "Active" : "Pending Approval"}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Bank Details Verified</Label>
                  <p className="font-medium">{selectedVendor.isVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Business Name</Label>
                  <p className="font-medium">{selectedVendor.profile.businessName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Owner Name</Label>
                  <p className="font-medium">{selectedVendor.profile.ownerName || "—"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{selectedVendor.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedVendor.profile.phoneNumber || "—"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Categories</Label>
                  <p className="font-medium">
                    {selectedVendor.categories.length > 0 ? selectedVendor.categories.join(", ") : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Joined Date</Label>
                  <p className="font-medium">
                    {selectedVendor.createdAt
                      ? new Date(selectedVendor.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ${selectedVendor.stats.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedVendor.stats.totalOrders}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedVendor.rating.average > 0 ? `⭐ ${selectedVendor.rating.average}` : "N/A"}
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
