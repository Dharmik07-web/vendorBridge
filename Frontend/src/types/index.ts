// User & Auth
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'procurement_officer' | 'manager' | 'vendor'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Vendor
export interface Vendor {
  id: string
  name: string
  category: string
  email: string
  phone: string
  address: string
  riskScore: number
  complianceScore: string
  status: 'active' | 'pending' | 'flagged' | 'inactive'
  contracts: number
  performance: number
  lastOrder?: string
  totalSpend?: number
}

// RFQ (Request For Quotation)
export interface RFQ {
  id: string
  title: string
  description: string
  projectName: string
  estimatedBudget: string
  targetDeadline: string
  status: 'draft' | 'published' | 'closed' | 'cancelled'
  createdBy: string
  createdAt: string
  items: RFQItem[]
  vendors?: string[]
}

export interface RFQItem {
  id: string
  name: string
  quantity: number
  unit: string
  specifications?: string
}

// Quotation
export interface Quotation {
  id: string
  rfqId: string
  vendorId: string
  vendorName: string
  totalAmount: number
  deliveryDays: number
  status: 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
  lineItems: QuotationItem[]
  compliance?: string
  rating?: number
}

export interface QuotationItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Approval
export interface Approval {
  id: string
  poId: string
  type: 'quotation_review' | 'po_approval' | 'invoice_approval'
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  currentReviewer: User
  reviewers: ApprovalStep[]
  comments: ApprovalComment[]
  createdAt: string
  totalAmount: number
}

export interface ApprovalStep {
  id: string
  reviewer: User
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  reviewedAt?: string
  order: number
}

export interface ApprovalComment {
  id: string
  author: User
  content: string
  createdAt: string
}

// Purchase Order
export interface PurchaseOrder {
  id: string
  rfqId: string
  vendorId: string
  vendorName: string
  totalAmount: number
  status: 'draft' | 'sent' | 'acknowledged' | 'partial_received' | 'received' | 'cancelled'
  deliveryDate: string
  createdAt: string
  updatedAt: string
  lineItems: POLineItem[]
  shippingAddress: Address
}

export interface POLineItem {
  id: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

// Invoice
export interface Invoice {
  id: string
  invoiceNumber: string
  poId: string
  vendorId: string
  vendorName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  taxAmount: number
  status: 'draft' | 'sent' | 'viewed' | 'partial_paid' | 'paid' | 'overdue'
  lineItems: InvoiceItem[]
  paymentTerms?: string
  notes?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

// Dashboard
export interface DashboardSummary {
  activeVendors: number
  openRFQs: number
  pendingApprovals: number
  monthlySpend: number
  stats: {
    rfqPublished: number
    quotationsReceived: number
    ordersPlaced: number
    invoicesPending: number
  }
}

export interface DashboardAnalytics {
  spendTrend: SpendDataPoint[]
  vendorPerformance: VendorPerformance[]
  complianceScore: number
  efficiencyGain: number
}

export interface SpendDataPoint {
  month: string
  amount: number
}

export interface VendorPerformance {
  vendorId: string
  vendorName: string
  score: number
  trend: 'up' | 'down' | 'stable'
}

// Activity Log
export interface ActivityLog {
  id: string
  type: 'approval' | 'procurement' | 'security'
  action: string
  user: User
  entity: string
  timestamp: string
  details?: Record<string, any>
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Filter Types
export interface VendorFilter {
  category?: string
  status?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface RFQFilter {
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface QuotationFilter {
  rfqId?: string
  status?: string
  page?: number
  limit?: number
}
