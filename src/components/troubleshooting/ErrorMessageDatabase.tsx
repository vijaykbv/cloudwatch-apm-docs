'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorMessage, ErrorCategory } from '../../types/troubleshooting'
import { errorMessages, searchErrorMessages, getErrorMessagesByCategory } from '../../data/troubleshooting-data'

interface ErrorMessageDatabaseProps {
  className?: string
}

export default function ErrorMessageDatabase({ className = '' }: ErrorMessageDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'all'>('all')
  const [filteredErrors, setFilteredErrors] = useState<ErrorMessage[]>([])
  const [selectedError, setSelectedError] = useState<ErrorMessage | null>(null)

  const categories: ErrorCategory[] = [
    'client', 'server', 'network', 'authentication', 
    'authorization', 'configuration', 'data'
  ]

  useEffect(() => {
    let errors: ErrorMessage[] = []

    if (searchQuery) {
      errors = searchErrorMessages(searchQuery)
    } else {
      if (selectedCategory !== 'all') {
        errors = getErrorMessagesByCategory(selectedCategory)
      } else {
        errors = errorMessages
      }
    }

    // Sort by severity (critical first) then by code
    errors.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      return a.code.localeCompare(b.code)
    })

    setFilteredErrors(errors)
  }, [searchQuery, selectedCategory])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: ErrorCategory) => {
    const icons = {
      client: '💻',
      server: '🖥️',
      network: '🌐',
      authentication: '🔐',
      authorization: '🛡️',
      configuration: '⚙️',
      data: '📊'
    }
    return icons[category] || '❓'
  }

  const getCategoryColor = (category: ErrorCategory) => {
    const colors = {
      client: 'bg-blue-100 text-blue-800',
      server: 'bg-red-100 text-red-800',
      network: 'bg-green-100 text-green-800',
      authentication: 'bg-purple-100 text-purple-800',
      authorization: 'bg-yellow-100 text-yellow-800',
      configuration: 'bg-gray-100 text-gray-800',
      data: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (selectedError) {
    return (
      <div className={`error-message-database ${className}`}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{getCategoryIcon(selectedError.category)}</span>
                <h2 className="text-2xl font-bold text-gray-900">{selectedError.code}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedError.severity)}`}>
                  {selectedError.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600">{selectedError.description}</p>
            </div>
            <Button
              onClick={() => setSelectedError(null)}
              variant="outline"
              size="sm"
            >
              ← Back to Search
            </Button>
          </div>

          {/* Error Message */}
          <Card className="p-4 mb-6 border-l-4 border-red-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Message</h3>
            <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
              <code className="text-red-600">{selectedError.message}</code>
            </pre>
          </Card>

          {/* Category and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedError.category)}`}>
                <span className="mr-2">{getCategoryIcon(selectedError.category)}</span>
                {selectedError.category.charAt(0).toUpperCase() + selectedError.category.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Severity</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedError.severity)}`}>
                {selectedError.severity.charAt(0).toUpperCase() + selectedError.severity.slice(1)}
              </span>
            </div>
          </div>

          {/* Common Causes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Causes</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {selectedError.commonCauses.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Solutions</h3>
            <div className="space-y-3">
              {selectedError.solutions.map((solution, index) => (
                <Card key={index} className="p-4 border-l-4 border-green-400">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{solution}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Related Errors */}
          {selectedError.relatedErrors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Errors</h3>
              <div className="flex flex-wrap gap-2">
                {selectedError.relatedErrors.map((relatedCode, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const relatedError = errorMessages.find(e => e.code === relatedCode)
                      if (relatedError) setSelectedError(relatedError)
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {relatedCode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documentation Links */}
          {selectedError.documentationLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentation Links</h3>
              <div className="space-y-2">
                {selectedError.documentationLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    className="block text-blue-600 hover:text-blue-800 text-sm underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📖 {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className={`error-message-database ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Message Database</h1>
        <p className="text-lg text-gray-600">
          Search for specific error messages to find causes and solutions.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="error-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Error Messages
            </label>
            <Input
              id="error-search"
              type="text"
              placeholder="Search by error code, message, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="error-category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="error-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ErrorCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery ? `Search Results (${filteredErrors.length})` : `All Errors (${filteredErrors.length})`}
          </h2>
        </div>

        {filteredErrors.length > 0 ? (
          <div className="grid gap-4">
            {filteredErrors.map(error => (
              <Card key={error.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div onClick={() => setSelectedError(error)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(error.category)}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{error.code}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(error.category)}`}>
                            {error.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{error.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                      {error.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                      <code className="text-red-600">{error.message}</code>
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{error.solutions.length} solution{error.solutions.length !== 1 ? 's' : ''}</span>
                      <span>{error.commonCauses.length} cause{error.commonCauses.length !== 1 ? 's' : ''}</span>
                      {error.relatedErrors.length > 0 && (
                        <span>{error.relatedErrors.length} related</span>
                      )}
                    </div>
                    <span className="text-blue-600">Click to view details →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Errors Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or category filter.
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}