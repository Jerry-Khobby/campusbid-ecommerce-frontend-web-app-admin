"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNotification } from "@/lib/notification-context"
import { useUser } from "@/lib/user-context"

export default function AdminSettingsPage() {
  const { addNotification } = useNotification()
  const { user } = useUser()

  // Platform Settings
  const [platformName, setPlatformName] = useState("CampusBid")
  const [platformEmail, setPlatformEmail] = useState("admin@campusbid.com")
  const [supportEmail, setSupportEmail] = useState("support@campusbid.com")
  const [platformDescription, setPlatformDescription] = useState(
    "The premier marketplace for university students and vendors",
  )

  // Commission Settings
  const [vendorCommission, setVendorCommission] = useState("5")
  const [transactionFee, setTransactionFee] = useState("2.5")

  // Admin Profile
  const [adminName, setAdminName] = useState(user?.name || "Admin User")
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@campusbid.com")
  const [adminPhone, setAdminPhone] = useState("+1234567890")

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [vendorNotifications, setVendorNotifications] = useState(true)

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault()
    addNotification("Platform settings updated successfully", "success")
  }

  const handleSaveCommissionSettings = (e: React.FormEvent) => {
    e.preventDefault()
    addNotification("Commission settings updated successfully", "success")
  }

  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault()
    addNotification("Profile updated successfully", "success")
  }

  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault()
    addNotification("Notification preferences updated", "success")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Manage platform configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePlatformSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input id="platformName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformEmail">Platform Email</Label>
                <Input
                  id="platformEmail"
                  type="email"
                  value={platformEmail}
                  onChange={(e) => setPlatformEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={platformDescription}
                  onChange={(e) => setPlatformDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Save Platform Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Commission & Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCommissionSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendorCommission">Vendor Commission (%)</Label>
                <Input
                  id="vendorCommission"
                  type="number"
                  step="0.1"
                  value={vendorCommission}
                  onChange={(e) => setVendorCommission(e.target.value)}
                />
                <p className="text-xs text-gray-500">Percentage taken from each vendor sale</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                <Input
                  id="transactionFee"
                  type="number"
                  step="0.1"
                  value={transactionFee}
                  onChange={(e) => setTransactionFee(e.target.value)}
                />
                <p className="text-xs text-gray-500">Additional fee per transaction</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Current Rates</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Vendor Commission: {vendorCommission}%</p>
                  <p className="text-sm text-gray-600">Transaction Fee: {transactionFee}%</p>
                  <p className="text-sm font-medium text-purple-700 mt-2">
                    Total Platform Fee:{" "}
                    {(Number.parseFloat(vendorCommission) + Number.parseFloat(transactionFee)).toFixed(1)}%
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Save Commission Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfileSettings} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {adminName.charAt(0)}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    onClick={() => addNotification("Profile photo upload coming soon!", "info")}
                  >
                    📷
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name</Label>
                <Input id="adminName" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone</Label>
                <Input id="adminPhone" type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNotificationSettings} className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-600">Receive email updates</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Order Notifications</p>
                    <p className="text-xs text-gray-600">Get notified of new orders</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderNotifications(!orderNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      orderNotifications ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        orderNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Vendor Notifications</p>
                    <p className="text-xs text-gray-600">New vendor registrations</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVendorNotifications(!vendorNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      vendorNotifications ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        vendorNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-600">Update your admin password</p>
              </div>
              <Button variant="outline" onClick={() => addNotification("Password change coming soon!", "info")}>
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" onClick={() => addNotification("Two-factor authentication coming soon!", "info")}>
                Enable 2FA
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-gray-600">Manage your active login sessions</p>
              </div>
              <Button variant="outline" onClick={() => addNotification("Session management coming soon!", "info")}>
                View Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
