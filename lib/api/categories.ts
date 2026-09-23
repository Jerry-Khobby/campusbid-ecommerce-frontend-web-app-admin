import { apiFetch } from "./client"

export interface Category {
  id: string
  name: string
  icon?: string
  productCount: number
  isActive: boolean
  sortOrder: number
}

export interface CategoryInput {
  name: string
  icon?: string
  sortOrder?: number
}

/** Lists every category, active and inactive, for admin management. */
export async function fetchAdminCategories(): Promise<Category[]> {
  const json = await apiFetch<{ data: Category[] }>("/categories/admin")
  return json.data
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const json = await apiFetch<{ data: Category }>("/categories", { method: "POST", body: input })
  return json.data
}

export async function updateCategory(id: string, input: Partial<CategoryInput> & { isActive?: boolean }): Promise<Category> {
  const json = await apiFetch<{ data: Category }>(`/categories/${id}`, { method: "PATCH", body: input })
  return json.data
}

/** Soft-deletes (deactivates) a category; it can be reactivated via updateCategory. */
export async function deactivateCategory(id: string): Promise<void> {
  await apiFetch(`/categories/${id}`, { method: "DELETE" })
}
