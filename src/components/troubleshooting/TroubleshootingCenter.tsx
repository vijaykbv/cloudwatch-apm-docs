'use client'

import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import IssueClassifier from './IssueClassifier'
import SolutionDatabase from './SolutionDatabase'
import DiagnosticTools from './DiagnosticTools'
import EscalationPathways from './EscalationPathways'
import { TroubleshootingIssue, IssueCategory, IssueSeverity } from '../../types/troubleshooting'
import { searchTroubleshootingIssues, getTroubleshootingIssuesByCategory, getTroubleshootingIssuesBySeverity } from '../../data/troubleshooting-data'

interface TroubleshootingCenterProps {
  className?: string
}

export default function TroubleshootingCenter({ className = '' }: TroubleshootingCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<IssueSeverity | 'all'>('all')
  const [filteredIssues, setFilteredIssues] = useState<TroubleshootingIssue[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'classify' | 'diagnose' | 'escalate'>('search')
  const [selectedIssue, setSelectedIssue] = useState<TroubleshootingIssue | null>(null)

  const categories: IssueCategory[] = [
    'installation', 'configuration', 'performance', 'connectivity', 
    'authentication', 'data-collection', 'alerting', 'dashboard', 
    'integration', 'billing'
  ]

  const severities: IssueSeverity[] = ['low', 'medium', 'high', 'critical']

  useEffect(() => {
    let issues: TroubleshootingIssue[] = []

    if (searchQuery) {
      issues = searchTroubleshootingIssues(searchQuery) || []
    } else {
      // Get all issues and apply filters
      if (selectedCategory !== 'all') {
        issues = getTroubleshootingIssuesByCategory(selectedCategory) || []
      } else {
        issues = searchTroubleshootingIssues('') || [] // Gets all issues
      }
    }

    if (selectedSeverity !== 'all') {
      issues = issues.filter(issue => issue.severity === selectedSeverity)
    }

    // Sort by severity (critical first) then by title
    if (issues && issues.length > 0) {
      issues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
        if (severityDiff !== 0) return severityDiff
        return a.title.localeCompare(b.title)
      })
    }

    setFilteredIssues(issues)
  }, [searchQuery, selectedCategory, selectedSeverity])

  const handleIssueSelect = (issue: TroubleshootingIssue) => {
    setSelectedIssue(issue)
    setActiveTab('search')
  }

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: IssueCategory) => {
    const icons = {
      installation: '⚙️',
      configuration: '🔧',
      performance: '⚡',
      connectivity: '🌐',
      authentication: '🔐',
      'data-collection': '📊',
      alerting: '🚨',
      dashboard: '📈',
      integration: '🔗',
      billing: '💰'
    }
    return icons[category] || '❓'
  }

  return (
    <div className={`troubleshooting-center ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          CloudWatch APM Troubleshooting Center
        </h1>
        <p className="text-lg text-gray-600">
          Find solutions to common issues, run diagnostic tools, and get help when you need it.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'search', label: 'Search Issues', icon: '🔍' },
          { key: 'classify', label: 'Issue Classifier', icon: '🎯' },
          { key: 'diagnose', label: 'Diagnostic Tools', icon: '🔧' },
          { key: 'escalate', label: 'Get Help', icon: '🆘' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Issues
                </label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by symptoms, error messages, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as IssueCategory | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    id="severity"
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value as IssueSeverity | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Severities</option>
                    {severities.map(severity => (
                      <option key={severity} value={severity}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {searchQuery ? `Search Results (${filteredIssues.length})` : `All Issues (${filteredIssues.length})`}
              </h2>
              {selectedIssue && (
                <Button
                  onClick={() => setSelectedIssue(null)}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
              )}
            </div>

            {selectedIssue ? (
              <SolutionDatabase issue={selectedIssue} />
            ) : (
              <div className="grid gap-4">
                {filteredIssues.map(issue => (
                  <Card key={issue.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div onClick={() => handleIssueSelect(issue)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                            <p className="text-sm text-gray-600">{issue.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Common Symptoms:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {issue.symptoms.slice(0, 3).map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                          ))}
                          {issue.symptoms.length > 3 && (
                            <li className="text-blue-600">+{issue.symptoms.length - 3} more...</li>
                          )}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{issue.solutions.length} solution{issue.solutions.length !== 1 ? 's' : ''}</span>
                          <span>{issue.affectedComponents.length} component{issue.affectedComponents.length !== 1 ? 's' : ''}</span>
                        </div>
                        <span>Updated {issue.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredIssues.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or filters, or use the Issue Classifier to help identify your problem.
                    </p>
                    <Button onClick={() => setActiveTab('classify')}>
                      Try Issue Classifier
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issue Classifier Tab */}
      {activeTab === 'classify' && (
        <IssueClassifier onIssueIdentified={handleIssueSelect} />
      )}

      {/* Diagnostic Tools Tab */}
      {activeTab === 'diagnose' && (
        <DiagnosticTools />
      )}

      {/* Escalation Tab */}
      {activeTab === 'escalate' && (
        <EscalationPathways />
      )}
    </div>
  )
}