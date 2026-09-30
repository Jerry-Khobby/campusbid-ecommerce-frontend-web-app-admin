"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// The drawer remembers the route it was opened on, so navigating to any
// other page closes it without needing a route-change effect.
export function AdminMobileNav() {
  const pathname = usePathname();
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const isOpen = openedOnPath === pathname;

  const openDrawer = () => setOpenedOnPath(pathname);
  const closeDrawer = () => setOpenedOnPath(null);

  useCloseOnEscape(isOpen, closeDrawer);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold text-gray-900">CampusBid Admin</span>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} aria-hidden="true" />
          <div className="relative h-full shadow-xl">
            <AdminSidebar />
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="absolute -right-12 top-4 rounded-full bg-white p-2 text-gray-700 shadow-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useCloseOnEscape(isOpen: boolean, close: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);
}
