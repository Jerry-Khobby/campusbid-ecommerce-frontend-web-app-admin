"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser } from "./api/auth";
import { clearTokens } from "./api/token-storage";
import type { SafeUser } from "./api/types";

export interface User {
  id: string;
  email: string;
  role: SafeUser["role"];
  // The backend has no display name for an admin account (it's a promoted
  // student, see docs/users.md) — kept optional so existing call sites that
  // fall back to a default (e.g. "Admin User") keep working.
  name?: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "campusbid-admin-user";

// The backend has no admin-accessible "who am I" endpoint (GET /users/profile
// is @Roles("student")-only), so the logged-in user is captured from the
// login response and persisted here, instead of re-fetched on each load.
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage can be unavailable (private browsing, disabled storage) —
    // the session simply won't persist across reloads in that case.
  }
}

function toUser(safeUser: SafeUser): User {
  return { id: safeUser._id, email: safeUser.email, role: safeUser.role };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: safeUser } = await loginUser({ email, password });

    if (safeUser.role !== "admin") {
      clearTokens();
      throw new Error("This account does not have admin access.");
    }

    const nextUser = toUser(safeUser);
    setUser(nextUser);
    writeStoredUser(nextUser);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      writeStoredUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn: user !== null, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
