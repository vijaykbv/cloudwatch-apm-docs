'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  DashboardTemplate,
  DashboardCategory,
  DashboardWidget
} from '../../types/monitoring'
import { dashboardTemplates, dashboardCategories } from '../../data/monitoring-data'

interface DashboardTemplateLibraryProps {
  onTemplateSelect?: (template: DashboardTemplate) => void
  onTemplateCustomize?: (template: DashboardTemplate) => void
}

interface FilterState {
  category: string
  difficulty: string
  searchTerm: string
  tags: string[]
}

export function DashboardTemplateLibrary({ 
  onTemplateSelect, 
  onTemplateCustomize 
}: DashboardTemplateLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    searchTerm: '',
    tags: []
  })

  const filteredTemplates = useMemo(() => {
    return dashboardTemplates.filter(template => {
      // Category filter
      if (filters.category && template.category.id !== filters.category) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty && template.difficulty !== filters.difficulty) {
        return false
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesName = template.name.toLowerCase().includes(searchLower)
        const matchesDescription = template.description.toLowerCase().includes(searchLower)
        const matchesUseCase = template.useCase.toLowerCase().includes(searchLower)
        const matchesTags = template.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesName && !matchesDescription && !matchesUseCase && !matchesTags) {
          return false
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag => 
          template.tags.includes(filterTag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      return true
    })
  }, [filters])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    dashboardTemplates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [])

  const handleTemplateSelect = (template: DashboardTemplate) => {
    setSelectedTemplate(template)
  }

  const handleUseTemplate = (template: DashboardTemplate) => {
    onTemplateSelect?.(template)
  }

  const handleCustomizeTemplate = (template: DashboardTemplate) => {
    onTemplateCustomize?.(template)
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (selectedTemplate) {
    return (
      <DashboardTemplateDetail
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onUseTemplate={() => handleUseTemplate(selectedTemplate)}
        onCustomizeTemplate={() => handleCustomizeTemplate(selectedTemplate)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Template Library</h2>
        <p className="text-gray-600">
          Pre-built dashboard templates for common monitoring scenarios. Choose a template to get started quickly.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search templates..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {dashboardCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ category: '', difficulty: '', searchTerm: '', tags: [] })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`
                  px-3 py-1 text-sm rounded-full border transition-colors
                  ${filters.tags.includes(tag)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTemplates.length} of {dashboardTemplates.length} templates
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div onClick={() => handleTemplateSelect(template)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.category.name}</p>
                </div>
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                `}>
                  {template.difficulty}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.description}</p>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Use Case:</div>
                <div className="text-sm text-gray-700">{template.useCase}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Widgets:</div>
                <div className="text-sm text-gray-700">{template.widgets.length} widgets</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Setup Time:</div>
                <div className="text-sm text-gray-700">{template.estimatedSetupTime}</div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{template.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUseTemplate(template)
                }}
                className="flex-1"
              >
                Use Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCustomizeTemplate(template)
                }}
                className="flex-1"
              >
                Customize
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No templates found</div>
          <div className="text-gray-500">Try adjusting your filters or search terms</div>
        </div>
      )}
    </div>
  )
}

function DashboardTemplateDetail({
  template,
  onBack,
  onUseTemplate,
  onCustomizeTemplate
}: {
  template: DashboardTemplate
  onBack: () => void
  onUseTemplate: () => void
  onCustomizeTemplate: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
          <p className="text-gray-600">{template.category.name}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back to Library
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <p className="text-gray-600 mb-4">{template.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Difficulty:</span>
                <span className="ml-2 capitalize">{template.difficulty}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Setup Time:</span>
                <span className="ml-2">{template.estimatedSetupTime}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Widgets:</span>
                <span className="ml-2">{template.widgets.length} widgets</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Variables:</span>
                <span className="ml-2">{template.variables.length} variables</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Use Case</h3>
            <p className="text-gray-600">{template.useCase}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Widgets</h3>
            <div className="space-y-4">
              {template.widgets.map(widget => (
                <WidgetPreview key={widget.id} widget={widget} />
              ))}
            </div>
          </Card>

          {template.variables.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variables</h3>
              <div className="space-y-3">
                {template.variables.map(variable => (
                  <div key={variable.name} className="border-l-4 border-blue-400 pl-4">
                    <div className="font-medium text-gray-900">{variable.label}</div>
                    <div className="text-sm text-gray-600">{variable.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {variable.type} | Default: {variable.defaultValue}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button onClick={onUseTemplate} className="w-full">
                Use This Template
              </Button>
              <Button variant="outline" onClick={onCustomizeTemplate} className="w-full">
                Customize Template
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium text-gray-700">Grid:</span>
                <span className="ml-2">{template.layout.columns} × {template.layout.rows}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Responsive:</span>
                <span className="ml-2">{template.layout.responsive ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function WidgetPreview({ widget }: { widget: DashboardWidget }) {
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'metric': return '📊'
      case 'log': return '📝'
      case 'text': return '📄'
      case 'alarm': return '🚨'
      default: return '📈'
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <span className="text-lg mr-2">{getWidgetIcon(widget.type)}</span>
          <div>
            <h4 className="font-medium text-gray-900">{widget.title}</h4>
            <p className="text-sm text-gray-500 capitalize">{widget.type} widget</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {widget.size.width} × {widget.size.height}
        </div>
      </div>
      
      {widget.description && (
        <p className="text-sm text-gray-600 mb-3">{widget.description}</p>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        {widget.configuration.metrics && (
          <div>Metrics: {widget.configuration.metrics.join(', ')}</div>
        )}
        {widget.configuration.timeRange && (
          <div>Time Range: {widget.configuration.timeRange}</div>
        )}
        {widget.configuration.visualization && (
          <div>Visualization: {widget.configuration.visualization}</div>
        )}
      </div>
    </div>
  )
}