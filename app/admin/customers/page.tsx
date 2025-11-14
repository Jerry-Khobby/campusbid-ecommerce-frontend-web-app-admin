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

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  totalOrders: number;
  totalSpent: number;
  accountStatus: "active" | "suspended" | "inactive";
  joinedDate: string;
  lastOrderDate: string;
}

export default function AdminCustomersPage() {
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock customer data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "C001",
      name: "Alice Johnson",
      email: "alice@university.edu",
      phone: "+1234567890",
      university: "State University",
      totalOrders: 45,
      totalSpent: 1250.5,
      accountStatus: "active",
      joinedDate: "2024-01-10",
      lastOrderDate: "2024-04-15",
    },
    {
      id: "C002",
      name: "Bob Williams",
      email: "bob@university.edu",
      phone: "+1234567891",
      university: "State University",
      totalOrders: 32,
      totalSpent: 890.25,
      accountStatus: "active",
      joinedDate: "2024-01-20",
      lastOrderDate: "2024-04-14",
    },
    {
      id: "C003",
      name: "Carol Martinez",
      email: "carol@university.edu",
      phone: "+1234567892",
      university: "Tech Institute",
      totalOrders: 28,
      totalSpent: 675.8,
      accountStatus: "active",
      joinedDate: "2024-02-05",
      lastOrderDate: "2024-04-10",
    },
    {
      id: "C004",
      name: "David Lee",
      email: "david@university.edu",
      phone: "+1234567893",
      university: "State University",
      totalOrders: 15,
      totalSpent: 420.0,
      accountStatus: "suspended",
      joinedDate: "2024-02-15",
      lastOrderDate: "2024-03-20",
    },
    {
      id: "C005",
      name: "Emma Davis",
      email: "emma@university.edu",
      phone: "+1234567894",
      university: "Community College",
      totalOrders: 8,
      totalSpent: 180.5,
      accountStatus: "inactive",
      joinedDate: "2024-03-01",
      lastOrderDate: "2024-03-05",
    },
  ]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleSuspendCustomer = (customerId: string) => {
    setCustomers(
      customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              accountStatus:
                c.accountStatus === "suspended" ? "active" : "suspended",
            }
          : c
      )
    );
    const customer = customers.find((c) => c.id === customerId);
    addNotification(
      `${customer?.name} ${
        customer?.accountStatus === "suspended" ? "activated" : "suspended"
      } successfully`,
      "success"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const activeCustomers = customers.filter(
    (c) => c.accountStatus === "active"
  ).length;
  const suspendedCustomers = customers.filter(
    (c) => c.accountStatus === "suspended"
  ).length;
  const inactiveCustomers = customers.filter(
    (c) => c.accountStatus === "inactive"
  ).length;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {activeCustomers}
            </div>
            <p className="text-sm text-gray-600">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {suspendedCustomers}
            </div>
            <p className="text-sm text-gray-600">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {inactiveCustomers}
            </div>
            <p className="text-sm text-gray-600">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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

          {/* Customers Table */}
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
                    Last Order
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {customer.university}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {customer.totalOrders}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        ${customer.totalSpent.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          customer.accountStatus
                        )}`}
                      >
                        {customer.accountStatus.charAt(0).toUpperCase() +
                          customer.accountStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          View
                        </Button>
                        {customer.accountStatus !== "inactive" && (
                          <Button
                            size="sm"
                            variant={
                              customer.accountStatus === "suspended"
                                ? "default"
                                : "destructive"
                            }
                            onClick={() => handleSuspendCustomer(customer.id)}
                          >
                            {customer.accountStatus === "suspended"
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
                  <Label className="text-gray-600">Customer ID</Label>
                  <p className="font-medium">{selectedCustomer.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        selectedCustomer.accountStatus
                      )}`}
                    >
                      {selectedCustomer.accountStatus.charAt(0).toUpperCase() +
                        selectedCustomer.accountStatus.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">University</Label>
                  <p className="font-medium">{selectedCustomer.university}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Joined Date</Label>
                  <p className="font-medium">
                    {new Date(selectedCustomer.joinedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Last Order</Label>
                  <p className="font-medium">
                    {new Date(
                      selectedCustomer.lastOrderDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Purchase History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedCustomer.totalOrders}
                      </p>
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
