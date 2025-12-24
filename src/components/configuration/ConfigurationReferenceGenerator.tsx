import React, { useState, useMemo } from 'react'
import { ConfigurationSchema, ConfigurationParameter, ConfigurationCategory } from '../../types/configuration'
import { CLOUDWATCH_APM_SCHEMA } from '../../data/configuration-schema'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ConfigurationReferenceGeneratorProps {
  schema?: ConfigurationSchema
  selectedPlatforms?: string[]
  selectedEnvironment?: string
  onParameterSelect?: (parameter: ConfigurationParameter) => void
}

interface FilterOptions {
  category: string
  platform: string
  environment: string
  required: boolean | null
  deprecated: boolean
  searchTerm: string
}

const ConfigurationReferenceGenerator: React.FC<ConfigurationReferenceGeneratorProps> = ({
  schema = CLOUDWATCH_APM_SCHEMA,
  selectedPlatforms = [],
  selectedEnvironment = 'all',
  onParameterSelect
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    platform: 'all',
    environment: selectedEnvironment,
    required: null,
    deprecated: false,
    searchTerm: ''
  })
  const [selectedParameter, setSelectedParameter] = useState<ConfigurationParameter | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'table' | 'schema'>('list')

  // Filter parameters based on current filters
  const filteredParameters = useMemo(() => {
    return schema.parameters.filter(param => {
      // Category filter
      if (filters.category !== 'all' && param.category.id !== filters.category) {
        return false
      }

      // Platform filter
      if (filters.platform !== 'all') {
        if (!param.platform || !param.platform.includes(filters.platform)) {
          return false
        }
      }

      // Environment filter
      if (filters.environment !== 'all') {
        if (param.environment && !param.environment.includes(filters.environment)) {
          return false
        }
      }

      // Required filter
      if (filters.required !== null && param.required !== filters.required) {
        return false
      }

      // Deprecated filter
      if (!filters.deprecated && param.deprecated) {
        return false
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesName = param.name.toLowerCase().includes(searchLower)
        const matchesDescription = param.description.toLowerCase().includes(searchLower)
        const matchesCategory = param.category.name.toLowerCase().includes(searchLower)
        
        if (!matchesName && !matchesDescription && !matchesCategory) {
          return false
        }
      }

      return true
    })
  }, [schema.parameters, filters])

  // Group parameters by category
  const parametersByCategory = useMemo(() => {
    const grouped = new Map<string, ConfigurationParameter[]>()
    
    filteredParameters.forEach(param => {
      const categoryId = param.category.id
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, [])
      }
      grouped.get(categoryId)!.push(param)
    })

    return grouped
  }, [filteredParameters])

  const updateFilter = (key: keyof FilterOptions, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleParameterClick = (parameter: ConfigurationParameter) => {
    setSelectedParameter(parameter)
    onParameterSelect?.(parameter)
  }

  const generateDocumentation = () => {
    const markdown = generateMarkdownDocumentation(filteredParameters, schema)
    downloadFile(markdown, 'cloudwatch-apm-configuration.md', 'text/markdown')
  }

  const generateSchema = () => {
    const jsonSchema = generateJsonSchema(filteredParameters)
    downloadFile(JSON.stringify(jsonSchema, null, 2), 'cloudwatch-apm-schema.json', 'application/json')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderParameterList = () => (
    <div className="space-y-6">
      {Array.from(parametersByCategory.entries()).map(([categoryId, parameters]) => {
        const category = schema.categories.find(c => c.id === categoryId)
        if (!category) return null

        return (
          <Card key={categoryId} title={`${category.icon} ${category.name}`}>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <div className="space-y-3">
              {parameters.map(param => (
                <div
                  key={param.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedParameter?.id === param.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleParameterClick(param)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {param.name}
                        </code>
                        <span className={`text-xs px-2 py-1 rounded ${
                          param.type === 'string' ? 'bg-green-100 text-green-800' :
                          param.type === 'number' ? 'bg-blue-100 text-blue-800' :
                          param.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {param.type}
                        </span>
                        {param.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                        {param.deprecated && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Deprecated
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">{param.description}</p>
                      {param.defaultValue !== undefined && (
                        <p className="text-gray-500 text-xs mt-1">
                          Default: <code>{String(param.defaultValue)}</code>
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400 ml-4">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )

  const renderParameterTable = () => (
    <Card title="Configuration Parameters">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Parameter</th>
              <th className="text-left py-2 px-3">Type</th>
              <th className="text-left py-2 px-3">Required</th>
              <th className="text-left py-2 px-3">Default</th>
              <th className="text-left py-2 px-3">Description</th>
              <th className="text-left py-2 px-3">Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredParameters.map(param => (
              <tr
                key={param.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleParameterClick(param)}
              >
                <td className="py-2 px-3">
                  <code className="text-xs bg-gray-100 px-1 rounded">{param.name}</code>
                  {param.deprecated && (
                    <span className="ml-1 text-xs text-yellow-600">⚠️</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    param.type === 'string' ? 'bg-green-100 text-green-800' :
                    param.type === 'number' ? 'bg-blue-100 text-blue-800' :
                    param.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {param.type}
                  </span>
                </td>
                <td className="py-2 px-3">
                  {param.required ? (
                    <span className="text-red-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {param.defaultValue !== undefined ? (
                    <code className="text-xs">{String(param.defaultValue)}</code>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-2 px-3 max-w-xs truncate" title={param.description}>
                  {param.description}
                </td>
                <td className="py-2 px-3">
                  <span className="text-xs text-gray-600">{param.category.name}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )

  const renderSchemaView = () => (
    <Card title="JSON Schema">
      <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
        <pre><code>{JSON.stringify(generateJsonSchema(filteredParameters), null, 2)}</code></pre>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuration Reference</h2>
            <p className="text-gray-600">
              {schema.name} - {filteredParameters.length} parameters
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={generateDocumentation} variant="outline" size="sm">
              Export Docs
            </Button>
            <Button onClick={generateSchema} variant="outline" size="sm">
              Export Schema
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              placeholder="Search parameters..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {schema.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => updateFilter('platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Platforms</option>
              {schema.platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required
            </label>
            <select
              value={filters.required === null ? 'all' : filters.required.toString()}
              onChange={(e) => updateFilter('required', e.target.value === 'all' ? null : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Parameters</option>
              <option value="true">Required Only</option>
              <option value="false">Optional Only</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'table' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('schema')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'schema' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Schema View
          </button>
        </div>
      </Card>

      {/* Content */}
      {viewMode === 'list' && renderParameterList()}
      {viewMode === 'table' && renderParameterTable()}
      {viewMode === 'schema' && renderSchemaView()}

      {/* Parameter Detail Modal */}
      {selectedParameter && (
        <ParameterDetailModal
          parameter={selectedParameter}
          onClose={() => setSelectedParameter(null)}
        />
      )}
    </div>
  )
}

// Parameter detail modal component
interface ParameterDetailModalProps {
  parameter: ConfigurationParameter
  onClose: () => void
}

const ParameterDetailModal: React.FC<ParameterDetailModalProps> = ({ parameter, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Parameter Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                  {parameter.name}
                </code>
                <span className={`text-sm px-2 py-1 rounded ${
                  parameter.type === 'string' ? 'bg-green-100 text-green-800' :
                  parameter.type === 'number' ? 'bg-blue-100 text-blue-800' :
                  parameter.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {parameter.type}
                </span>
                {parameter.required && (
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
              <p className="text-gray-700">{parameter.description}</p>
            </div>

            {/* Configuration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Category:</dt>
                    <dd className="font-medium">{parameter.category.name}</dd>
                  </div>
                  {parameter.defaultValue !== undefined && (
                    <div>
                      <dt className="text-gray-600">Default Value:</dt>
                      <dd><code>{String(parameter.defaultValue)}</code></dd>
                    </div>
                  )}
                  {parameter.validValues && (
                    <div>
                      <dt className="text-gray-600">Valid Values:</dt>
                      <dd>
                        {parameter.validValues.map((value, index) => (
                          <code key={index} className="mr-2">{String(value)}</code>
                        ))}
                      </dd>
                    </div>
                  )}
                  {parameter.platform && (
                    <div>
                      <dt className="text-gray-600">Platforms:</dt>
                      <dd>{parameter.platform.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {parameter.validationRules && parameter.validationRules.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Validation Rules</h4>
                  <ul className="space-y-1 text-sm">
                    {parameter.validationRules.map((rule, index) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">{rule.type}:</span> {rule.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Examples */}
            {parameter.examples.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parameter.examples.map(example => (
                    <div key={example.id} className="border rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-1">{example.title}</h5>
                      <p className="text-gray-600 text-sm mb-2">{example.description}</p>
                      <div className="bg-gray-100 p-2 rounded text-sm">
                        <code>{String(example.value)}</code>
                      </div>
                      {example.useCase && (
                        <p className="text-xs text-gray-500 mt-1">
                          Use case: {example.useCase}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Parameters */}
            {parameter.relatedParameters && parameter.relatedParameters.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Related Parameters</h4>
                <div className="flex flex-wrap gap-2">
                  {parameter.relatedParameters.map(relatedId => (
                    <code key={relatedId} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {relatedId}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Deprecation Warning */}
            {parameter.deprecated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <h4 className="font-medium text-yellow-800">Deprecated Parameter</h4>
                </div>
                {parameter.deprecationMessage && (
                  <p className="text-yellow-700 mt-1">{parameter.deprecationMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
const generateMarkdownDocumentation = (parameters: ConfigurationParameter[], schema: ConfigurationSchema): string => {
  const lines = [
    `# ${schema.name}`,
    '',
    schema.description,
    '',
    `**Version:** ${schema.version}`,
    `**Last Updated:** ${schema.lastUpdated.toISOString().split('T')[0]}`,
    '',
    '## Parameters',
    ''
  ]

  // Group by category
  const byCategory = new Map<string, ConfigurationParameter[]>()
  parameters.forEach(param => {
    const categoryId = param.category.id
    if (!byCategory.has(categoryId)) {
      byCategory.set(categoryId, [])
    }
    byCategory.get(categoryId)!.push(param)
  })

  byCategory.forEach((params, categoryId) => {
    const category = schema.categories.find(c => c.id === categoryId)
    if (!category) return

    lines.push(`### ${category.name}`)
    lines.push('')
    lines.push(category.description)
    lines.push('')

    params.forEach(param => {
      lines.push(`#### \`${param.name}\``)
      lines.push('')
      lines.push(`**Type:** \`${param.type}\``)
      lines.push(`**Required:** ${param.required ? 'Yes' : 'No'}`)
      if (param.defaultValue !== undefined) {
        lines.push(`**Default:** \`${param.defaultValue}\``)
      }
      lines.push('')
      lines.push(param.description)
      lines.push('')

      if (param.examples.length > 0) {
        lines.push('**Examples:**')
        lines.push('')
        param.examples.forEach(example => {
          lines.push(`- **${example.title}:** \`${example.value}\` - ${example.description}`)
        })
        lines.push('')
      }
    })
  })

  return lines.join('\n')
}

const generateJsonSchema = (parameters: ConfigurationParameter[]) => {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  parameters.forEach(param => {
    const property: Record<string, unknown> = {
      type: param.type,
      description: param.description
    }

    if (param.defaultValue !== undefined) {
      property.default = param.defaultValue
    }

    if (param.validValues) {
      property.enum = param.validValues
    }

    if (param.validationRules) {
      param.validationRules.forEach(rule => {
        switch (rule.type) {
          case 'min':
            if (param.type === 'string') {
              property.minLength = rule.value
            } else if (param.type === 'number') {
              property.minimum = rule.value
            }
            break
          case 'max':
            if (param.type === 'string') {
              property.maxLength = rule.value
            } else if (param.type === 'number') {
              property.maximum = rule.value
            }
            break
          case 'pattern':
            property.pattern = rule.value
            break
        }
      })
    }

    properties[param.name] = property

    if (param.required) {
      required.push(param.name)
    }
  })

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    title: 'CloudWatch APM Configuration',
    description: 'Configuration schema for CloudWatch Application Performance Monitoring',
    properties,
    required
  }
}

export default ConfigurationReferenceGenerator