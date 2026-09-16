import { apiFetch } from "./client"
import { fetchAdminVendors } from "./vendors"
import type { AdminProduct } from "./types"

/** GET /products already returns every product with no forced availability
 * filter — the only gap is it has no vendor name inline, just a vendorId.
 * Unlike most endpoints in this API, the list fields are spread onto the
 * top-level response, not nested under `data`. */
export async function fetchAdminProducts(search?: string): Promise<AdminProduct[]> {
  const json = await apiFetch<{ items: AdminProduct[] }>("/products", {
    query: { search, limit: 100 },
  })
  return json.items
}

/** vendorId -> business name, resolved from the admin vendors list (which,
 * unlike the public vendor list, includes pending/suspended vendors too). */
export async function fetchVendorNameMap(): Promise<Map<string, string>> {
  const vendors = await fetchAdminVendors()
  return new Map(vendors.map((vendor) => [vendor._id, vendor.profile.businessName]))
}
