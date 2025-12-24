'use client'

import React, { useState, useEffect } from 'react'
import { 
  DataPrivacyPolicy, 
  DataType, 
  RetentionPolicy, 
  ProcessingActivity,
  DataSubjectRights,
  DataRight,
  DataCategory,
  DataSensitivity 
} from '../../types/security'
import { dataPrivacyPolicies } from '../../data/security-data'

interface DataPrivacyPolicyManagerProps {
  onPolicyUpdate?: (policy: DataPrivacyPolicy) => void
}

export const DataPrivacyPolicyManager: React.FC<DataPrivacyPolicyManagerProps> = ({
  onPolicyUpdate
}) => {
  const [selectedPolicy, setSelectedPolicy] = useState<DataPrivacyPolicy | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'data-types' | 'retention' | 'processing' | 'rights'>('overview')
  const [filterCategory, setFilterCategory] = useState<DataCategory | 'all'>('all')
  const [filterSensitivity, setFilterSensitivity] = useState<DataSensitivity | 'all'>('all')

  useEffect(() => {
    if (dataPrivacyPolicies.length > 0) {
      setSelectedPolicy(dataPrivacyPolicies[0])
    }
  }, [])

  const handlePolicySelect = (policy: DataPrivacyPolicy) => {
    setSelectedPolicy(policy)
    onPolicyUpdate?.(policy)
  }

  const getCategoryIcon = (category: DataCategory) => {
    const icons = {
      'personal': '👤',
      'sensitive': '🔒',
      'public': '🌐',
      'internal': '🏢',
      'confidential': '🤐',
      'restricted': '🚫'
    }
    return icons[category] || '📊'
  }

  const getSensitivityColor = (sensitivity: DataSensitivity) => {
    switch (sensitivity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRightIcon = (right: DataRight) => {
    const icons = {
      'access': '👁️',
      'rectification': '✏️',
      'erasure': '🗑️',
      'portability': '📦',
      'restriction': '⏸️',
      'objection': '✋'
    }
    return icons[right] || '⚖️'
  }

  const filteredDataTypes = selectedPolicy?.dataTypes.filter(dataType => {
    const categoryMatch = filterCategory === 'all' || dataType.category === filterCategory
    const sensitivityMatch = filterSensitivity === 'all' || dataType.sensitivity === filterSensitivity
    return categoryMatch && sensitivityMatch
  }) || []

  if (!selectedPolicy) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Privacy Policies Available
        </h3>
        <p className="text-gray-600">
          Data privacy policies are not available at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Data Privacy Policy Manager
        </h2>
        <p className="text-gray-600">
          Manage data privacy policies and retention settings for CloudWatch APM
        </p>
      </div>

      {/* Policy Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Available Policies</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataPrivacyPolicies.map((policy) => (
            <div
              key={policy.id}
              onClick={() => handlePolicySelect(policy)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedPolicy.id === policy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🔒</span>
                <h4 className="font-semibold text-gray-900">{policy.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{policy.dataTypes.length} data types</span>
                <span>{policy.compliance.join(', ')}</span>
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
              { id: 'data-types', label: 'Data Types', icon: '📊' },
              { id: 'retention', label: 'Retention', icon: '🗄️' },
              { id: 'processing', label: 'Processing', icon: '⚙️' },
              { id: 'rights', label: 'Data Rights', icon: '⚖️' }
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
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedPolicy.name}
                </h3>
                <p className="text-gray-600 mb-6">{selectedPolicy.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Policy Scope */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Policy Scope</h4>
                    <div className="space-y-2">
                      {selectedPolicy.scope.map((scope, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-sm text-gray-700">{scope}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Frameworks */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Compliance Frameworks</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPolicy.compliance.map((framework, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {framework}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedPolicy.dataTypes.length}</div>
                    <div className="text-sm text-gray-600">Data Types</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedPolicy.processing.length}</div>
                    <div className="text-sm text-gray-600">Processing Activities</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedPolicy.rights.length}</div>
                    <div className="text-sm text-gray-600">Data Rights</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedPolicy.retention.defaultPeriod}</div>
                    <div className="text-sm text-gray-600">Default Retention (days)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-types' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Data Types</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as DataCategory | 'all')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="personal">Personal</option>
                    <option value="sensitive">Sensitive</option>
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  <select
                    value={filterSensitivity}
                    onChange={(e) => setFilterSensitivity(e.target.value as DataSensitivity | 'all')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sensitivity Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredDataTypes.map((dataType) => (
                  <div key={dataType.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getCategoryIcon(dataType.category)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{dataType.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{dataType.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSensitivityColor(dataType.sensitivity)}`}>
                          {dataType.sensitivity.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {dataType.category}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Retention Period:</span>
                          <span className="text-gray-600">{dataType.retention} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Encryption:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dataType.encryption 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {dataType.encryption ? 'Required' : 'Not Required'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Anonymization:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dataType.anonymization 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dataType.anonymization ? 'Required' : 'Not Required'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Category:</span>
                          <span className="text-gray-600">{dataType.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDataTypes.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🔍</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No Data Types Found</h4>
                  <p className="text-gray-600">No data types match the selected filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'retention' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Data Retention Policy</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">General Settings</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Default Period:</span>
                      <span className="text-gray-600">{selectedPolicy.retention.defaultPeriod} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Automated Deletion:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPolicy.retention.deletion.automated 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPolicy.retention.deletion.automated ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Deletion Frequency:</span>
                      <span className="text-gray-600">{selectedPolicy.retention.deletion.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Archival:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPolicy.retention.archival.enabled 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPolicy.retention.archival.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Archival Settings */}
                {selectedPolicy.retention.archival.enabled && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Archival Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="text-gray-600">{selectedPolicy.retention.archival.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Encryption:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedPolicy.retention.archival.encryption 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedPolicy.retention.archival.encryption ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Access Roles:</span>
                        <div className="mt-1 space-y-1">
                          {selectedPolicy.retention.archival.access.map((role, index) => (
                            <div key={index} className="px-2 py-1 bg-white text-blue-800 text-xs rounded">
                              {role}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Criteria:</span>
                        <div className="mt-1 space-y-1">
                          {selectedPolicy.retention.archival.criteria.map((criteria, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              • {criteria}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category-Specific Retention */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Category-Specific Retention</h4>
                <div className="grid gap-4">
                  {selectedPolicy.retention.categories.map((category, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{category.dataType}</h5>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {category.period} days
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.reason}</p>
                      {category.exceptions.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Exceptions:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {category.exceptions.map((exception, exIndex) => (
                              <span key={exIndex} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                {exception}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'processing' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Processing Activities</h3>
              
              <div className="grid gap-4">
                {selectedPolicy.processing.map((activity) => (
                  <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {activity.legalBasis}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {activity.retention} days
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Purpose</h5>
                        <div className="space-y-1">
                          {activity.purpose.map((purpose, index) => (
                            <div key={index} className="text-sm text-gray-700">
                              • {purpose}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Data Types</h5>
                        <div className="flex flex-wrap gap-1">
                          {activity.dataTypes.map((dataType, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              {dataType}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {activity.sharing.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Data Sharing</h5>
                        <div className="space-y-2">
                          {activity.sharing.map((sharing, index) => (
                            <div key={index} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm text-gray-900">{sharing.recipient}</span>
                                <span className="text-xs text-gray-500">{sharing.agreement}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{sharing.purpose}</p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Safeguards:</span>
                                <div className="flex flex-wrap gap-1">
                                  {sharing.safeguards.map((safeguard, sgIndex) => (
                                    <span key={sgIndex} className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                      {safeguard}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rights' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Data Subject Rights</h3>
              
              <div className="grid gap-4">
                {selectedPolicy.rights.map((right, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getRightIcon(right.right)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">
                            Right to {right.right}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{right.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          right.automation 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {right.automation ? 'Automated' : 'Manual'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {right.timeline} days
                        </span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Process</h5>
                      <div className="space-y-2">
                        {right.process.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                              {stepIndex + 1}
                            </div>
                            <span className="text-sm text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
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

export default DataPrivacyPolicyManager