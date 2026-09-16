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
import { approveCustomer, fetchAdminCustomers, suspendCustomer } from "@/lib/api/users";
import type { AdminCustomer } from "@/lib/api/types";

const SEARCH_DEBOUNCE_MS = 300;

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

function getCustomerName(customer: AdminCustomer): string {
  const name = [customer.profile.firstName, customer.profile.lastName].filter(Boolean).join(" ");
  return name || customer.email;
}

export default function AdminCustomersPage() {
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchAdminCustomers(searchQuery || undefined);
        if (!isCancelled) setCustomers(data);
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

  const handleViewCustomer = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleSuspendCustomer = async (customer: AdminCustomer) => {
    setPendingActionId(customer._id);
    try {
      const updated = await suspendCustomer(customer._id);
      setCustomers((current) => current.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)));
      addNotification(`${getCustomerName(customer)} suspended successfully`, "success");
    } catch (error) {
      addNotification(getErrorMessage(error), "error");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleActivateCustomer = async (customer: AdminCustomer) => {
    setPendingActionId(customer._id);
    try {
      const updated = await approveCustomer(customer._id);
      setCustomers((current) => current.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)));
      addNotification(`${getCustomerName(customer)} activated successfully`, "success");
    } catch (error) {
      addNotification(getErrorMessage(error), "error");
    } finally {
      setPendingActionId(null);
    }
  };

  const activeCustomers = customers.filter((c) => c.isActive).length;
  const suspendedCustomers = customers.filter((c) => !c.isActive).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all customers on the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{activeCustomers}</div>
            <p className="text-sm text-gray-600">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{suspendedCustomers}</div>
            <p className="text-sm text-gray-600">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name, email, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn&apos;t load customers: {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    University
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
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
                      Loading customers...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{getCustomerName(customer)}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{customer.profile.university || "—"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{customer.totalOrders}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          ${customer.totalSpent.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {customer.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewCustomer(customer)}>
                            View
                          </Button>
                          {customer.isActive ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={pendingActionId === customer._id}
                              onClick={() => handleSuspendCustomer(customer)}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={pendingActionId === customer._id}
                              onClick={() => handleActivateCustomer(customer)}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && !loadError && customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No customers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information about the customer
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCustomer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedCustomer.isActive ? "Active" : "Suspended"}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium">{getCustomerName(selectedCustomer)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedCustomer.profile.phoneNumber || "—"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">University</Label>
                  <p className="font-medium">{selectedCustomer.profile.university || "—"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Joined Date</Label>
                  <p className="font-medium">
                    {selectedCustomer.createdAt
                      ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Purchase History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ${selectedCustomer.totalSpent.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
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
