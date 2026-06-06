import { MainLayout, Card, CardHeader, CardBody, Button, Badge } from '@/components/common'
import { mockRFQs } from '@/mock/data'
import { toast } from 'sonner'

export const RFQPage = () => {
  const handleCreateRFQ = () => {
    toast.info('RFQ creation form not yet implemented')
  }

  const handlePublish = (rfqId: string) => {
    toast.success(`RFQ ${rfqId} published`)
  }

  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Requests for Quotation</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">Manage and track all RFQs</p>
          </div>
          <Button variant="primary" size="lg" onClick={handleCreateRFQ}>
            + New RFQ
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {mockRFQs.map((rfq) => (
            <Card key={rfq.id}>
              <CardBody className="space-y-stack-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface">{rfq.title}</h3>
                    <p className="text-body-sm text-on-surface-variant mt-1">{rfq.projectName}</p>
                  </div>
                  <Badge status={rfq.status} small />
                </div>

                <p className="text-body-sm text-on-surface-variant line-clamp-2">{rfq.description}</p>

                <div className="space-y-1 text-body-sm">
                  <p><span className="text-on-surface-variant">Budget:</span> {rfq.estimatedBudget}</p>
                  <p><span className="text-on-surface-variant">Deadline:</span> {rfq.targetDeadline}</p>
                  <p><span className="text-on-surface-variant">Items:</span> {rfq.items.length}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-stack-md"
                  onClick={() => handlePublish(rfq.id)}
                >
                  View RFQ
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default RFQPage
