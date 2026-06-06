import { MainLayout, Card, CardHeader, CardBody, Button, Badge } from '@/components/common'
import { mockQuotations } from '@/mock/data'
import { formatCurrency } from '@/lib/utils'

export const QuotationsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quotations</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Compare and review vendor quotations</p>
        </div>

        {/* Comparison View */}
        <Card>
          <CardHeader title="Active Quotations" />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Vendor
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Total Amount
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Delivery Days
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Status
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Compliance
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Rating
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockQuotations.map((quote) => (
                    <tr
                      key={quote.id}
                      className="border-b border-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                    >
                      <td className="p-4 font-semibold text-on-surface">{quote.vendorName}</td>
                      <td className="p-4 text-on-surface">{formatCurrency(quote.totalAmount)}</td>
                      <td className="p-4 text-on-surface">{quote.deliveryDays} days</td>
                      <td className="p-4">
                        <Badge status={quote.status} small />
                      </td>
                      <td className="p-4 text-on-surface">{quote.compliance}</td>
                      <td className="p-4 text-on-surface">⭐ {quote.rating}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}

export default QuotationsPage
