// Shapes matching the backend's real responses (see docs/users.md, docs/vendors.md
// in campus-bid-backend-web-app) — only the fields this app actually reads.

export interface SafeUser {
  _id: string
  email: string
  role: "student" | "admin" | "vendor"
}

export interface VendorProfile {
  businessName: string
  ownerName?: string
  phoneNumber: string
}

export interface SafeVendor {
  _id: string
  email: string
  profile: VendorProfile
  categories: string[]
  rating: { average: number; count: number }
  stats: { totalOrders: number; completedOrders: number; totalRevenue: number }
  isVerified: boolean
  isActive: boolean
  createdAt?: string
}
