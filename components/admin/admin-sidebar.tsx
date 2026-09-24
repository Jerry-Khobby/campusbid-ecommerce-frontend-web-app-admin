"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useNotification } from "@/lib/notification-context";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { name: "Vendors", path: "/admin/vendors", icon: "🏪" },
  { name: "Customers", path: "/admin/customers", icon: "👥" },
  { name: "Orders", path: "/admin/orders", icon: "📦" },
  { name: "Products", path: "/admin/products", icon: "🛍️" },
  { name: "Categories", path: "/admin/categories", icon: "🗂️" },
  { name: "Payments", path: "/admin/payments", icon: "💳" },
  { name: "Analytics", path: "/admin/analytics", icon: "📈" },
  { name: "Settings", path: "/admin/settings", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const { addNotification } = useNotification();

  const handleSignOut = async () => {
    await logout();
    addNotification("Signed out successfully", "success");
    router.push("/admin/login");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
              CB
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg text-gray-900 truncate">CampusBid</h1>
              <p className="text-xs text-gray-500 truncate">Admin Portal</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || "admin@campusbid.com"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full text-sm border-purple-200 hover:bg-purple-100 hover:text-purple-700 bg-transparent"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
