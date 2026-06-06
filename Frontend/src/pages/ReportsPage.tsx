import { MainLayout, Card, CardHeader, CardBody, StatCard } from '@/components/common'
import { mockDashboardAnalytics } from '@/mock/data'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export const ReportsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Reports & Analytics</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Executive analytics and procurement insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <StatCard
            icon="📊"
            label="Compliance Score"
            value={`${mockDashboardAnalytics.complianceScore}%`}
          />
          <StatCard
            icon="📈"
            label="Efficiency Gain (YoY)"
            value={`+${mockDashboardAnalytics.efficiencyGain}%`}
            trend="up"
          />
        </div>

        {/* Spend Trend Chart */}
        <Card>
          <CardHeader title="Procurement Spend Trend" />
          <CardBody>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={mockDashboardAnalytics.spendTrend}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Vendor Performance Ranking */}
        <Card>
          <CardHeader title="Vendor Performance Ranking" />
          <CardBody className="space-y-stack-md">
            {mockDashboardAnalytics.vendorPerformance.map((vendor, index) => (
              <div key={vendor.vendorId} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{vendor.vendorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container"
                        style={{ width: `${(vendor.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-on-surface">⭐ {vendor.score.toFixed(1)}</span>
                    <span className="text-label-caps text-label-caps">
                      {vendor.trend === 'up' ? '↑' : vendor.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}

export default ReportsPage
