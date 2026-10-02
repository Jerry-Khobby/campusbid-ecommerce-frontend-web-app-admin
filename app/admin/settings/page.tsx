"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useNotification } from "@/lib/notification-context"
import { useUser } from "@/lib/user-context"
import { ApiError } from "@/lib/api/client"
import { changePassword, fetchProfile, updateProfile, uploadProfileImage } from "@/lib/api/profile"
import { createAdmin } from "@/lib/api/admin"

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}

export default function AdminSettingsPage() {
  const { addNotification } = useNotification()
  const { user, setDisplayName, setProfileImage } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [newAdminFirstName, setNewAdminFirstName] = useState("")
  const [newAdminLastName, setNewAdminLastName] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")

  useEffect(() => {
    let isCancelled = false

    fetchProfile()
      .then((profile) => {
        if (isCancelled) return
        setFirstName(profile.profile.firstName ?? "")
        setLastName(profile.profile.lastName ?? "")
        setPhoneNumber(profile.profile.phoneNumber ?? "")
      })
      .catch((error) => addNotification(getErrorMessage(error), "error"))
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [addNotification])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await updateProfile({ firstName, lastName, phoneNumber })
      setDisplayName([firstName, lastName].filter(Boolean).join(" "))
      addNotification("Profile updated successfully", "success")
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const profile = await uploadProfileImage(file)
      if (profile.profile.profileImage) setProfileImage(profile.profile.profileImage)
      addNotification("Profile photo updated", "success")
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      addNotification("New password and confirmation don't match", "error")
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      addNotification("Password changed successfully", "success")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingAdmin(true)
    try {
      const admin = await createAdmin({
        email: newAdminEmail,
        password: newAdminPassword,
        firstName: newAdminFirstName,
        lastName: newAdminLastName,
      })
      addNotification(`${admin.email} can now sign in as an admin`, "success")
      setNewAdminFirstName("")
      setNewAdminLastName("")
      setNewAdminEmail("")
      setNewAdminPassword("")
    } catch (error) {
      addNotification(getErrorMessage(error), "error")
    } finally {
      setIsAddingAdmin(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                    {user?.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (firstName || user?.email || "A").charAt(0).toUpperCase()
                    )}
                  </div>
                  <label
                    htmlFor="profile-photo-input"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow cursor-pointer"
                  >
                    {isUploadingPhoto ? "…" : "📷"}
                  </label>
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input id="adminEmail" type="email" value={user?.email ?? ""} disabled />
                <p className="text-xs text-gray-500">Email can&apos;t be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone</Label>
                <Input id="adminPhone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSavingProfile ? "Saving..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <PasswordInput
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Add Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newAdminFirstName">First Name</Label>
                  <Input
                    id="newAdminFirstName"
                    value={newAdminFirstName}
                    onChange={(e) => setNewAdminFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAdminLastName">Last Name</Label>
                  <Input
                    id="newAdminLastName"
                    value={newAdminLastName}
                    onChange={(e) => setNewAdminLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newAdminEmail">Email</Label>
                <Input
                  id="newAdminEmail"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newAdminPassword">Temporary Password</Label>
                <Input
                  id="newAdminPassword"
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Share this with them directly - they should change it after signing in.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isAddingAdmin}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAddingAdmin ? "Adding..." : "Add Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
