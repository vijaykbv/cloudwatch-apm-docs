'use client'

import React, { useState, useMemo } from 'react'
import { CodeExample, ProgrammingLanguage, ExampleCategory } from '../../types/examples'
import { MultiLanguageCodeExample } from './MultiLanguageCodeExample'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

interface CodeExampleBrowserProps {
  examples: CodeExample[]
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

export function CodeExampleBrowser({ examples, className = '' }: CodeExampleBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExampleCategory | 'all'>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | 'all'>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all')

  // Get unique values for filters
  const categories = useMemo(() => {
    const cats = Array.from(new Set(examples.map(ex => ex.category)))
    return cats.sort()
  }, [examples])

  const languages = useMemo(() => {
    const langs = Array.from(new Set(examples.map(ex => ex.language)))
    return langs.sort()
  }, [examples])

  // Filter examples
  const filteredExamples = useMemo(() => {
    return examples.filter(example => {
      const matchesSearch = searchTerm === '' || 
        example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory
      const matchesLanguage = selectedLanguage === 'all' || example.language === selectedLanguage
      const matchesDifficulty = selectedDifficulty === 'all' || example.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesLanguage && matchesDifficulty
    })
  }, [examples, searchTerm, selectedCategory, selectedLanguage, selectedDifficulty])

  // Group examples by use case for multi-language display
  const groupedExamples = useMemo(() => {
    const groups: Record<string, CodeExample[]> = {}
    
    filteredExamples.forEach(example => {
      const key = `${example.category}-${example.title.replace(/\s+/g, '-').toLowerCase()}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(example)
    })

    return Object.entries(groups).map(([key, exampleGroup]) => ({
      id: key,
      title: exampleGroup[0].title,
      description: exampleGroup[0].description,
      examples: exampleGroup,
      category: exampleGroup[0].category
    }))
  }, [filteredExamples])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedLanguage('all')
    setSelectedDifficulty('all')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Code Examples</h2>
        <p className="text-gray-600">
          Browse comprehensive code examples for CloudWatch APM integration across different languages and frameworks.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="Search examples by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
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

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all' || selectedDifficulty !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Category: {categoryLabels[selectedCategory as ExampleCategory]}
                </span>
              )}
              {selectedLanguage !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  Language: {languageLabels[selectedLanguage as ProgrammingLanguage]}
                </span>
              )}
              {selectedDifficulty !== 'all' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  Difficulty: {selectedDifficulty}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {groupedExamples.length} example group{groupedExamples.length !== 1 ? 's' : ''} 
        ({filteredExamples.length} total example{filteredExamples.length !== 1 ? 's' : ''})
      </div>

      {/* Examples */}
      <div className="space-y-8">
        {groupedExamples.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">No examples found</h3>
              <p>Try adjusting your search terms or filters to find relevant examples.</p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        ) : (
          groupedExamples.map((group) => (
            <MultiLanguageCodeExample
              key={group.id}
              title={group.title}
              description={group.description}
              examples={group.examples}
            />
          ))
        )}
      </div>
    </div>
  )
}