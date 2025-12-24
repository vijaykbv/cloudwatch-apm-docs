'use client'

import React, { useState, useEffect } from 'react'
import { 
  ComplianceMapping, 
  ComplianceFramework, 
  ComplianceControl, 
  ComplianceRequirement,
  ComplianceStatus,
  ComplianceEvidence 
} from '../../types/security'
import { complianceFrameworks } from '../../data/security-data'

interface ComplianceFrameworkMapperProps {
  selectedFrameworks?: ComplianceFramework[]
  onFrameworkSelect?: (framework: ComplianceFramework) => void
  onStatusUpdate?: (frameworkId: string, status: ComplianceStatus) => void
}

export const ComplianceFrameworkMapper: React.FC<ComplianceFrameworkMapperProps> = ({
  selectedFrameworks = [],
  onFrameworkSelect,
  onStatusUpdate
}) => {
  const [activeFramework, setActiveFramework] = useState<ComplianceMapping | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'requirements' | 'evidence'>('overview')
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'all'>('all')

  useEffect(() => {
    if (complianceFrameworks.length > 0) {
      setActiveFramework(complianceFrameworks[0])
    }
  }, [])

  const handleFrameworkSelect = (framework: ComplianceMapping) => {
    setActiveFramework(framework)
    onFrameworkSelect?.(framework.framework)
  }

  const getFrameworkIcon = (framework: ComplianceFramework) => {
    const icons = {
      'SOC2': '🛡️',
      'ISO27001': '🔒',
      'GDPR': '🇪🇺',
      'HIPAA': '🏥',
      'PCI-DSS': '💳',
      'FedRAMP': '🏛️',
      'NIST': '🔬',
      'CIS': '⚙️'
    }
    return icons[framework] || '📋'
  }

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800'
      case 'non-compliant':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'not-assessed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return '✅'
      case 'non-compliant':
        return '❌'
      case 'partial':
        return '⚠️'
      case 'not-assessed':
        return '❓'
      default:
        return '❓'
    }
  }

  const getEvidenceTypeIcon = (type: string) => {
    const icons = {
      'configuration': '⚙️',
      'log': '📝',
      'report': '📊',
      'certificate': '🏆',
      'documentation': '📄',
      'test-result': '🧪'
    }
    return icons[type] || '📎'
  }

  const filteredControls = activeFramework?.controls.filter(control => 
    filterStatus === 'all' || activeFramework.status === filterStatus
  ) || []

  if (!activeFramework) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Compliance Frameworks Available
        </h3>
        <p className="text-gray-600">
          Compliance framework mappings are not available at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Compliance Framework Mapping
        </h2>
        <p className="text-gray-600">
          Map CloudWatch APM security controls to compliance framework requirements
        </p>
      </div>

      {/* Framework Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Available Frameworks</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {complianceFrameworks.map((framework) => (
            <div
              key={framework.framework}
              onClick={() => handleFrameworkSelect(framework)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                activeFramework.framework === framework.framework
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getFrameworkIcon(framework.framework)}</span>
                <h4 className="font-semibold text-gray-900">{framework.framework}</h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{getStatusIcon(framework.status)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                    {framework.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {framework.controls.length} controls
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'controls', label: 'Controls', icon: '🛡️' },
              { id: 'requirements', label: 'Requirements', icon: '📝' },
              { id: 'evidence', label: 'Evidence', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{getFrameworkIcon(activeFramework.framework)}</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {activeFramework.framework}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg">{getStatusIcon(activeFramework.status)}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeFramework.status)}`}>
                        {activeFramework.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onStatusUpdate?.(activeFramework.framework, activeFramework.status)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Statistics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Framework Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Controls:</span>
                      <span className="font-medium text-gray-900">{activeFramework.controls.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Requirements:</span>
                      <span className="font-medium text-gray-900">{activeFramework.requirements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Evidence Items:</span>
                      <span className="font-medium text-gray-900">{activeFramework.evidence.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activeFramework.status)}`}>
                        {activeFramework.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Control Categories */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Control Categories</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(activeFramework.controls.map(c => c.category))).map((category, index) => {
                      const categoryCount = activeFramework.controls.filter(c => c.category === category).length
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{category}</span>
                          <span className="px-2 py-1 bg-white text-blue-800 text-xs font-medium rounded-full">
                            {categoryCount}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Evidence Types */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Evidence Types</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(activeFramework.evidence.map(e => e.type))).map((type, index) => {
                      const typeCount = activeFramework.evidence.filter(e => e.type === type).length
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span>{getEvidenceTypeIcon(type)}</span>
                            <span className="text-sm text-gray-700">{type}</span>
                          </div>
                          <span className="px-2 py-1 bg-white text-green-800 text-xs font-medium rounded-full">
                            {typeCount}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Framework Description */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Framework Information</h4>
                <div className="prose max-w-none">
                  {activeFramework.framework === 'SOC2' && (
                    <p className="text-gray-700">
                      SOC 2 (Service Organization Control 2) is an auditing procedure that ensures service providers 
                      securely manage data to protect the interests of the organization and the privacy of its clients. 
                      SOC 2 compliance is particularly important for technology and cloud computing organizations.
                    </p>
                  )}
                  {activeFramework.framework === 'GDPR' && (
                    <p className="text-gray-700">
                      The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and 
                      privacy in the European Union and the European Economic Area. It addresses the transfer of 
                      personal data outside the EU and EEA areas.
                    </p>
                  )}
                  {activeFramework.framework === 'ISO27001' && (
                    <p className="text-gray-700">
                      ISO/IEC 27001 is an international standard that specifies the requirements for establishing, 
                      implementing, maintaining and continually improving an information security management system 
                      within the context of the organization.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Security Controls</h3>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ComplianceStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="compliant">Compliant</option>
                  <option value="non-compliant">Non-Compliant</option>
                  <option value="partial">Partial</option>
                  <option value="not-assessed">Not Assessed</option>
                </select>
              </div>

              <div className="grid gap-4">
                {filteredControls.map((control) => (
                  <div key={control.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{control.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{control.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {control.category}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {control.framework}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Implementation</h5>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-700">{control.implementation}</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Validation</h5>
                        <div className="bg-blue-50 rounded p-3">
                          <p className="text-sm text-blue-800">{control.validation}</p>
                        </div>
                      </div>
                    </div>

                    {control.evidence.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Evidence</h5>
                        <div className="flex flex-wrap gap-2">
                          {control.evidence.map((evidence, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {evidence}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredControls.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🔍</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No Controls Found</h4>
                  <p className="text-gray-600">No controls match the selected status filter.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Compliance Requirements</h3>
              
              <div className="grid gap-4">
                {activeFramework.requirements.map((requirement) => (
                  <div key={requirement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{requirement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {requirement.mandatory && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Mandatory
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {requirement.section}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Implementation</h5>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-700">{requirement.implementation}</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Validation</h5>
                        <div className="bg-blue-50 rounded p-3">
                          <p className="text-sm text-blue-800">{requirement.validation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                      <span>Framework: {requirement.framework}</span>
                      <span>Section: {requirement.section}</span>
                      <span>ID: {requirement.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Compliance Evidence</h3>
              
              <div className="grid gap-4">
                {activeFramework.evidence.map((evidence) => (
                  <div key={evidence.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getEvidenceTypeIcon(evidence.type)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{evidence.type.toUpperCase()}</h4>
                          <p className="text-sm text-gray-600 mt-1">{evidence.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          evidence.automated 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {evidence.automated ? 'Automated' : 'Manual'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {evidence.frequency}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">Location:</span>
                        <span className="text-sm text-gray-700">{evidence.location}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                      <span>Type: {evidence.type}</span>
                      <span>Collection: {evidence.frequency}</span>
                      <span>ID: {evidence.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComplianceFrameworkMapper