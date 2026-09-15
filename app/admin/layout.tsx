"use client";

import type React from "react";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UserProvider } from "@/lib/user-context";
import { NotificationProvider } from "@/lib/notification-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  if (isLoginPage) {
    return (
      <NotificationProvider>
        <UserProvider>{children}</UserProvider>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <UserProvider>
        <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </UserProvider>
    </NotificationProvider>
  );
}
