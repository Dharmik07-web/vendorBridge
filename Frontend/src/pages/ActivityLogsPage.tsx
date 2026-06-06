import { MainLayout, Card, CardHeader, CardBody } from '@/components/common'
import { mockActivityLogs } from '@/mock/data'
import { formatDate } from '@/lib/utils'

export const ActivityLogsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Activity Logs</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Immutable event trail for compliance and security monitoring
          </p>
        </div>

        <Card>
          <CardHeader title="Recent Activity" />
          <CardBody>
            <div className="space-y-3">
              {mockActivityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border-l-4 border-primary-container bg-surface-container-low dark:bg-surface-container-high rounded"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-on-surface">{log.action}</span>
                      <span className="text-label-caps text-label-caps text-on-surface-variant">
                        {log.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      by {log.user.firstName} {log.user.lastName}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}

export default ActivityLogsPage
