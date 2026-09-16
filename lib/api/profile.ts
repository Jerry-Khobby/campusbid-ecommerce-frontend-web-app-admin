import { apiFetch, apiUpload } from "./client"
import type { SafeUser } from "./types"

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export async function fetchProfile(): Promise<SafeUser> {
  const json = await apiFetch<{ user: SafeUser }>("/users/profile")
  return json.user
}

export async function updateProfile(input: UpdateProfileInput): Promise<SafeUser> {
  const json = await apiFetch<{ user: SafeUser }>("/users/profile", {
    method: "PUT",
    body: { profile: input },
  })
  return json.user
}

export async function uploadProfileImage(file: File): Promise<SafeUser> {
  const formData = new FormData()
  formData.append("profileImage", file)
  const json = await apiUpload<{ user: SafeUser }>("/users/profile/image", formData, "POST")
  return json.user
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiFetch("/users/change-password", {
    method: "POST",
    body: { oldPassword, newPassword },
  })
}
