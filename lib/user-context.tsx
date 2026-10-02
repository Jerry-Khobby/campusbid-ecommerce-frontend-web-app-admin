"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser } from "./api/auth";
import { clearTokens, getAccessToken } from "./api/token-storage";
import { fetchProfile } from "./api/profile";
import type { SafeUser } from "./api/types";

export interface User {
  id: string;
  email: string;
  role: SafeUser["role"];
  name?: string;
  profileImage?: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  // Lets Settings sync the sidebar's name/photo right after a save, without
  // waiting on a refetch.
  setDisplayName: (name: string) => void;
  setProfileImage: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "campusbid-admin-user";

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
  const name = [safeUser.profile.firstName, safeUser.profile.lastName].filter(Boolean).join(" ");
  return {
    id: safeUser._id,
    email: safeUser.email,
    role: safeUser.role,
    name: name || undefined,
    profileImage: safeUser.profile.profileImage,
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = async () => {
    if (!getAccessToken()) return;
    try {
      const safeUser = await fetchProfile();
      const nextUser = toUser(safeUser);
      setUser(nextUser);
      writeStoredUser(nextUser);
    } catch {
      // Keep whatever was already loaded from storage/login rather than
      // logging the admin out over a transient profile-fetch failure.
    }
  };

  useEffect(() => {
    // The stored session lives in localStorage, which the server render cannot
    // read, so it can only be restored after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(readStoredUser());
    setIsLoading(false);
    refetchUser();
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
    } catch {
      // The server call can fail (e.g. an already-expired access token) —
      // the local session still clears below regardless, since that's what
      // actually matters for "am I logged out" from the user's side.
    } finally {
      setUser(null);
      writeStoredUser(null);
    }
  };

  const setDisplayName = (name: string) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, name };
      writeStoredUser(next);
      return next;
    });
  };

  const setProfileImage = (url: string) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, profileImage: url };
      writeStoredUser(next);
      return next;
    });
  };

  return (
    <UserContext.Provider
      value={{ user, isLoggedIn: user !== null, isLoading, login, logout, refetchUser, setDisplayName, setProfileImage }}
    >
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
