import { MainLayout, Card, CardHeader, CardBody, Button, Badge } from '@/components/common'
import { mockInvoices } from '@/mock/data'
import { formatCurrency, formatDate } from '@/lib/utils'

export const InvoicesPage = () => {
  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Invoices</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage and track all invoices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <Card className="text-center">
            <CardBody>
              <p className="text-title-md font-bold text-primary-container">
                {mockInvoices.filter((i) => i.status === 'pending').length}
              </p>
              <p className="text-body-sm text-on-surface-variant">Pending</p>
            </CardBody>
          </Card>
          <Card className="text-center">
            <CardBody>
              <p className="text-title-md font-bold text-green-600">
                {mockInvoices.filter((i) => i.status === 'paid').length}
              </p>
              <p className="text-body-sm text-on-surface-variant">Paid</p>
            </CardBody>
          </Card>
          <Card className="text-center">
            <CardBody>
              <p className="text-title-md font-bold text-yellow-600">
                {mockInvoices.filter((i) => i.status === 'partial_paid').length}
              </p>
              <p className="text-body-sm text-on-surface-variant">Partial Paid</p>
            </CardBody>
          </Card>
          <Card className="text-center">
            <CardBody>
              <p className="text-title-md font-bold text-red-600">
                {mockInvoices.filter((i) => i.status === 'overdue').length}
              </p>
              <p className="text-body-sm text-on-surface-variant">Overdue</p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Recent Invoices" />
          <CardBody>
            <div className="space-y-2">
              {mockInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface">{invoice.invoiceNumber}</p>
                    <p className="text-body-sm text-on-surface-variant">{invoice.vendorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-on-surface">{formatCurrency(invoice.totalAmount)}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      Due: {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <Badge status={invoice.status} small className="ml-4" />
                  <Button variant="ghost" size="sm" className="ml-2">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}

export default InvoicesPage
