'use client'

import React, { useState, useMemo } from 'react'
import { SampleApplication, ProgrammingLanguage, ExampleCategory } from '../../types/examples'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface SampleApplicationGalleryProps {
  applications: SampleApplication[]
  className?: string
}

const categoryLabels: Record<ExampleCategory, string> = {
  'getting-started': 'Getting Started',
  'integration': 'Integration',
  'configuration': 'Configuration',
  'monitoring': 'Monitoring',
  'troubleshooting': 'Troubleshooting',
  'performance': 'Performance',
  'security': 'Security',
  'deployment': 'Deployment',
  'testing': 'Testing',
  'best-practices': 'Best Practices'
}

const languageLabels: Record<ProgrammingLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  shell: 'Shell',
  yaml: 'YAML',
  json: 'JSON',
  dockerfile: 'Dockerfile'
}

const complexityColors = {
  simple: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  complex: 'bg-red-100 text-red-800 border-red-200'
}

export function SampleApplicationGallery({ applications, className = '' }: SampleApplicationGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<ExampleCategory | 'all'>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<'simple' | 'moderate' | 'complex' | 'all'>('all')

  // Get unique values for filters
  const languages = useMemo(() => {
    const langs = Array.from(new Set(applications.map(app => app.language)))
    return langs.sort()
  }, [applications])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(applications.map(app => app.category)))
    return cats.sort()
  }, [applications])

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.useCase.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLanguage = selectedLanguage === 'all' || app.language === selectedLanguage
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
      const matchesComplexity = selectedComplexity === 'all' || app.metadata.complexity === selectedComplexity

      return matchesSearch && matchesLanguage && matchesCategory && matchesComplexity
    })
  }, [applications, searchTerm, selectedLanguage, selectedCategory, selectedComplexity])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedLanguage('all')
    setSelectedCategory('all')
    setSelectedComplexity('all')
  }

  const downloadApplication = (app: SampleApplication) => {
    window.open(app.downloadUrl, '_blank')
  }

  const viewRepository = (app: SampleApplication) => {
    if (app.repositoryUrl) {
      window.open(app.repositoryUrl, '_blank')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sample Applications</h2>
        <p className="text-gray-600">
          Download complete sample applications demonstrating CloudWatch APM integration patterns and best practices.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search applications by name, description, use case, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as ProgrammingLanguage | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Languages</option>
                {languages.map(language => (
                  <option key={language} value={language}>
                    {languageLabels[language]}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ExampleCategory | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complexity
              </label>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value as 'simple' | 'moderate' | 'complex' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredApplications.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                <p>Try adjusting your search terms or filters to find relevant applications.</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{app.name}</h3>
                    <p className="text-gray-600 text-sm">{app.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${complexityColors[app.metadata.complexity]}`}>
                      {app.metadata.complexity}
                    </span>
                    <span className="text-xs text-gray-500">{app.metadata.size}</span>
                  </div>
                </div>

                {/* Technology Stack */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Language:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {languageLabels[app.language]}
                    </span>
                  </div>
                  {app.framework && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">Framework:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {app.framework}
                      </span>
                    </div>
                  )}
                </div>

                {/* Use Case */}
                <div>
                  <span className="font-medium text-gray-700 text-sm">Use Case:</span>
                  <p className="text-gray-600 text-sm mt-1">{app.useCase}</p>
                </div>

                {/* Features */}
                <div>
                  <span className="font-medium text-gray-700 text-sm">Key Features:</span>
                  <ul className="mt-2 space-y-1">
                    {app.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                    {app.features.length > 4 && (
                      <li className="text-sm text-gray-500">
                        +{app.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Prerequisites */}
                <div>
                  <span className="font-medium text-gray-700 text-sm">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {app.prerequisites.slice(0, 3).map((prereq, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {prereq}
                      </span>
                    ))}
                    {app.prerequisites.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{app.prerequisites.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Setup Time */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Setup Time:</span>
                    <span className="ml-2 text-gray-600">~{app.metadata.estimatedSetupTime} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-600">{categoryLabels[app.category]}</span>
                  </div>
                </div>

                {/* Tags */}
                {app.tags.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {app.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => downloadApplication(app)}
                    className="flex-1"
                  >
                    Download
                  </Button>
                  {app.repositoryUrl && (
                    <Button
                      variant="outline"
                      onClick={() => viewRepository(app)}
                      className="flex-1"
                    >
                      View Code
                    </Button>
                  )}
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 text-center">
                  Last updated: {app.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}