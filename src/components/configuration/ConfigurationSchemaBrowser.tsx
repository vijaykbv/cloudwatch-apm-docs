import React, { useState, useMemo } from 'react'
import { ConfigurationSchema, ConfigurationParameter, ConfigurationCategory } from '../../types/configuration'
import { CLOUDWATCH_APM_SCHEMA } from '../../data/configuration-schema'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ConfigurationSchemaBrowserProps {
  schema?: ConfigurationSchema
  onParameterSelect?: (parameter: ConfigurationParameter) => void
  onCategorySelect?: (category: ConfigurationCategory) => void
}

interface SchemaView {
  type: 'tree' | 'graph' | 'table' | 'json'
}

interface TreeNode {
  id: string
  name: string
  type: 'category' | 'parameter'
  data: ConfigurationCategory | ConfigurationParameter
  children?: TreeNode[]
  expanded?: boolean
}

const ConfigurationSchemaBrowser: React.FC<ConfigurationSchemaBrowserProps> = ({
  schema = CLOUDWATCH_APM_SCHEMA,
  onParameterSelect,
  onCategorySelect
}) => {
  const [viewMode, setViewMode] = useState<SchemaView['type']>('tree')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']))
  const [searchTerm, setSearchTerm] = useState('')

  // Build tree structure
  const treeData = useMemo(() => {
    const root: TreeNode = {
      id: 'root',
      name: schema.name,
      type: 'category',
      data: {
        id: 'root',
        name: schema.name,
        description: schema.description,
        order: 0
      },
      children: []
    }

    // Add categories as top-level nodes
    schema.categories.forEach(category => {
      const categoryNode: TreeNode = {
        id: category.id,
        name: category.name,
        type: 'category',
        data: category,
        children: []
      }

      // Add parameters under each category
      const categoryParams = schema.parameters.filter(p => p.category.id === category.id)
      categoryParams.forEach(param => {
        const paramNode: TreeNode = {
          id: param.id,
          name: param.name,
          type: 'parameter',
          data: param
        }
        categoryNode.children!.push(paramNode)
      })

      root.children!.push(categoryNode)
    })

    return root
  }, [schema])

  // Filter tree based on search
  const filteredTreeData = useMemo(() => {
    if (!searchTerm) return treeData

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.type === 'parameter' && 
         (node.data as ConfigurationParameter).description.toLowerCase().includes(searchTerm.toLowerCase()))

      if (node.children) {
        const filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(child => child !== null) as TreeNode[]

        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren
          }
        }
      } else if (matchesSearch) {
        return node
      }

      return null
    }

    return filterNode(treeData) || treeData
  }, [treeData, searchTerm])

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node.id)
    
    if (node.type === 'parameter') {
      onParameterSelect?.(node.data as ConfigurationParameter)
    } else if (node.type === 'category') {
      onCategorySelect?.(node.data as ConfigurationCategory)
    }
  }

  const renderTreeView = () => {
    const renderNode = (node: TreeNode, depth = 0): React.ReactNode => {
      const isExpanded = expandedNodes.has(node.id)
      const isSelected = selectedNode === node.id
      const hasChildren = node.children && node.children.length > 0

      return (
        <div key={node.id} className="select-none">
          <div
            className={`flex items-center py-1 px-2 rounded cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => handleNodeSelect(node)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNodeExpansion(node.id)
                }}
                className="mr-1 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            <span className="mr-2">
              {node.type === 'category' ? '📁' : getParameterIcon(node.data as ConfigurationParameter)}
            </span>
            
            <span className="flex-1 text-sm">
              {node.name}
              {node.type === 'parameter' && (
                <span className="ml-2 text-xs text-gray-500">
                  ({(node.data as ConfigurationParameter).type})
                </span>
              )}
            </span>

            {node.type === 'parameter' && (node.data as ConfigurationParameter).required && (
              <span className="text-xs bg-red-100 text-red-800 px-1 rounded ml-2">
                Required
              </span>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div>
              {node.children!.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Card title="Schema Tree">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="max-h-96 overflow-y-auto border rounded">
          {renderNode(filteredTreeData)}
        </div>
      </Card>
    )
  }

  const renderTableView = () => (
    <Card title="Schema Table">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search parameters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-medium">Parameter</th>
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Required</th>
              <th className="text-left py-3 px-4 font-medium">Default</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {schema.parameters
              .filter(param => 
                !searchTerm || 
                param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                param.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(param => (
                <tr
                  key={param.id}
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    selectedNode === param.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNodeSelect({
                    id: param.id,
                    name: param.name,
                    type: 'parameter',
                    data: param
                  })}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="mr-2">{getParameterIcon(param)}</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {param.name}
                      </code>
                      {param.deprecated && (
                        <span className="ml-2 text-yellow-500">⚠️</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      param.type === 'string' ? 'bg-green-100 text-green-800' :
                      param.type === 'number' ? 'bg-blue-100 text-blue-800' :
                      param.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {param.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {param.required ? (
                      <span className="text-red-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {param.defaultValue !== undefined ? (
                      <code className="text-xs bg-gray-100 px-1 rounded">
                        {String(param.defaultValue)}
                      </code>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-600">
                      {param.category.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="truncate" title={param.description}>
                      {param.description}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  )

  const renderJsonView = () => (
    <Card title="JSON Schema">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search in JSON..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 mr-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <Button
          size="sm"
          onClick={() => {
            const jsonString = JSON.stringify(generateJsonSchema(schema), null, 2)
            navigator.clipboard.writeText(jsonString)
          }}
        >
          Copy JSON
        </Button>
      </div>
      <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">
        <pre><code>{JSON.stringify(generateJsonSchema(schema), null, 2)}</code></pre>
      </div>
    </Card>
  )

  const renderGraphView = () => (
    <Card title="Schema Graph">
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">🔗</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Graph View Coming Soon
        </h3>
        <p className="text-gray-600">
          Interactive graph visualization of parameter relationships
        </p>
      </div>
    </Card>
  )

  const renderSelectedNodeDetails = () => {
    if (!selectedNode) return null

    const findNode = (node: TreeNode): TreeNode | null => {
      if (node.id === selectedNode) return node
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(filteredTreeData)
    if (!node) return null

    if (node.type === 'parameter') {
      const param = node.data as ConfigurationParameter
      return (
        <Card title="Parameter Details">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
              </h4>
              <p className="text-gray-700">{param.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-900">Type:</dt>
                <dd className="text-gray-700">{param.type}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Required:</dt>
                <dd className="text-gray-700">{param.required ? 'Yes' : 'No'}</dd>
              </div>
              {param.defaultValue !== undefined && (
                <div>
                  <dt className="font-medium text-gray-900">Default:</dt>
                  <dd className="text-gray-700">
                    <code>{String(param.defaultValue)}</code>
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-gray-900">Category:</dt>
                <dd className="text-gray-700">{param.category.name}</dd>
              </div>
            </div>

            {param.validValues && (
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Valid Values:</h5>
                <div className="flex flex-wrap gap-1">
                  {param.validValues.map((value, index) => (
                    <code key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {String(value)}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {param.examples.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Examples:</h5>
                <div className="space-y-2">
                  {param.examples.map(example => (
                    <div key={example.id} className="border rounded p-3">
                      <h6 className="font-medium text-sm">{example.title}</h6>
                      <p className="text-gray-600 text-sm mb-1">{example.description}</p>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {String(example.value)}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {param.validationRules && param.validationRules.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Validation Rules:</h5>
                <ul className="space-y-1 text-sm">
                  {param.validationRules.map((rule, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-medium">{rule.type}:</span> {rule.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )
    } else {
      const category = node.data as ConfigurationCategory
      return (
        <Card title="Category Details">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </h4>
              <p className="text-gray-700">{category.description}</p>
            </div>

            <div className="text-sm">
              <dt className="font-medium text-gray-900">Parameters in this category:</dt>
              <dd className="text-gray-700 mt-1">
                {schema.parameters.filter(p => p.category.id === category.id).length} parameters
              </dd>
            </div>
          </div>
        </Card>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuration Schema Browser</h2>
            <p className="text-gray-600">
              {schema.name} v{schema.version} - {schema.parameters.length} parameters
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'tree' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              Tree
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'json' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('json')}
            >
              JSON
            </Button>
            <Button
              variant={viewMode === 'graph' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('graph')}
            >
              Graph
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'tree' && renderTreeView()}
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'json' && renderJsonView()}
          {viewMode === 'graph' && renderGraphView()}
        </div>
        
        <div>
          {renderSelectedNodeDetails()}
        </div>
      </div>
    </div>
  )
}

// Helper functions
const getParameterIcon = (param: ConfigurationParameter): string => {
  switch (param.type) {
    case 'string': return '📝'
    case 'number': return '🔢'
    case 'boolean': return '☑️'
    case 'array': return '📋'
    case 'object': return '📦'
    default: return '❓'
  }
}

const generateJsonSchema = (schema: ConfigurationSchema) => {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  schema.parameters.forEach(param => {
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
    title: schema.name,
    description: schema.description,
    version: schema.version,
    properties,
    required
  }
}

export default ConfigurationSchemaBrowser