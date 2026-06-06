import type {
  User,
  Vendor,
  RFQ,
  Quotation,
  Approval,
  PurchaseOrder,
  Invoice,
  DashboardSummary,
  DashboardAnalytics,
  ActivityLog,
} from '@/types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-2',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah@example.com',
    role: 'procurement_officer',
    status: 'active',
    createdAt: '2024-02-10',
  },
  {
    id: 'user-3',
    firstName: 'Mark',
    lastName: 'Jensen',
    email: 'mark@example.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-03-05',
  },
]

// Mock Vendors
export const mockVendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'GlobalTech Solutions',
    category: 'Electronics & IT',
    email: 'contact@globaltech.com',
    phone: '+1-555-0101',
    address: '123 Tech Ave, Silicon Valley, CA',
    riskScore: 12,
    complianceScore: '98% Perfect',
    status: 'active',
    contracts: 45,
    performance: 98,
    totalSpend: 2400000,
  },
  {
    id: 'vendor-2',
    name: 'Silicon Systems',
    category: 'IT Hardware',
    email: 'sales@siliconsys.com',
    phone: '+1-555-0102',
    address: '456 Server St, Austin, TX',
    riskScore: 8,
    complianceScore: '82% High',
    status: 'active',
    contracts: 32,
    performance: 85,
    totalSpend: 1800000,
  },
  {
    id: 'vendor-3',
    name: 'Apex Cloud Infra',
    category: 'Cloud Services',
    email: 'info@apexcloud.com',
    phone: '+1-555-0103',
    address: '789 Cloud Blvd, Seattle, WA',
    riskScore: 5,
    complianceScore: '92% Excellent',
    status: 'active',
    contracts: 28,
    performance: 92,
    totalSpend: 1500000,
  },
]

// Mock RFQs
export const mockRFQs: RFQ[] = [
  {
    id: 'rfq-1',
    title: 'High-Capacity Server Procurement',
    description: 'Requirements for enterprise-grade servers',
    projectName: 'Q2 2024 Infrastructure Upgrade',
    estimatedBudget: '150000 - 200000',
    targetDeadline: '2024-12-31',
    status: 'published',
    createdBy: 'user-2',
    createdAt: '2024-06-01',
    items: [
      {
        id: 'item-1',
        name: 'Enterprise Blade Server v4',
        quantity: 12,
        unit: 'Units',
        specifications: '64 CPU cores, 128GB RAM, dual 10GbE',
      },
    ],
    vendors: ['vendor-1', 'vendor-2'],
  },
]

// Mock Quotations
export const mockQuotations: Quotation[] = [
  {
    id: 'quote-1',
    rfqId: 'rfq-1',
    vendorId: 'vendor-1',
    vendorName: 'GlobalTech Solutions',
    totalAmount: 1420500,
    deliveryDays: 12,
    status: 'submitted',
    createdAt: '2024-06-05',
    lineItems: [
      {
        id: 'li-1',
        name: 'Enterprise Blade Server v4',
        quantity: 12,
        unitPrice: 118375,
        totalPrice: 1420500,
      },
    ],
    compliance: '98% Perfect',
    rating: 4.8,
  },
]

// Mock Approvals
export const mockApprovals: Approval[] = [
  {
    id: 'approval-1',
    poId: 'po-1',
    type: 'quotation_review',
    status: 'in_progress',
    currentReviewer: mockUsers[2],
    reviewers: [
      {
        id: 'step-1',
        reviewer: mockUsers[2],
        status: 'approved',
        comments: 'Looks good, verified compliance',
        reviewedAt: '2024-06-10',
        order: 1,
      },
    ],
    comments: [],
    createdAt: '2024-06-08',
    totalAmount: 142500,
  },
]

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    rfqId: 'rfq-1',
    vendorId: 'vendor-1',
    vendorName: 'GlobalTech Solutions',
    totalAmount: 1420500,
    status: 'sent',
    deliveryDate: '2024-12-15',
    createdAt: '2024-06-08',
    updatedAt: '2024-06-10',
    lineItems: [
      {
        id: 'po-li-1',
        itemName: 'Enterprise Blade Server v4',
        quantity: 12,
        unitPrice: 118375,
        totalPrice: 1420500,
      },
    ],
    shippingAddress: {
      street: '1210 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
  },
]

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-0892',
    poId: 'po-1',
    vendorId: 'vendor-1',
    vendorName: 'GlobalTech Solutions',
    issueDate: '2024-10-24',
    dueDate: '2024-11-15',
    totalAmount: 22257.88,
    paidAmount: 12150,
    taxAmount: 1782.88,
    status: 'partial_paid',
    lineItems: [
      {
        id: 'inv-li-1',
        description: 'Precision Optical Sensor Gen-4',
        quantity: 250,
        unitPrice: 42,
        amount: 10500,
      },
    ],
  },
]

// Mock Dashboard Summary
export const mockDashboardSummary: DashboardSummary = {
  activeVendors: 28,
  openRFQs: 12,
  pendingApprovals: 5,
  monthlySpend: 2300000,
  stats: {
    rfqPublished: 45,
    quotationsReceived: 128,
    ordersPlaced: 32,
    invoicesPending: 8,
  },
}

// Mock Dashboard Analytics
export const mockDashboardAnalytics: DashboardAnalytics = {
  spendTrend: [
    { month: 'Jan', amount: 1200000 },
    { month: 'Feb', amount: 1400000 },
    { month: 'Mar', amount: 1100000 },
    { month: 'Apr', amount: 1800000 },
    { month: 'May', amount: 2100000 },
    { month: 'Jun', amount: 2300000 },
  ],
  vendorPerformance: [
    { vendorId: 'vendor-1', vendorName: 'Global Systems Inc.', score: 4.9, trend: 'up' },
    { vendorId: 'vendor-2', vendorName: 'Precision Logistics', score: 4.7, trend: 'stable' },
    { vendorId: 'vendor-3', vendorName: 'Apex Office Supplies', score: 4.5, trend: 'down' },
  ],
  complianceScore: 96,
  efficiencyGain: 4.2,
}

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    type: 'approval',
    action: 'RFQ #2024-089 Approved',
    user: mockUsers[0],
    entity: 'rfq-1',
    timestamp: '2024-06-10T09:42:00Z',
  },
  {
    id: 'log-2',
    type: 'security',
    action: 'Suspicious login attempt blocked',
    user: mockUsers[0],
    entity: 'system',
    timestamp: '2024-06-09T08:15:00Z',
  },
]

// Helper functions
export const getMockVendorById = (id: string) => mockVendors.find((v) => v.id === id)
export const getMockRFQById = (id: string) => mockRFQs.find((r) => r.id === id)
export const getMockQuotationsByRFQId = (rfqId: string) =>
  mockQuotations.filter((q) => q.rfqId === rfqId)
export const getMockUserById = (id: string) => mockUsers.find((u) => u.id === id)
