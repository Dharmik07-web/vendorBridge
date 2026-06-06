import { useState } from 'react'
import { MainLayout, Card, CardBody, Button, Badge } from '@/components/common'
import { mockVendors } from '@/mock/data'
import { toast } from 'sonner'

export const VendorDirectoryPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const filteredVendors = mockVendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (vendorId: string) => {
    toast.info(`Viewing details for vendor ${vendorId}`)
  }

  const handleCreatePO = (vendorId: string) => {
    toast.info(`Creating PO for vendor ${vendorId}`)
  }

  return (
    <MainLayout>
      <div className="space-y-stack-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Vendor Directory</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Manage and monitor {mockVendors.length} enterprise partners and suppliers.
            </p>
          </div>
          <Button variant="primary" size="lg">
            + Add Vendor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row gap-gutter">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search vendors by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-sm"
              >
                <option>All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>

              {/* View Toggle */}
              <div className="flex gap-2 border border-outline-variant/30 rounded-lg p-1 bg-surface-container-low">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  📊 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  📋 List
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Vendors Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="flex flex-col">
                <CardBody className="flex-1 space-y-stack-md">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface">{vendor.name}</h3>
                      <p className="text-body-sm text-on-surface-variant mt-1">{vendor.category}</p>
                    </div>
                    <Badge status={vendor.status} small />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-body-sm">
                    <p className="text-on-surface-variant">
                      <span className="font-semibold">Email:</span> {vendor.email}
                    </p>
                    <p className="text-on-surface-variant">
                      <span className="font-semibold">Phone:</span> {vendor.phone}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-stack-md border-t border-outline-variant/20">
                    <div className="text-center p-2 bg-surface-container-low dark:bg-surface-container-high rounded">
                      <p className="text-title-md font-bold text-primary-container">{vendor.contracts}</p>
                      <p className="text-xs text-on-surface-variant">Contracts</p>
                    </div>
                    <div className="text-center p-2 bg-surface-container-low dark:bg-surface-container-high rounded">
                      <p className="text-title-md font-bold text-primary-container">{vendor.performance}%</p>
                      <p className="text-xs text-on-surface-variant">Performance</p>
                    </div>
                    <div className="text-center p-2 bg-surface-container-low dark:bg-surface-container-high rounded">
                      <p className="text-title-md font-bold text-primary-container">{vendor.riskScore}</p>
                      <p className="text-xs text-on-surface-variant">Risk Score</p>
                    </div>
                    <div className="text-center p-2 bg-surface-container-low dark:bg-surface-container-high rounded">
                      <p className="text-title-md font-bold text-primary-container">{vendor.complianceScore}</p>
                      <p className="text-xs text-on-surface-variant">Compliance</p>
                    </div>
                  </div>
                </CardBody>

                {/* Actions */}
                <div className="flex gap-2 pt-stack-md border-t border-outline-variant/20">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(vendor.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCreatePO(vendor.id)}
                  >
                    Create PO
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Vendor Name
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Category
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Status
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Performance
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Contracts
                    </th>
                    <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-b border-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-on-surface">{vendor.name}</p>
                          <p className="text-body-sm text-on-surface-variant">{vendor.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-body-sm text-on-surface">{vendor.category}</td>
                      <td className="p-4">
                        <Badge status={vendor.status} small />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-container"
                              style={{ width: `${vendor.performance}%` }}
                            ></div>
                          </div>
                          <span className="text-body-sm font-bold text-on-surface">{vendor.performance}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-body-sm text-on-surface">{vendor.contracts}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(vendor.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* No Results */}
        {filteredVendors.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-body-sm text-on-surface-variant">No vendors found matching your criteria.</p>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

export default VendorDirectoryPage
