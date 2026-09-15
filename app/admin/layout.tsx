"use client";

import type React from "react";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UserProvider, useUser } from "@/lib/user-context";
import { NotificationProvider } from "@/lib/notification-context";
import NotificationToast from "@/components/notification-toast";

function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isLoginPage) {
      const params = new URLSearchParams();
      params.set("redirect", pathname);
      router.push(`/admin/login?${params.toString()}`);
    }
  }, [user, isLoading, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Still checking for a persisted session, or bouncing to login — avoid
  // flashing the admin shell before either resolves.
  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <UserProvider>
        <AdminAuthGate>{children}</AdminAuthGate>
      </UserProvider>
      <NotificationToast />
    </NotificationProvider>
  );
}
