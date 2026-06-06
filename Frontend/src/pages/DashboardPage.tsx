import { MainLayout, StatCard, Card, CardHeader, CardBody } from '@/components/common'
import { mockDashboardSummary, mockDashboardAnalytics } from '@/mock/data'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export const DashboardPage = () => {
  const summary = mockDashboardSummary
  const analytics = mockDashboardAnalytics

  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        {/* Header */}
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Good morning, Alex
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Here is what's happening with VendorBridge today.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <StatCard
            icon="📊"
            label="Active Vendors"
            value={summary.activeVendors}
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            icon="📄"
            label="Open RFQs"
            value={summary.openRFQs}
            trend="stable"
            trendValue="0%"
          />
          <StatCard
            icon="✅"
            label="Pending Approvals"
            value={summary.pendingApprovals}
            trend="down"
            trendValue="-3%"
            subtitle="Action Required"
          />
          <StatCard
            icon="💰"
            label="Monthly Spend"
            value={formatCurrency(summary.monthlySpend)}
            trend="up"
            trendValue="+4.2%"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Spend Trend */}
          <Card>
            <CardHeader
              title="Spend Trend"
              action={<span className="text-label-caps text-label-caps text-on-surface-variant">Last 6 Months</span>}
            />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.spendTrend}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Vendor Performance */}
          <Card>
            <CardHeader title="Vendor Performance" />
            <CardBody>
              <div className="space-y-stack-md">
                {analytics.vendorPerformance.map((vendor) => (
                  <div key={vendor.vendorId} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-on-surface">{vendor.vendorName}</p>
                      <p className="text-body-sm text-on-surface-variant">⭐ {vendor.score.toFixed(1)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-container"
                          style={{ width: `${(vendor.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-label-caps text-label-caps">
                        {vendor.trend === 'up' ? '↑' : vendor.trend === 'down' ? '↓' : '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* AI Performance Insights */}
          <Card>
            <CardHeader title="AI Performance Insights" />
            <CardBody className="space-y-stack-md">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-label-caps text-label-caps text-green-800 dark:text-green-200 font-semibold mb-1">
                  ✅ Efficiency Alert
                </p>
                <p className="text-body-sm text-green-700 dark:text-green-300">
                  Procurement lead times for "IT Hardware" have decreased by 14% this month. Recommendation: consolidating Q4 orders with GlobalTech Systems Inc.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-label-caps text-label-caps text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
                  💡 Savings Opportunity
                </p>
                <p className="text-body-sm text-yellow-700 dark:text-yellow-300">
                  Dynamic discounting on 12 active invoices could save $14,200 if approved within 48 hours.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Overall Metrics */}
          <Card>
            <CardHeader title="Overall Metrics" />
            <CardBody className="space-y-stack-md">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Compliance Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${analytics.complianceScore}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-on-surface">{analytics.complianceScore}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Efficiency Gain</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 text-title-md">
                    +{analytics.efficiencyGain}%
                  </span>
                  <span className="text-green-600">↑</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-stack-md border-t border-outline-variant/20">
                <span className="text-body-sm text-on-surface-variant">Policy Compliance</span>
                <span className="font-bold text-on-surface">98%</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Stats Grid */}
        <Card>
          <CardHeader title="Procurement Stats" />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              <div className="text-center p-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg">
                <p className="text-title-md font-bold text-primary-container">{summary.stats.rfqPublished}</p>
                <p className="text-body-sm text-on-surface-variant">RFQs Published</p>
              </div>
              <div className="text-center p-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg">
                <p className="text-title-md font-bold text-primary-container">{summary.stats.quotationsReceived}</p>
                <p className="text-body-sm text-on-surface-variant">Quotations Received</p>
              </div>
              <div className="text-center p-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg">
                <p className="text-title-md font-bold text-primary-container">{summary.stats.ordersPlaced}</p>
                <p className="text-body-sm text-on-surface-variant">Orders Placed</p>
              </div>
              <div className="text-center p-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg">
                <p className="text-title-md font-bold text-error">{summary.stats.invoicesPending}</p>
                <p className="text-body-sm text-on-surface-variant">Invoices Pending</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
