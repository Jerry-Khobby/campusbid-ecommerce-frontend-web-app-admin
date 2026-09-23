import { apiFetch } from "./client"
import { clearTokens, setTokens } from "./token-storage"
import type { SafeUser } from "./types"

interface AuthResult {
  user: SafeUser
  accessToken: string
  refreshToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const json = await apiFetch<{ user: SafeUser; accessToken: string; refreshToken: string }>("/users/login", {
    method: "POST",
    body: input,
    auth: false,
  })
  setTokens(json.accessToken, json.refreshToken)
  return json
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch("/users/logout", { method: "POST" })
  } finally {
    clearTokens()
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch("/users/forgot-password", { method: "POST", body: { email }, auth: false })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiFetch("/users/reset-password", { method: "POST", body: { token, newPassword }, auth: false })
}
