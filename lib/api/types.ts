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

export interface AdminCustomerProfile {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  university?: string
}

export interface AdminCustomer {
  _id: string
  email: string
  profile: AdminCustomerProfile
  isActive: boolean
  createdAt?: string
  totalOrders: number
  totalSpent: number
}

export interface AdminOrderItem {
  productId: { _id: string; name: string } | string
  quantity: number
  price: number
}

export interface AdminOrderParty {
  _id: string
  email: string
  profile?: { firstName?: string; lastName?: string; businessName?: string }
}

export interface AdminOrder {
  _id: string
  orderNumber: string
  customerId: AdminOrderParty
  vendorId: AdminOrderParty
  items: AdminOrderItem[]
  pricing: { subtotal: number; deliveryFee: number; serviceFee: number; total: number }
  status: string
  createdAt: string
}

export interface AdminProduct {
  _id: string
  vendorId: string
  name: string
  category: string
  price: number
  discountPrice?: number
  stock: number
  isAvailable: boolean
  soldCount: number
  rating?: { average: number; count: number }
}

export interface AdminOrderStatusCount {
  status: string
  count: number
}

export interface AdminRecentOrder {
  orderNumber: string
  customer: { email: string; profile?: { firstName?: string; lastName?: string } } | null
  vendor: { profile?: { businessName?: string } } | null
  total: number
  status: string
  createdAt: string
}

export interface AdminRevenuePoint {
  _id: string
  orders: number
  revenue: number
}

export interface AdminTopVendor {
  vendorId: string
  name: string
  revenue: number
  orders: number
  rating?: number
}

export interface AdminRevenueByCategory {
  category: string
  revenue: number
}

export interface AdminCustomerGrowthPoint {
  month: string
  customers: number
}

export interface AdminDashboard {
  totalRevenue: number
  totalOrders: number
  activeVendors: number
  pendingVendors: number
  activeCustomers: number
  pendingOrders: number
  completedToday: number
  orderStatusBreakdown: AdminOrderStatusCount[]
  recentOrders: AdminRecentOrder[]
  revenueTrend: AdminRevenuePoint[]
  topVendors: AdminTopVendor[]
  revenueByCategory: AdminRevenueByCategory[]
  customerGrowth: AdminCustomerGrowthPoint[]
}

export interface AdminAnalytics {
  revenueTrend: AdminRevenuePoint[]
  topVendors: AdminTopVendor[]
  revenueByCategory: AdminRevenueByCategory[]
}
