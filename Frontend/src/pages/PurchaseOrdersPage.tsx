import { MainLayout, Card, CardHeader, CardBody, Button, Badge } from '@/components/common'
import { mockPurchaseOrders } from '@/mock/data'
import { formatCurrency, formatDate } from '@/lib/utils'

export const PurchaseOrdersPage = () => {
  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Purchase Orders</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">Track and manage all purchase orders</p>
          </div>
          <Button variant="primary" size="lg">
            + New PO
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      PO Number
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Vendor
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Amount
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Delivery Date
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Status
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockPurchaseOrders.map((po) => (
                    <tr
                      key={po.id}
                      className="border-b border-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                    >
                      <td className="p-4 font-semibold text-on-surface">{po.id}</td>
                      <td className="p-4 text-on-surface">{po.vendorName}</td>
                      <td className="p-4 text-on-surface">{formatCurrency(po.totalAmount)}</td>
                      <td className="p-4 text-on-surface-variant text-body-sm">
                        {formatDate(po.deliveryDate)}
                      </td>
                      <td className="p-4">
                        <Badge status={po.status} small />
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default PurchaseOrdersPage
