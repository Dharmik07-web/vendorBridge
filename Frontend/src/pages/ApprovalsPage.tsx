import { MainLayout, Card, CardHeader, CardBody, Button, Badge } from '@/components/common'
import { mockApprovals } from '@/mock/data'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export const ApprovalsPage = () => {
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null)
  const currentApproval = mockApprovals.find((a) => a.id === selectedApproval)

  const handleApprove = (approvalId: string) => {
    toast.success(`Approval ${approvalId} approved`)
  }

  const handleReject = (approvalId: string) => {
    toast.error(`Approval ${approvalId} rejected`)
  }

  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Approval Workflow</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Multi-step approval pipeline</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Pending Approvals */}
          <Card className="lg:col-span-1">
            <CardHeader title="Pending Approvals" />
            <CardBody className="space-y-stack-md">
              {mockApprovals.map((approval) => (
                <button
                  key={approval.id}
                  onClick={() => setSelectedApproval(approval.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedApproval === approval.id
                      ? 'border-primary bg-primary-container/10'
                      : 'border-outline-variant/20 hover:border-primary/50'
                  }`}
                >
                  <p className="font-semibold text-on-surface">PO {approval.poId}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatCurrency(approval.totalAmount)}
                  </p>
                  <Badge status={approval.status} small className="mt-1" />
                </button>
              ))}
            </CardBody>
          </Card>

          {/* Approval Details */}
          {currentApproval && (
            <Card className="lg:col-span-2">
              <CardHeader
                title={`Approval: ${currentApproval.poId}`}
                action={<Badge status={currentApproval.status} />}
              />
              <CardBody className="space-y-stack-md">
                <div className="space-y-2">
                  <p className="text-body-sm text-on-surface-variant">
                    <span className="font-semibold">Type:</span> {currentApproval.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    <span className="font-semibold">Amount:</span> {formatCurrency(currentApproval.totalAmount)}
                  </p>
                </div>

                {/* Approval Steps */}
                <div className="border-t border-outline-variant/20 pt-stack-md">
                  <p className="text-label-caps text-label-caps text-on-surface-variant mb-2">
                    APPROVAL STEPS
                  </p>
                  <div className="space-y-2">
                    {currentApproval.reviewers.map((step) => (
                      <div key={step.id} className="flex items-start gap-3 p-2 bg-surface-container-low dark:bg-surface-container-high rounded">
                        <Badge status={step.status} small />
                        <div className="flex-1">
                          <p className="font-semibold text-on-surface">
                            {step.reviewer.firstName} {step.reviewer.lastName}
                          </p>
                          <p className="text-xs text-on-surface-variant">{step.reviewer.role.replace(/_/g, ' ')}</p>
                          {step.comments && (
                            <p className="text-body-sm text-on-surface-variant mt-1">{step.comments}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-stack-md border-t border-outline-variant/20">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(currentApproval.id)}
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleReject(currentApproval.id)}
                  >
                    ✕ Reject
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default ApprovalsPage
